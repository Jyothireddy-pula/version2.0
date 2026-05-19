from datetime import date, datetime
from pydantic import BaseModel


class OpportunityOut(BaseModel):
    id: int
    title: str
    type: str
    organizer: str | None = None
    location: str | None = None
    country: str | None = None
    deadline: date | None = None
    source: str
    source_url: str
    application_link: str | None = None
    description: str | None = None
    eligibility: str | None = None
    funding_amount: str | None = None
    startup_stage: str | None = None
    remote_type: str | None = None
    sectors: list[str] = []
    tags: list[str] = []
    equity_required: bool = False
    featured: bool = False
    ai_score: float = 0
    source_reliability: float = 95
    scraped_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True