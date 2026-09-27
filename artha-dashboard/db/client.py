"""
db/client.py — Supabase connection singleton.
Every other module imports from here. Never create a second client.
"""

import os
from supabase import create_client, Client

_client: Client | None = None


def get_client() -> Client:
    global _client
    if _client is None:
        url = os.environ["SUPABASE_URL"]
        key = os.environ["SUPABASE_KEY"]
        _client = create_client(url, key)
    return _client


def insert(table: str, data: dict | list[dict]) -> list[dict]:
    rows = data if isinstance(data, list) else [data]
    result = get_client().table(table).insert(rows).execute()
    return result.data


def upsert(table: str, data: dict | list[dict], on_conflict: str) -> list[dict]:
    rows = data if isinstance(data, list) else [data]
    result = get_client().table(table).upsert(rows, on_conflict=on_conflict).execute()
    return result.data


def select(table: str, filters: dict = None, columns: str = "*") -> list[dict]:
    query = get_client().table(table).select(columns)
    if filters:
        for key, value in filters.items():
            query = query.eq(key, value)
    return query.execute().data


def fetch_active_universe() -> list[dict]:
    """Returns all active stocks. Called by every scanner on startup."""
    return select(
        "universe",
        filters={"is_active": True},
        columns="isin,symbol_nse,symbol_bse,company_name,sector,is_fo_eligible"
    )
