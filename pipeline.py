import asyncio
import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional
from urllib.parse import urljoin

from bs4 import BeautifulSoup
import httpx
from pydantic import BaseModel, Field, HttpUrl
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("ScraperPipeline")


class ArticleItem(BaseModel):
    url: str
    title: str = Field(..., min_length=1)
    summary: Optional[str] = None
    scraped_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class AsyncFetcher:
    def __init__(self, concurrency_limit: int = 5, delay_between_requests: float = 0.5):
        self.semaphore = asyncio.Semaphore(concurrency_limit)
        self.delay = delay_between_requests
        self.headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/124.0.0.0 Safari/537.36"
            ),
            "Accept-Language": "en-US,en;q=0.9",
        }

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((httpx.RequestError, httpx.HTTPStatusError)),
        reraise=True,
    )
    async def fetch(self, client: httpx.AsyncClient, url: str) -> str:
        async with self.semaphore:
            logger.info("Fetching: %s", url)
            response = await client.get(url, headers=self.headers, follow_redirects=True)
            response.raise_for_status()

            if self.delay > 0:
                await asyncio.sleep(self.delay)

            return response.text


class ContentParser:
    @staticmethod
    def parse(html: str, base_url: str) -> Optional[ArticleItem]:
        soup = BeautifulSoup(html, "lxml")

        title_tag = soup.find("h1") or soup.find("title")
        if not title_tag:
            return None

        title = title_tag.get_text(strip=True)

        meta_desc = soup.find("meta", attrs={"name": "description"})
        if meta_desc and meta_desc.get("content"):
            summary = meta_desc["content"].strip()
        else:
            first_p = soup.find("p")
            summary = first_p.get_text(strip=True) if first_p else None

        return ArticleItem(
            url=base_url,
            title=title,
            summary=summary,
        )


class JSONLinesExporter:
    def __init__(self, output_path: str = "scraped_data.jsonl"):
        self.output_path = Path(output_path)

    async def save(self, items: List[ArticleItem]):
        if not items:
            return
        with open(self.output_path, "a", encoding="utf-8") as f:
            for item in items:
                f.write(item.model_dump_json() + "\n")
        logger.info("Wrote %s records to %s", len(items), self.output_path)


class ScraperPipeline:
    def __init__(self, urls: List[str], concurrency: int = 5, delay: float = 0.5):
        self.urls = urls
        self.fetcher = AsyncFetcher(concurrency_limit=concurrency, delay_between_requests=delay)
        self.parser = ContentParser()
        self.exporter = JSONLinesExporter()

    async def _process_url(self, client: httpx.AsyncClient, url: str) -> Optional[ArticleItem]:
        try:
            html = await self.fetcher.fetch(client, url)
            return self.parser.parse(html, url)
        except Exception as exc:
            logger.error("Failed processing %s: %s", url, exc)
            return None

    async def run(self):
        limits = httpx.Limits(max_keepalive_connections=10, max_connections=20)
        async with httpx.AsyncClient(timeout=15.0, limits=limits) as client:
            tasks = [self._process_url(client, url) for url in self.urls]
            results = await asyncio.gather(*tasks)

        valid_items = [item for item in results if item is not None]
        await self.exporter.save(valid_items)
        logger.info(
            "Pipeline finished. Processed %s / %s successfully.",
            len(valid_items),
            len(self.urls),
        )


if __name__ == "__main__":
    target_urls = [
        "https://quotes.toscrape.com/",
        "https://httpbin.org/html",
    ]

    pipeline = ScraperPipeline(urls=target_urls, concurrency=3, delay=0.2)
    asyncio.run(pipeline.run())
