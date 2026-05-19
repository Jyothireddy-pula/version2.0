from app.scrapers.base import BaseScraper


class EventbriteScraper(BaseScraper):
    source_name = "Eventbrite"
    base_url = "https://www.eventbrite.com/d/online/startup/"

    async def scrape(self, keyword: str | None = None, region: str | None = None):
        html = await self.fetch(self.base_url)
        soup = self.soup(html)
        items = []
        seen = set()
        for link_el in soup.select("a[href*='/e/']")[:40]:
            title = link_el.get_text(" ", strip=True)
            link = link_el.get("href")
            if not title or len(title) < 8 or link in seen:
                continue
            seen.add(link)
            item = {
                "title": title[:250],
                "type": "Conference",
                "organizer": "Eventbrite",
                "location": "Online",
                "country": "Global",
                "deadline": None,
                "source": self.source_name,
                "source_url": self.base_url,
                "application_link": link,
                "description": title,
                "eligibility": "Open registration event.",
                "funding_amount": None,
                "sectors": ["Startup Events", "Networking"],
                "tags": ["Eventbrite", "Event"],
                "equity_required": False,
                "featured": False,
                "source_reliability": 92,
            }
            if keyword and keyword.lower() not in f"{title} {item['description']}".lower():
                continue
            items.append(item)
        return items