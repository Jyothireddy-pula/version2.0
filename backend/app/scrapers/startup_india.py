from app.scrapers.base import BaseScraper


class StartupIndiaScraper(BaseScraper):
    source_name = "Startup India"
    base_url = "https://seedfund.startupindia.gov.in"

    async def scrape(self, keyword: str | None = None, region: str | None = None):
        items = [
            {
                "title": "Startup India Seed Fund Scheme (SISFS)",
                "type": "Grant",
                "organizer": "DPIIT, Government of India",
                "location": "India",
                "country": "India",
                "deadline": None,
                "source": self.source_name,
                "source_url": "https://seedfund.startupindia.gov.in",
                "application_link": "https://seedfund.startupindia.gov.in",
                "description": "Seed funding support for proof of concept, prototype development, product trials, market entry and commercialization.",
                "eligibility": "DPIIT-recognized startups incorporated not more than 2 years ago.",
                "funding_amount": "Up to ₹50 Lakh",
                "sectors": ["Technology", "Healthcare", "Agritech", "Education", "CleanTech"],
                "tags": ["Government", "Grant", "DPIIT", "Seed Fund"],
                "equity_required": False,
                "featured": True,
                "source_reliability": 99,
            },
            {
                "title": "National Startup Awards",
                "type": "Competition",
                "organizer": "DPIIT, Government of India",
                "location": "India",
                "country": "India",
                "deadline": None,
                "source": self.source_name,
                "source_url": "https://www.startupindia.gov.in",
                "application_link": "https://www.startupindia.gov.in",
                "description": "National recognition and awards program for high-impact Indian startups across sectors.",
                "eligibility": "DPIIT-recognized startups with market-ready product or service.",
                "funding_amount": "Cash prize and government recognition",
                "sectors": ["All Sectors"],
                "tags": ["Award", "DPIIT", "Recognition"],
                "equity_required": False,
                "featured": True,
                "source_reliability": 99,
            },
        ]
        return self._filter(items, keyword, region)

    def _filter(self, items, keyword, region):
        if keyword:
            items = [i for i in items if keyword.lower() in (i["title"] + i["description"]).lower()]
        if region:
            items = [i for i in items if region.lower() in (i.get("location") or "").lower() or region.lower() in (i.get("country") or "").lower()]
        return items