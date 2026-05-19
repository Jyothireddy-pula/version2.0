import time
from sqlalchemy.orm import Session

from app.models.scrape_log import ScrapeLog
from app.pipeline.enrich import enrich_opportunity
from app.pipeline.normalize import normalize_opportunity
from app.pipeline.save import upsert_opportunity
from app.scrapers.devpost import DevpostScraper
from app.scrapers.eventbrite import EventbriteScraper
from app.scrapers.startup_india import StartupIndiaScraper


SCRAPERS = [StartupIndiaScraper(), DevpostScraper(), EventbriteScraper()]


async def scrape_all(db: Session, keyword: str | None = None, region: str | None = None):
    results = {"sources": [], "records_found": 0, "records_added": 0, "duplicates_found": 0}
    for scraper in SCRAPERS:
        start = time.time()
        try:
            raw_items = await scraper.scrape(keyword=keyword, region=region)
            added = 0
            duplicates = 0
            for raw in raw_items:
                enriched = enrich_opportunity(raw)
                normalized = normalize_opportunity(enriched)
                _, is_duplicate, _ = upsert_opportunity(db, normalized)
                if is_duplicate:
                    duplicates += 1
                else:
                    added += 1
            db.add(ScrapeLog(
                source=scraper.source_name,
                status="success",
                message=f"Scraped {len(raw_items)} records",
                records_found=len(raw_items),
                records_added=added,
                duplicates_found=duplicates,
                execution_time_ms=(time.time() - start) * 1000,
            ))
            db.commit()
            results["sources"].append({"source": scraper.source_name, "status": "success", "found": len(raw_items), "added": added, "duplicates": duplicates})
            results["records_found"] += len(raw_items)
            results["records_added"] += added
            results["duplicates_found"] += duplicates
        except Exception as e:
            db.add(ScrapeLog(source=scraper.source_name, status="error", message=str(e), execution_time_ms=(time.time() - start) * 1000))
            db.commit()
            results["sources"].append({"source": scraper.source_name, "status": "error", "error": str(e)})
    return results