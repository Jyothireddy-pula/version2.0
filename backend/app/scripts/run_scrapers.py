import asyncio
from app.core.database import SessionLocal
from app.scrapers.runner import scrape_all


async def main():
    print("==================================================")
    print("      STARTUP OPPORTUNITY AGGREGATOR SCRAPER      ")
    print("==================================================")
    print("[*] Initializing database session...")
    db = SessionLocal()
    try:
        print("[*] Launching parallel scrapers: Startup India, Devpost, Eventbrite...")
        print("[*] Sending requests and parsing pages (this may take a few seconds)...")
        
        results = await scrape_all(db)
        
        print("\n================= SCRAPE SUMMARY =================")
        for src in results.get("sources", []):
            status = src.get("status", "unknown").upper()
            source_name = src.get("source", "Unknown Source")
            if status == "SUCCESS":
                print(f"[+] {source_name:15} | Status: {status} | Found: {src.get('found', 0):2} | Added: {src.get('added', 0):2} | Duplicates: {src.get('duplicates', 0):2}")
            else:
                print(f"[-] {source_name:15} | Status: {status} | Error: {src.get('error', 'Unknown Error')}")
                
        print("--------------------------------------------------")
        print(f"[!] Total Found    : {results.get('records_found', 0)}")
        print(f"[!] Total Added    : {results.get('records_added', 0)}")
        print(f"[!] Duplicates Skip: {results.get('duplicates_found', 0)}")
        print("==================================================")
        print("[*] Scraping pipeline completed successfully and committed to DB.")
    except Exception as e:
        print(f"\n[!] Critical pipeline error occurred: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    asyncio.run(main())
