"""
engine/rate_limiter.py — Two-bucket token rate limiter.

Minute bucket : 15 tokens, refills every 60 seconds
Day bucket    : 1000 tokens, refills at midnight UTC

Every outbound API call (Gemini or search) must call limiter.acquire()
before firing. If the minute bucket is empty, acquire() sleeps and waits.
If the day bucket is empty, it raises DailyLimitExceeded and the job stops.

Day-bucket state is persisted to Supabase so a process restart mid-day
does not accidentally reset the counter and overshoot the daily ceiling.
"""

import time
from datetime import datetime, date, timezone
from db.client import get_client


class DailyLimitExceeded(Exception):
    pass


class TokenBucket:
    MINUTE_LIMIT = 15
    DAY_LIMIT = 1000

    def __init__(self, bucket_name: str = "gemini"):
        self.bucket_name = bucket_name
        self.minute_tokens = self.MINUTE_LIMIT
        self.day_tokens = self.DAY_LIMIT
        self.last_minute_refill = time.time()
        self.current_day = date.today()
        self._load_day_state()

    # ── Persistence ──────────────────────────────────────────────

    def _load_day_state(self):
        """On startup, restore today's remaining day-bucket tokens from DB."""
        try:
            result = get_client()\
                .table("rate_limiter_state")\
                .select("tokens_remaining,last_refill")\
                .eq("bucket_name", f"{self.bucket_name}_day")\
                .limit(1).execute()
            if result.data:
                row = result.data[0]
                stored_day = datetime.fromisoformat(row["last_refill"]).date()
                if stored_day == date.today():
                    self.day_tokens = row["tokens_remaining"]
                    print(f"[RateLimiter] Restored day tokens: {self.day_tokens}")
        except Exception as e:
            print(f"[RateLimiter] Could not load state from DB: {e}. Starting fresh.")

    def _save_day_state(self):
        """Write current day-bucket state to DB after every acquisition."""
        try:
            get_client().table("rate_limiter_state").upsert({
                "bucket_name": f"{self.bucket_name}_day",
                "tokens_remaining": self.day_tokens,
                "last_refill": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }, on_conflict="bucket_name").execute()
        except Exception:
            pass  # Non-fatal — worst case we restart slightly over budget

    # ── Refill logic ─────────────────────────────────────────────

    def _refill_minute(self):
        elapsed = time.time() - self.last_minute_refill
        if elapsed >= 60:
            self.minute_tokens = self.MINUTE_LIMIT
            self.last_minute_refill = time.time()

    def _refill_day(self):
        today = date.today()
        if today != self.current_day:
            self.day_tokens = self.DAY_LIMIT
            self.current_day = today
            self._save_day_state()

    # ── Public interface ─────────────────────────────────────────

    def acquire(self, tokens: int = 1) -> None:
        """
        Block until tokens are available in both buckets, then deduct.
        Raises DailyLimitExceeded if the day budget is exhausted.
        """
        self._refill_day()

        if self.day_tokens < tokens:
            raise DailyLimitExceeded(
                f"Daily API budget exhausted. "
                f"{self.day_tokens} tokens left. Resumes tomorrow."
            )

        while True:
            self._refill_minute()
            if self.minute_tokens >= tokens:
                self.minute_tokens -= tokens
                self.day_tokens -= tokens
                self._save_day_state()
                return
            wait = 60 - (time.time() - self.last_minute_refill)
            if wait > 0:
                print(f"[RateLimiter] Minute bucket full. Waiting {wait:.1f}s…")
                time.sleep(wait + 0.1)

    @property
    def remaining_today(self) -> int:
        self._refill_day()
        return self.day_tokens


# Module-level singleton — import this everywhere
limiter = TokenBucket(bucket_name="gemini")
