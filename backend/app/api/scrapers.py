from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.scrape_log import ScrapeLog
from app.scrapers.runner import scrape_all


router = APIRouter(prefix="/scrapers", tags=["scrapers"])


@router.post("/run")
async def run_scrapers(keyword: str | None = None, region: str | None = None, db: Session = Depends(get_db)):
    return await scrape_all(db, keyword=keyword, region=region)


@router.get("/logs")
def get_logs(db: Session = Depends(get_db)):
    rows = db.query(ScrapeLog).order_by(ScrapeLog.timestamp.desc()).limit(100).all()
    return [
        {
            "id": row.id,
            "source": row.source,
            "status": row.status,
            "message": row.message,
            "records_found": row.records_found,
            "records_added": row.records_added,
            "duplicates_found": row.duplicates_found,
            "execution_time_ms": row.execution_time_ms,
            "timestamp": row.timestamp.isoformat(),
        }
        for row in rows
    ]


@router.get("/health")
def scraper_health(db: Session = Depends(get_db)):
    rows = db.query(ScrapeLog).order_by(ScrapeLog.timestamp.desc()).limit(100).all()
    errors = len([r for r in rows if r.status == "error"])
    successes = len([r for r in rows if r.status == "success"])
    return {"total_runs": len(rows), "errors": errors, "successes": successes, "health": 100 if not rows else round((successes / len(rows)) * 100, 1)}