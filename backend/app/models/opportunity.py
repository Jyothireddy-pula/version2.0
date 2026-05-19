from sqlalchemy import Boolean, Date, DateTime, Float, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Opportunity(Base):
    __tablename__ = "opportunities"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False, index=True)
    normalized_title: Mapped[str] = mapped_column(String(500), nullable=False, index=True)
    type: Mapped[str] = mapped_column(String(80), nullable=False, index=True)
    organizer: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    country: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)
    deadline: Mapped[Date | None] = mapped_column(Date, nullable=True, index=True)
    source: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    source_url: Mapped[str] = mapped_column(Text, nullable=False)
    application_link: Mapped[str | None] = mapped_column(Text, nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    eligibility: Mapped[str | None] = mapped_column(Text, nullable=True)
    funding_amount: Mapped[str | None] = mapped_column(String(160), nullable=True)
    startup_stage: Mapped[str | None] = mapped_column(String(80), nullable=True, index=True)
    remote_type: Mapped[str | None] = mapped_column(String(50), nullable=True, index=True)
    sectors: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON string for SQLite portability
    tags: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON string for SQLite portability
    equity_required: Mapped[bool] = mapped_column(Boolean, default=False)
    featured: Mapped[bool] = mapped_column(Boolean, default=False)
    ai_score: Mapped[float] = mapped_column(Float, default=0)
    source_reliability: Mapped[float] = mapped_column(Float, default=95)
    content_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    raw_data: Mapped[str | None] = mapped_column(Text, nullable=True)
    scraped_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())