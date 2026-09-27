"""
engine/alerter.py — Telegram push alert for Tier 1 signals.
Fires from inside the GitHub Actions workflow. No server needed.
"""

import os
import httpx
from datetime import datetime


BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
CHAT_ID   = os.environ.get("TELEGRAM_CHAT_ID", "")
API_URL   = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"


def send_alert(isin: str, company_name: str, tier: int,
               composite_score: float, module_breakdown: dict) -> bool:
    if tier != 1 or not BOT_TOKEN or not CHAT_ID:
        return False

    firing = "\n".join(
        f"  • {mod.replace('_', ' ').title()}: {score:.0f}/100"
        for mod, score in sorted(module_breakdown.items(),
                                 key=lambda x: x[1], reverse=True)
        if score >= 60
    )

    message = (
        f"🚨 *TIER 1 — {company_name}*\n"
        f"`ISIN: {isin}`\n\n"
        f"Composite Score: *{composite_score}/100*\n\n"
        f"Modules firing (≥60):\n{firing}\n\n"
        f"_Flagged: {datetime.now().strftime('%d %b %Y %I:%M %p IST')}_\n\n"
        f"⚠️ _Review before any action. This is a signal, not a trade._"
    )

    try:
        with httpx.Client(timeout=10) as client:
            r = client.post(API_URL, json={
                "chat_id"    : CHAT_ID,
                "text"       : message,
                "parse_mode" : "Markdown"
            })
        if r.status_code == 200:
            print(f"[Alerter] Telegram alert sent for {isin}")
            return True
        else:
            print(f"[Alerter] Telegram failed ({r.status_code}): {r.text}")
            return False
    except Exception as e:
        print(f"[Alerter] Exception sending alert: {e}")
        return False
