def infer_type(text: str) -> str:
    t = text.lower()
    if "hackathon" in t:
        return "Hackathon"
    if "accelerator" in t:
        return "Accelerator"
    if "incubator" in t or "incubation" in t:
        return "Incubator"
    if "conference" in t or "summit" in t or "event" in t:
        return "Conference"
    if "fellowship" in t:
        return "Fellowship"
    if "grant" in t or "fund" in t or "seed" in t:
        return "Grant"
    return "Opportunity"


def infer_stage(text: str) -> str:
    t = text.lower()
    if "idea" in t or "prototype" in t:
        return "Idea"
    if "pre-seed" in t or "mvp" in t:
        return "Pre-Seed"
    if "series a" in t:
        return "Series A"
    if "seed" in t:
        return "Seed"
    return "Any"


def infer_remote_type(text: str) -> str:
    t = text.lower()
    if "remote" in t or "online" in t:
        return "Remote"
    if "hybrid" in t:
        return "Hybrid"
    return "On-Site"


def enrich_opportunity(raw: dict) -> dict:
    text = f"{raw.get('title','')} {raw.get('description','')} {raw.get('eligibility','')}"
    raw["type"] = raw.get("type") or infer_type(text)
    raw["startup_stage"] = raw.get("startup_stage") or infer_stage(text)
    raw["remote_type"] = raw.get("remote_type") or infer_remote_type(text)
    raw["tags"] = raw.get("tags") or []
    score = 60
    if raw.get("deadline"):
        score += 10
    if raw.get("funding_amount"):
        score += 10
    if raw.get("application_link"):
        score += 10
    if raw.get("description"):
        score += 10
    raw["ai_score"] = min(raw.get("ai_score") or score, 100)
    return raw