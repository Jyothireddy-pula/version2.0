from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.export import router as export_router
from app.api.opportunities import router as opportunities_router
from app.api.scrapers import router as scrapers_router
from app.core.config import settings
from app.core.database import Base, SessionLocal, engine
from app.data_seed import seed_records
from app.models.alert import Alert
from app.models.opportunity import Opportunity
from app.models.scrape_log import ScrapeLog
from app.pipeline.enrich import enrich_opportunity
from app.pipeline.normalize import normalize_opportunity
from app.pipeline.save import upsert_opportunity
from app.scheduler.jobs import start_scheduler

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Startup Opportunity Aggregator API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin, "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(opportunities_router, prefix="/api/v1")
app.include_router(scrapers_router, prefix="/api/v1")
app.include_router(export_router, prefix="/api/v1")


def seed_database_if_empty():
    db = SessionLocal()
    try:
        existing = db.query(Opportunity).count()
        if existing > 0:
            return
        for record in seed_records:
            enriched = enrich_opportunity(record)
            normalized = normalize_opportunity(enriched)
            upsert_opportunity(db, normalized)
    finally:
        db.close()


@app.on_event("startup")
def startup_event():
    if settings.seed_on_startup:
        seed_database_if_empty()
    if settings.scrape_interval_minutes > 0:
        start_scheduler()


@app.get("/health")
def health():
    return {"status": "ok", "database": "connected", "engine": settings.database_url.split(":")[0]}