import hashlib
import json
import re
from datetime import date
from dateutil import parser


def normalize_title(title: str) -> str:
    title = (title or "").lower().strip()
    title = re.sub(r"[^a-z0-9\s]", "", title)
    return re.sub(r"\s+", " ", title)


def parse_deadline(value: str | None) -> date | None:
    if not value:
        return None
    try:
        return parser.parse(value, fuzzy=True).date()
    except Exception:
        return None


def make_hash(title: str, source: str, source_url: str) -> str:
    base = f"{normalize_title(title)}|{source.lower()}|{source_url.lower()}"
    return hashlib.sha256(base.encode()).hexdigest()


def normalize_opportunity(raw: dict) -> dict:
    title = (raw.get("title") or "").strip()
    source = raw.get("source") or "Unknown"
    source_url = raw.get("source_url") or raw.get("application_link") or ""
    return {
        "title": title,
        "normalized_title": normalize_title(title),
        "type": raw.get("type", "Opportunity"),
        "organizer": raw.get("organizer"),
        "location": raw.get("location"),
        "country": raw.get("country"),
        "deadline": parse_deadline(raw.get("deadline")),
        "source": source,
        "source_url": source_url,
        "application_link": raw.get("application_link") or source_url,
        "description": raw.get("description"),
        "eligibility": raw.get("eligibility"),
        "funding_amount": raw.get("funding_amount"),
        "startup_stage": raw.get("startup_stage"),
        "remote_type": raw.get("remote_type"),
        "sectors": json.dumps(raw.get("sectors") or []),
        "tags": json.dumps(raw.get("tags") or []),
        "equity_required": bool(raw.get("equity_required", False)),
        "featured": bool(raw.get("featured", False)),
        "ai_score": float(raw.get("ai_score", 0)),
        "source_reliability": float(raw.get("source_reliability", 95)),
        "raw_data": json.dumps(raw),
        "content_hash": make_hash(title, source, source_url),
    }