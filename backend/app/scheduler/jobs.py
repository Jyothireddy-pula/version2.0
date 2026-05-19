import asyncio
from apscheduler.schedulers.background import BackgroundScheduler

from app.core.config import settings
from app.core.database import SessionLocal
from app.scrapers.runner import scrape_all


scheduler = BackgroundScheduler()


def scheduled_scrape():
    db = SessionLocal()
    try:
        asyncio.run(scrape_all(db))
    finally:
        db.close()


def start_scheduler():
    scheduler.add_job(scheduled_scrape, "interval", minutes=settings.scrape_interval_minutes, id="scrape_all_sources", replace_existing=True)
    scheduler.start()