from app.scrapers.base import BaseScraper


class DevpostScraper(BaseScraper):
    source_name = "Devpost"
    base_url = "https://devpost.com/hackathons"

    async def scrape(self, keyword: str | None = None, region: str | None = None):
        html = await self.fetch(self.base_url)
        soup = self.soup(html)
        items = []
        cards = soup.select(".challenge-listing, .hackathon-tile, article, a[href*='/software']")
        for card in cards[:30]:
            title_el = card.select_one("h2, h3, .title") if hasattr(card, "select_one") else None
            link_el = card.select_one("a[href]") if hasattr(card, "select_one") else card
            title = title_el.get_text(strip=True) if title_el else card.get_text(" ", strip=True)[:160]
            link = link_el.get("href") if link_el else self.base_url
            if not title or len(title) < 8:
                continue
            item = {
                "title": title,
                "type": "Hackathon",
                "organizer": "Devpost",
                "location": "Global / Online",
                "country": "Global",
                "deadline": None,
                "source": self.source_name,
                "source_url": self.base_url,
                "application_link": link,
                "description": title,
                "eligibility": "Developers, students, startups, and builders.",
                "funding_amount": None,
                "sectors": ["Hackathon", "Technology"],
                "tags": ["Devpost", "Hackathon"],
                "equity_required": False,
                "featured": False,
                "source_reliability": 95,
            }
            if keyword and keyword.lower() not in f"{title} {item['description']}".lower():
                continue
            items.append(item)
        return items