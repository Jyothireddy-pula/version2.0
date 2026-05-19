from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite:///./startup_opportunities.db"
    frontend_origin: str = "http://localhost:5173"
    scrape_interval_minutes: int = 30
    scraper_timeout_seconds: int = 20
    scraper_max_retries: int = 3
    seed_on_startup: bool = True

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()