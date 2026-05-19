from rapidfuzz import fuzz
from sqlalchemy.orm import Session

from app.models.opportunity import Opportunity


def is_generic_url(url: str) -> bool:
    if not url:
        return True
    url_lower = url.lower().strip()
    
    # Generic base patterns that do not represent unique individual opportunities
    generic_patterns = [
        "devpost.com/hackathons",
        "eventbrite.com/d/",
        "startupindia.gov.in",
    ]
    
    for pattern in generic_patterns:
        if pattern in url_lower:
            # Eventbrite specific event check: if it has "/e/", it is a unique event URL, not generic
            if "eventbrite.com" in url_lower and "/e/" in url_lower:
                continue
            return True
            
    # If the URL has no specific path after domain, it is likely generic
    clean_url = url_lower.replace("https://", "").replace("http://", "").rstrip("/")
    if "/" not in clean_url or len(clean_url.split("/")) <= 1:
        return True
        
    return False


def find_duplicate(db: Session, normalized_title: str, source_url: str, application_link: str = "", threshold: int = 85):
    candidates = db.query(Opportunity).limit(10000).all()
    
    url1 = (source_url or "").strip()
    app_link1 = (application_link or "").strip()
    
    is_url1_generic = is_generic_url(url1)
    is_app1_generic = is_generic_url(app_link1)
    
    for item in candidates:
        title_score = fuzz.token_sort_ratio(normalized_title, item.normalized_title)
        
        url_duplicate = False
        max_url_score = 0
        
        # Only compare source_url if they are not generic list/index pages
        if url1 and item.source_url and not is_url1_generic and not is_generic_url(item.source_url):
            url_score = fuzz.ratio(url1, item.source_url)
            if url_score >= 95:
                url_duplicate = True
                max_url_score = max(max_url_score, url_score)
                
        # Only compare application_link if they are not generic list/index pages
        if app_link1 and item.application_link and not is_app1_generic and not is_generic_url(item.application_link):
            app_score = fuzz.ratio(app_link1, item.application_link)
            if app_score >= 95:
                url_duplicate = True
                max_url_score = max(max_url_score, app_score)
        
        # If the title meets the threshold, or a unique URL matches perfectly, it's a duplicate
        if title_score >= threshold or url_duplicate:
            return item, max(title_score, max_url_score)
            
    return None, 0