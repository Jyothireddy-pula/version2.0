import asyncio
import random
import time
import httpx
from bs4 import BeautifulSoup

from app.core.config import settings


USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
]


class BaseScraper:
    source_name = "base"
    base_url = ""

    def headers(self):
        return {
            "User-Agent": random.choice(USER_AGENTS),
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
        }

    async def fetch(self, url: str):
        for attempt in range(settings.scraper_max_retries):
            try:
                async with httpx.AsyncClient(timeout=settings.scraper_timeout_seconds, follow_redirects=True) as client:
                    response = await client.get(url, headers=self.headers())
                    response.raise_for_status()
                    return response.text
            except Exception as e:
                if attempt == settings.scraper_max_retries - 1:
                    raise e
                await asyncio.sleep(2 ** attempt)

    def soup(self, html: str):
        return BeautifulSoup(html, "html.parser")

    async def scrape(self, keyword: str | None = None, region: str | None = None):
        raise NotImplementedError