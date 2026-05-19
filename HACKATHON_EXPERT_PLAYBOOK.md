# Startup Opportunity Aggregator: Senior Architect Engineering Playbook

This playbook provides elite, production-grade implementation strategies and optimization guidelines for building the ultimate high-performance **Startup Opportunity Aggregator**. 

---

## 1. SCRAPER PERFORMANCE & RELIABILITY

*   **Best Scraper Architecture:** Use a Decoupled Worker-Queue Architecture (FastAPI + Celery/Redis + Playwright). Decouple raw fetching (HTML download) from parsing (DOM extraction) and storage.
*   **Fastest Scraping Strategy:** Leverage HTTP/JSON API endpoints directly via `aiohttp` where possible. Only fallback to headless browsers (Playwright) when server-side rendering is absent or protected by strict Cloudflare captchas.
*   **Async Scraping Setup:** Use Python's `asyncio.gather` with a concurrency semaphore (`asyncio.BoundedSemaphore(value=10)`) to process multiple pages in parallel without bottlenecking or triggering rate limits.
*   **aiohttp Optimization:** Use a single, persistent `aiohttp.ClientSession` with TCP connection pooling (`aiohttp.TCPConnector(limit=50, keepalive_timeout=30)`) to reuse sockets and minimize DNS lookup latency.
*   **Playwright Optimization:** Disable resource loading (images, stylesheets, fonts, analytics) in the browser context:
    ```python
    await page.route("**/*", lambda route: route.abort() if route.request.resource_type in ["image", "stylesheet", "font", "media"] else route.continue_())
    ```
*   **Retry Strategy:** Implement Exponential Backoff with Jitter (random noise) to prevent "thundering herd" problems:
    $$T_{wait} = 2^{attempt} + \text{random}(0, 1)$$
*   **Timeout Handling:** Set a strict global request timeout (e.g., 15 seconds) and a navigation timeout. Raise a custom exception, log the failure metadata, and continue the queue execution immediately.
*   **Request Throttling:** Implement sliding-window rate limiting (Token Bucket algorithm) using Redis to control request frequency per target domain dynamically.
*   **Anti-Scraping Basics:** Rotate headers using `fake-useragent`, inject realistic `Accept-Language` headers, utilize premium stealth plugins (`playwright-stealth`), and implement residential proxy rotations.
*   **Pagination Optimization:** Fetch pages concurrently by pre-calculating page parameters (e.g., `?page=1`, `?page=2`) up to a strict, safe depth limit (e.g., max 20 pages per domain).
*   **Deduplication Optimization:** Deduplicate in-memory using a Redis Bloom Filter before triggering expensive database reads/writes.
*   **Caching Strategy:** Cache raw HTTP responses in Redis with a 4-hour TTL. If parsing fails, rerun the parser on the cached HTML instead of re-downloading the page.
*   **Scheduler Optimization:** Run distributed cron jobs via standard schedulers (e.g., APScheduler or Celery Beat). Stagger scrapers to prevent high simultaneous database write locks.
*   **Source Monitoring:** Maintain a `scrape_logs` table tracking: `source_name`, `status` (Success/Failed), `duration_ms`, `items_count`, `error_message`, and `network_latency`.
*   **Scraper Logging:** Log structured JSON events containing source URL, response status, parser signature, and database ingestion status.

### 💡 Evaluator Insights
*   **Reliability Score Boosters:** Graceful degradation (if a source is down, the rest continue), automated schema verification (Zod/Pydantic validation errors logged but not crashing the app), and a real-time health indicator dashboard.
*   **Common Mistakes:** Running scrapers inside synchronous API routes (blocking the API loop), hardcoding CSS selectors with no structural fallbacks, and lack of rate-limiting leading to immediate IP bans.
*   **Production-Grade Signal:** Telemetry showing historical ingestion success rates, database schema validation layers, and automated alerts for broken parser selectors.

---

## 2. DATABASE & PIPELINE PERFORMANCE

*   **Best Database Choice:** PostgreSQL for core persistent storage (due to native GIN/GiST indexes, JSONB, pgvector, and pg_trgm), paired with Redis for low-latency session and request caching.
*   **PostgreSQL Optimization:** Tune connection parameters using a pooler (e.g., `pgBouncer`), increase `shared_buffers` to 25% of system RAM, and adjust `work_mem` to prevent sorting operations from spilling to disk.
*   **Indexing Strategy:**
    *   `btree` index on high-frequency filters: `status`, `deadline`, `opportunity_type`.
    *   `gin` index using `gin_trgm_ops` on `title` and `description` for rapid fuzzy searches.
    *   `gin` index on `sectors` (JSONB/Array columns).
*   **Query Optimization:** Avoid `SELECT *`. Retrieve only essential fields. Use SQL cursors or keyset pagination (`WHERE id > last_id`) instead of high-offset queries (`OFFSET 10000`).
*   **Bulk Insert Strategy:** Use PostgreSQL `COPY` protocol or bulk `INSERT INTO ... ON CONFLICT (source_url) DO UPDATE` to batch 100+ items per transactional roundtrip.
*   **Duplicate Detection Optimization:** Compute MD5 hashes of the normalized source URL. Enforce a database-level `UNIQUE` constraint on the hash column to block identical duplicates at the engine level.
*   **Fuzzy Matching Optimization:** Enable PostgreSQL `pg_trgm` extension. Query similarity ratios using:
    ```sql
    SELECT *, similarity(title, 'query') AS score FROM opportunities WHERE title % 'query' ORDER BY score DESC;
    ```
*   **ETL Optimization:** Perform extract-transform-load sequences as decoupled steps: Fetch raw data -> parse/normalize -> validate -> deduplicate -> insert batch.

### 💡 Evaluator Insights
*   **Fast Search & Filtering:** Keep the active search index hot in memory. Combine full-text index queries with relational BTree indexing to execute complex multi-faceted filters in <10ms.
*   **Pipeline Score Boosters:** Soft-duplication engines (weighted title, date, and description scoring) and automated schema cleaners converting fragmented date strings (e.g., "5th Jan", "05-01-2026") into ISO-8601 timestamps.

---

## 3. BACKEND PERFORMANCE

*   **FastAPI Optimization:** Run using `uvicorn` with `gunicorn` worker manager (`gunicorn -w 4 -k uvicorn.workers.UvicornWorker`). Disable unnecessary debug logs in production.
*   **Async API Strategy:** Write all route handlers as `async def` and ensure database calls utilize asynchronous drivers (e.g., `asyncpg` for PostgreSQL).
*   **Response Caching:** Cache static API endpoints (e.g., opportunity metadata, analytics stats) in Redis with short-term cache expiration (e.g., TTL 5 minutes) via `fastapi-cache`.
*   **Background Tasks:** Offload heavy lifting (e.g., database cleanups, email alerts, scraper initiations) to background workers using FastAPI's built-in `BackgroundTasks` or Celery.
*   **API Compression:** Compress JSON responses using Gzip or Brotli middleware to reduce network transit sizes by up to 80%.
*   **Modular Architecture:** Structure by feature modules: `/api/routes/opportunities.py`, `/api/routes/scrapers.py`, `/core/config.py`, `/models/`, and `/schemas/`.
*   **Validation Optimization:** Use Pydantic V2 (highly optimized compiled Rust core) for high-performance schema serialization and parsing.

### 💡 Evaluator Insights
*   **Reducing API Latency:** Utilize async database drivers, implement selective JSON response structures, and leverage server-side caching.
*   **High Performance Signals:** Zero synchronous blocking calls in the main thread loop and structured JSON logs.

---

## 4. FRONTEND PERFORMANCE & UI

*   **React Optimization:** Wrap heavy computations in `useMemo` and event handlers in `useCallback`. Prevent re-renders using strict child element decoupling.
*   **TypeScript Best Practices:** Maintain strict type definitions (`interface Opportunity`, `type Theme`), avoid the `any` keyword, and use exhaustive union checks.
*   **Lazy Loading & Code Splitting:** Leverage dynamic imports `React.lazy` and `Suspense` to split views (`AnalyticsPage`, `ScrapersPage`) into dynamic script chunks.
*   **Virtualization:** Render long lists of cards using `react-window` or `react-virtualized` to maintain exactly ~10 active DOM elements regardless of search size.
*   **Debounced Search:** Debounce keystroke events (300ms window) in search inputs to avoid triggering filter queries and virtualized layouts on every letter pressed.
*   **React Query / Cache Optimization:** Cache server payloads, perform background pre-fetching, and use stale-while-revalidate configurations for smooth dashboard switches.
*   **Aesthetics:** Modern HSL-based Obsidian dark colors, 1px high-precision Neo-brutalist solid borders, and smooth micro-animations (`transition-all duration-300`).

### 💡 Evaluator Insights
*   **Instant UI Experience:** Skeleton screens (`animate-pulse`) in place of standard full-page spinner overlays, keeping the main page frame static while updating details.
*   **Premium Visual Cues:** Beautiful custom geometric indicators in place of generic cartoony emojis, responsive layout configurations, and intuitive empty state layouts with instant reset buttons.

---

## 5. SEARCH & FILTER OPTIMIZATION

*   **Full-Text Search:** Leverage PostgreSQL `tsvector` and `tsquery` parsed columns to index and search across opportunity descriptions.
*   **Indexed Filtering:** Build composite indexes (e.g., on `(status, opportunity_type)`) to immediately filter target lists before executing searches.
*   **Relevance Ranking:** Rank matches by utilizing PostgreSQL text ranking features:
    ```sql
    SELECT title, ts_rank(to_tsvector(title), query) AS rank FROM opportunities, to_tsquery('AI & grant') query ORDER BY rank DESC;
    ```
*   **Fuzzy Search:** Use Trigrams or Levenshtein calculations to map matches despite typos (e.g., searching for "Techsturs" matches "Techstars").
*   **Faceted Filters:** Aggregate available item totals dynamically within filter selections using database groupings to let users see counts (e.g., "Grants (42)", "Accelerators (15)").

---

## 6. REAL-TIME & WOW FACTOR FEATURES

*   **Live Scraper Monitor:** Stream live terminal log output directly to the admin interface utilizing WebSockets or Server-Sent Events (SSE).
*   **AI Match Scoring:** Let users configure basic preferences (sectors, funding goals, location) and dynamically calculate a **"Weighted Alignment Match %"** using overlapping tags and metrics.
*   **Source Reliability Indicator:** Systematically calculate a dynamic reliability index (0-100%) based on successfully completed scrapes and fully valid item schema validation passes.
*   **Smart Alerts:** Automated background monitors trigger email notification alerts whenever newly scraped items score >90% against user profiles.

---

## 7. MONITORING & RELIABILITY

*   **Structured Logging:** Format standard output logs into structured JSON strings containing key parameters like `timestamp`, `level`, `component`, and `trace_id`.
*   **Uptime Monitoring:** Expose a clean, fast `/health` API endpoint returning server state, DB status, and redis memory footprint for monitoring tools.
*   **Scraper Metrics:** Log and render active statistics: execution success rate, average crawler runtime, and crawler bandwidth usage.

---

## 8. SCALABILITY & PRODUCTION READINESS

*   **Dockerization:** Decouple components into multi-stage, light Docker containers (Vite frontend served via Nginx, Python FastAPI backend, and PostgreSQL).
*   **Redis Usage:** Utilize Redis as a shared high-speed store for rate-limiting, session states, scraper caches, and Celery task queues.
*   **Environment Management:** Separate development, staging, and production parameters using secure `.env` files managed via strict schema validation.

---

## 9. ELITE HACKATHON WINNING STRATEGY

### Top 15 High-Scoring Architectural Elements
1.  **Fully Decoupled Background Workers:** Scrapers run in separate tasks, avoiding main API lag.
2.  **Obsidian Dark Aesthetics:** Beautiful, dark neo-brutalist theme matching developer environments.
3.  **Strict Data Validation (Pydantic/Zod):** Discards malformed data before database write.
4.  **Automatic Ingestion Schedulers:** Cron-active scraper schedules matching live-production behavior.
5.  **Dynamic Profile Alignment Score:** Weighted match logic based on user parameter overlap.
6.  **Dual Database Engine Adaptability:** Fast fallback capability from PostgreSQL to SQLite.
7.  **Live Log Socket Streams:** Live telemetry rendering raw crawler output.
8.  **Automated Soft Deduplication:** Fuzzy-matching heuristics for title/date similarities.
9.  **Skeleton Loading UI Elements:** Premium UX that feels fast even on slow connections.
10. **Geo-Coord Filters:** Mapping search items to normalized regional hubs.
11. **Comprehensive `.gitignore` Configuration:** Secure keys, environments, caches, and database files.
12. **Complete Seeding Pipeline:** Rapid mock-data triggers to immediately populate dashboards.
13. **Comprehensive README with Mermaid Diagrams:** Clear, highly visual developer documentation.
14. **Production-Ready Docker Configs:** Zero-setup environment reproducibility.
15. **Responsive Sidebar Layouts:** Mobile-optimized, ultra-accessible design.

### 5 Critical Pitfalls to Avoid
1.  Committing environment credentials (`.env`) or local databases to public Git repositories.
2.  Mixing scraping execution directly inside FastAPI request-response threads.
3.  Displaying plain cartoony emojis or generic templates that lower SaaS-feel perceptions.
4.  Providing zero error-handling blocks, causing the UI to collapse on bad server payloads.
5.  Over-complicating early deployments with complex cloud layers before finalizing local stability.
