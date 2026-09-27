"""
engine/scorer.py — Module scoring and composite triangulation.

All arithmetic is done in Python. No LLM calls anywhere in this file.
The LLM extracts text; the scorer computes the number.
"""

from datetime import date, timedelta
from db.client import get_client, upsert
from engine.alerter import send_alert


# ── Module 1: Market Structure ────────────────────────────────────────────────

def score_market_structure(isin: str, trade_date: date) -> tuple[float | None, dict]:
    client = get_client()
    signals = {}
    points = 0
    max_points = 0

    # Signal 1: Delivery % spike (40 pts)
    row = client.table("daily_market")\
        .select("delivery_pct,delivery_pct_20d_avg,close,prev_close")\
        .eq("isin", isin).eq("trade_date", trade_date.isoformat())\
        .limit(1).execute().data

    if row:
        dpct = row[0].get("delivery_pct")
        avg  = row[0].get("delivery_pct_20d_avg")
        close = row[0].get("close", 0)
        prev  = row[0].get("prev_close", 1)
        price_flat_or_rising = close >= prev

        if dpct and avg and avg > 0:
            ratio = dpct / avg
            signals["delivery_ratio"] = round(ratio, 2)
            max_points += 40
            if ratio >= 2.0 and price_flat_or_rising:
                points += 40     # Strong accumulation
            elif ratio >= 1.5:
                points += 20

    # Signal 2: Unknown bulk buyer (35 pts)
    bulk = client.table("bulk_deals")\
        .select("client_name,is_known_institution")\
        .eq("isin", isin).eq("trade_date", trade_date.isoformat())\
        .eq("buy_sell", "BUY").execute().data

    if bulk:
        unknown = [b["client_name"] for b in bulk if not b["is_known_institution"]]
        signals["unknown_bulk_buyers"] = unknown
        max_points += 35
        if unknown:
            points += 35

    # Signal 3: F&O positioning (25 pts)
    fo = client.table("fo_data")\
        .select("oi_change,pcr")\
        .eq("isin", isin).eq("trade_date", trade_date.isoformat())\
        .limit(1).execute().data

    if fo:
        oi_change = fo[0].get("oi_change", 0)
        pcr = fo[0].get("pcr")
        if pcr is not None:
            signals["oi_change"] = oi_change
            signals["pcr"] = pcr
            max_points += 25
            if oi_change > 0 and pcr < 0.7:
                points += 25     # Rising OI + put-heavy = bullish positioning
            elif oi_change > 0 and pcr < 1.0:
                points += 12

    if max_points == 0:
        return None, {}

    return round((points / max_points) * 100, 1), signals


# ── Module 2: Fundamental Inflection ─────────────────────────────────────────

def score_fundamental(isin: str) -> tuple[float | None, dict]:
    client = get_client()
    signals = {}
    points = 0
    max_points = 100

    # Pull last 4 quarters
    rows = client.table("financials")\
        .select("quarter_end,revenue,ebitda_margin,roce,ocf,pat,total_debt,piotroski_score")\
        .eq("isin", isin).eq("period_type", "quarterly")\
        .order("quarter_end", desc=True).limit(4).execute().data

    if len(rows) < 2:
        return None, {}

    latest = rows[0]
    prev   = rows[1]

    # Revenue acceleration (25 pts)
    if latest["revenue"] and prev["revenue"] and prev["revenue"] > 0:
        rev_growth = (latest["revenue"] - prev["revenue"]) / prev["revenue"] * 100
        signals["rev_qoq_pct"] = round(rev_growth, 1)
        if rev_growth > 15:
            points += 25
        elif rev_growth > 8:
            points += 15

    # Margin expansion (25 pts)
    if latest["ebitda_margin"] and prev["ebitda_margin"]:
        margin_delta = latest["ebitda_margin"] - prev["ebitda_margin"]
        signals["margin_delta_pp"] = round(margin_delta, 2)
        if margin_delta > 2:
            points += 25
        elif margin_delta > 0:
            points += 12

    # ROCE improvement over 2 consecutive quarters (25 pts)
    if len(rows) >= 3 and all(r["roce"] for r in rows[:3]):
        roce_q0, roce_q1, roce_q2 = rows[0]["roce"], rows[1]["roce"], rows[2]["roce"]
        if roce_q0 > roce_q1 > roce_q2:
            signals["roce_improving_3q"] = True
            points += 25

    # OCF > PAT (earnings quality) + Piotroski (25 pts)
    if latest["ocf"] and latest["pat"] and latest["pat"] > 0:
        if latest["ocf"] > latest["pat"]:
            signals["ocf_gt_pat"] = True
            points += 10

    if latest.get("piotroski_score") is not None:
        signals["piotroski"] = latest["piotroski_score"]
        if latest["piotroski_score"] >= 7:
            points += 15

    return round((points / max_points) * 100, 1), signals


# ── Composite triangulation ───────────────────────────────────────────────────

def compute_composite(isin: str, company_name: str, scored_at: str,
                      module_scores: dict[str, float]) -> int:
    """
    Weights each module score, computes composite 0-100,
    determines tier, writes composite_scores row, fires alert if Tier 1.
    Returns the tier.
    """
    WEIGHTS = {
        "market_structure" : 0.30,
        "fundamental"      : 0.25,
        "ownership"        : 0.20,
        "forward_trigger"  : 0.15,
        "macro"            : 0.05,
        "alt_data"         : 0.05,
    }

    weighted_sum = sum(
        module_scores.get(mod, 0) * weight
        for mod, weight in WEIGHTS.items()
    )
    composite = round(weighted_sum, 1)
    modules_firing = sum(1 for s in module_scores.values() if s >= 60)

    if modules_firing >= 3:
        tier = 1
    elif modules_firing == 2:
        tier = 2
    else:
        tier = 3

    upsert("composite_scores", {
        "isin"             : isin,
        "scored_at"        : scored_at,
        "modules_firing"   : modules_firing,
        "composite_score"  : composite,
        "tier"             : tier,
        "module_breakdown" : module_scores
    }, on_conflict="isin,scored_at")

    if tier == 1:
        send_alert(isin, company_name, tier, composite, module_scores)

    return tier
