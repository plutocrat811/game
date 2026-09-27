"""
scanners/market_structure.py — Module 1: Operator / Market Structure
Schedule : Daily, 9:15 PM IST (Mon–Fri)
Sources  : NSE bhavcopy CSV, NSE bulk deals API, NSE F&O bhavcopy
AI calls : ZERO — pure numeric rules engine
"""

import httpx
import pandas as pd
import io
from datetime import date, timedelta
from db.client import upsert, fetch_active_universe, get_client
from engine.scorer import score_market_structure, compute_composite

NSE_BHAV_URL  = "https://archives.nseindia.com/products/content/sec_bhavdata_full_{d}.csv"
NSE_BULK_URL  = "https://www.nseindia.com/api/historical/bulk-deals?from={d}&to={d}"
NSE_FO_URL    = "https://archives.nseindia.com/content/fo/fo_mktlots_{d}.csv"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; ArthaScan/1.0)",
    "Accept-Language": "en-US,en;q=0.9"
}

# Maintain this list and grow it over time
KNOWN_INSTITUTIONS = {
    "LIFE INSURANCE CORPORATION OF INDIA",
    "HDFC MUTUAL FUND", "ICICI PRUDENTIAL MUTUAL FUND",
    "SBI MUTUAL FUND", "NIPPON INDIA MUTUAL FUND",
    "KOTAK MUTUAL FUND", "AXIS MUTUAL FUND",
    "UTI MUTUAL FUND", "ADITYA BIRLA SUN LIFE MUTUAL FUND",
    "DSP MUTUAL FUND", "MIRAE ASSET MUTUAL FUND",
    "GOLDMAN SACHS", "MORGAN STANLEY", "JP MORGAN",
    "NOMURA", "MERRILL LYNCH", "CITIGROUP",
}


def _last_trading_day() -> date:
    """Returns today if weekday, else last Friday."""
    today = date.today()
    if today.weekday() >= 5:  # Sat=5, Sun=6
        return today - timedelta(days=today.weekday() - 4)
    return today


def fetch_bhavcopy(trade_date: date) -> pd.DataFrame | None:
    date_str = trade_date.strftime("%d%m%Y")
    url = NSE_BHAV_URL.format(d=date_str)
    try:
        with httpx.Client(headers=HEADERS, timeout=30, follow_redirects=True) as c:
            r = c.get(url)
            r.raise_for_status()
        df = pd.read_csv(io.StringIO(r.text))
        df.columns = df.columns.str.strip()
        print(f"[MarketStructure] Bhavcopy fetched: {len(df)} rows")
        return df
    except Exception as e:
        print(f"[MarketStructure] Bhavcopy fetch failed: {e}")
        return None


def fetch_bulk_deals(trade_date: date) -> list[dict]:
    d = trade_date.strftime("%d-%m-%Y")
    try:
        with httpx.Client(headers=HEADERS, timeout=20) as c:
            r = c.get(NSE_BULK_URL.format(d=d))
            if r.status_code == 200:
                return r.json().get("data", [])
    except Exception as e:
        print(f"[MarketStructure] Bulk deals fetch failed: {e}")
    return []


def compute_20d_avg(isin: str, trade_date: date) -> float | None:
    since = (trade_date - timedelta(days=35)).isoformat()
    rows = get_client().table("daily_market")\
        .select("delivery_pct")\
        .eq("isin", isin)\
        .gte("trade_date", since)\
        .lt("trade_date", trade_date.isoformat())\
        .order("trade_date", desc=True)\
        .limit(20).execute().data
    vals = [r["delivery_pct"] for r in rows if r["delivery_pct"] is not None]
    return round(sum(vals) / len(vals), 2) if len(vals) >= 5 else None


def run(trade_date: date | None = None):
    trade_date = trade_date or _last_trading_day()
    scored_at  = f"{trade_date.isoformat()}T21:15:00+05:30"
    print(f"\n{'='*50}")
    print(f"[MarketStructure] Starting scan for {trade_date}")
    print(f"{'='*50}")

    universe = {s["isin"]: s for s in fetch_active_universe()}
    print(f"[MarketStructure] Universe loaded: {len(universe)} stocks")

    # ── Step 1: Bhavcopy ──────────────────────────────────────────
    bhav = fetch_bhavcopy(trade_date)
    if bhav is None:
        print("[MarketStructure] Aborting — no bhavcopy data")
        return

    market_rows = []
    for _, row in bhav.iterrows():
        isin = str(row.get("ISIN", "")).strip()
        if isin not in universe:
            continue
        try:
            vol   = int(str(row.get("TTL_TRD_QNTY", 0)).replace(",", ""))
            deliv = int(str(row.get("DELIV_QTY", 0)).replace(",", ""))
            dpct  = round(deliv / vol * 100, 2) if vol > 0 else 0.0
            avg   = compute_20d_avg(isin, trade_date)
            market_rows.append({
                "isin"                  : isin,
                "trade_date"            : trade_date.isoformat(),
                "close"                 : float(row.get("CLOSE_PRICE", 0)),
                "prev_close"            : float(row.get("PREVCLOSE", 0)),
                "volume"                : vol,
                "delivery_qty"          : deliv,
                "delivery_pct"          : dpct,
                "delivery_pct_20d_avg"  : avg,
            })
        except Exception:
            continue

    if market_rows:
        upsert("daily_market", market_rows, on_conflict="isin,trade_date")
        print(f"[MarketStructure] Saved {len(market_rows)} daily_market rows")

    # ── Step 2: Bulk deals ────────────────────────────────────────
    deal_rows = []
    for d in fetch_bulk_deals(trade_date):
        isin = str(d.get("isin", "")).strip()
        if isin not in universe:
            continue
        client_name = str(d.get("clientName", "")).upper().strip()
        deal_rows.append({
            "isin"                  : isin,
            "trade_date"            : trade_date.isoformat(),
            "deal_type"             : "BULK",
            "client_name"           : client_name,
            "buy_sell"              : str(d.get("buySell", "")).upper(),
            "qty"                   : int(d.get("quantityTraded", 0)),
            "price"                 : float(d.get("tradePrice", 0)),
            "is_known_institution"  : client_name in KNOWN_INSTITUTIONS,
        })

    if deal_rows:
        upsert("bulk_deals", deal_rows, on_conflict=None)
        print(f"[MarketStructure] Saved {len(deal_rows)} bulk deal rows")

    # ── Step 3: Score every stock ─────────────────────────────────
    tier1_count = 0
    scored_count = 0
    for isin, meta in universe.items():
        score, signals = score_market_structure(isin, trade_date)
        if score is None:
            continue
        upsert("module_scores", {
            "isin"      : isin,
            "scored_at" : scored_at,
            "module"    : "market_structure",
            "score"     : score,
            "signals"   : signals,
        }, on_conflict="isin,scored_at,module")
        scored_count += 1

        # Pull all available module scores for this stock and compute composite
        all_scores = get_client().table("module_scores")\
            .select("module,score")\
            .eq("isin", isin)\
            .eq("scored_at", scored_at)\
            .execute().data
        module_map = {r["module"]: r["score"] for r in all_scores}

        tier = compute_composite(
            isin, meta["company_name"], scored_at, module_map
        )
        if tier == 1:
            tier1_count += 1

    print(f"\n[MarketStructure] Done.")
    print(f"  Stocks scored     : {scored_count}")
    print(f"  Tier 1 signals    : {tier1_count}")
    print(f"  Tier 1 alerts sent via Telegram")


if __name__ == "__main__":
    run()
