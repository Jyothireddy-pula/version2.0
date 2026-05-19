from rapidfuzz import fuzz
from sqlalchemy.orm import Session

from app.models.opportunity import Opportunity


def find_duplicate(db: Session, normalized_title: str, source_url: str, threshold: int = 85):
    candidates = db.query(Opportunity).limit(10000).all()
    for item in candidates:
        title_score = fuzz.token_sort_ratio(normalized_title, item.normalized_title)
        url_score = fuzz.ratio(source_url or "", item.source_url or "")
        if title_score >= threshold or url_score >= 95:
            return item, max(title_score, url_score)
    return None, 0