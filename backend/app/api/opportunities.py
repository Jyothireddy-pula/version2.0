import json
from fastapi import APIRouter, Depends, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.opportunity import Opportunity


router = APIRouter(prefix="/opportunities", tags=["opportunities"])


def serialize(item: Opportunity):
    return {
        "id": item.id,
        "title": item.title,
        "type": item.type,
        "organizer": item.organizer,
        "location": item.location,
        "country": item.country,
        "deadline": str(item.deadline) if item.deadline else None,
        "source": item.source,
        "source_url": item.source_url,
        "application_link": item.application_link,
        "description": item.description,
        "eligibility": item.eligibility,
        "funding_amount": item.funding_amount,
        "startup_stage": item.startup_stage,
        "remote_type": item.remote_type,
        "sectors": json.loads(item.sectors or "[]"),
        "tags": json.loads(item.tags or "[]"),
        "equity_required": item.equity_required,
        "featured": item.featured,
        "ai_score": item.ai_score,
        "source_reliability": item.source_reliability,
        "scraped_at": item.scraped_at.isoformat() if item.scraped_at else None,
        "updated_at": item.updated_at.isoformat() if item.updated_at else None,
    }


@router.get("")
def list_opportunities(
    search: str | None = Query(None),
    type: str | None = Query(None),
    source: str | None = Query(None),
    region: str | None = Query(None),
    limit: int = Query(100, le=500),
    offset: int = Query(0),
    db: Session = Depends(get_db),
):
    q = db.query(Opportunity)
    if search:
        pattern = f"%{search}%"
        q = q.filter(or_(Opportunity.title.ilike(pattern), Opportunity.description.ilike(pattern), Opportunity.organizer.ilike(pattern), Opportunity.location.ilike(pattern)))
    if type:
        q = q.filter(Opportunity.type == type)
    if source:
        q = q.filter(Opportunity.source == source)
    if region:
        pattern = f"%{region}%"
        q = q.filter(or_(Opportunity.location.ilike(pattern), Opportunity.country.ilike(pattern)))
    rows = q.order_by(Opportunity.deadline.asc().nullslast(), Opportunity.ai_score.desc()).offset(offset).limit(limit).all()
    return [serialize(row) for row in rows]