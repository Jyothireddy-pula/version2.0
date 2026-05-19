from app.core.database import Base, SessionLocal, engine
from app.data_seed import seed_records
from app.pipeline.enrich import enrich_opportunity
from app.pipeline.normalize import normalize_opportunity
from app.pipeline.save import upsert_opportunity


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        for record in seed_records:
            enriched = enrich_opportunity(record)
            normalized = normalize_opportunity(enriched)
            upsert_opportunity(db, normalized)
    finally:
        db.close()


if __name__ == "__main__":
    seed()