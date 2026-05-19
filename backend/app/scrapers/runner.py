import asyncio
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
    
    async def run_one(scraper):
        start = time.time()
        try:
            raw_items = await scraper.scrape(keyword=keyword, region=region)
            return scraper.source_name, "success", raw_items, (time.time() - start) * 1000, None
        except Exception as e:
            return scraper.source_name, "error", [], (time.time() - start) * 1000, str(e)

    # Parallelize all network scraper requests concurrently
    scraped_results = await asyncio.gather(*(run_one(s) for s in SCRAPERS))
    
    # Process and load parsed opportunities sequentially to prevent SQL session conflicts
    for source_name, status, raw_items, duration_ms, err_msg in scraped_results:
        if status == "success":
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
                source=source_name,
                status="success",
                message=f"Scraped {len(raw_items)} records",
                records_found=len(raw_items),
                records_added=added,
                duplicates_found=duplicates,
                execution_time_ms=duration_ms,
            ))
            results["sources"].append({"source": source_name, "status": "success", "found": len(raw_items), "added": added, "duplicates": duplicates})
            results["records_found"] += len(raw_items)
            results["records_added"] += added
            results["duplicates_found"] += duplicates
        else:
            db.add(ScrapeLog(
                source=source_name,
                status="error",
                message=err_msg,
                execution_time_ms=duration_ms,
            ))
            results["sources"].append({"source": source_name, "status": "error", "error": err_msg})
            
    db.commit()
    return results