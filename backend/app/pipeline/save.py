from sqlalchemy.orm import Session

from app.models.opportunity import Opportunity
from app.pipeline.deduplicate import find_duplicate


def upsert_opportunity(db: Session, data: dict):
    duplicate, score = find_duplicate(db, data["normalized_title"], data.get("source_url", ""))
    if duplicate:
        duplicate.description = data.get("description") or duplicate.description
        duplicate.deadline = data.get("deadline") or duplicate.deadline
        duplicate.funding_amount = data.get("funding_amount") or duplicate.funding_amount
        duplicate.ai_score = max(duplicate.ai_score, data.get("ai_score", 0))
        db.commit()
        db.refresh(duplicate)
        return duplicate, True, score
    obj = Opportunity(**data)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj, False, 0