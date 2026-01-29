# PRD: Internal Serverless Agentic Affiliate Engine

## 1. Executive Summary
**Objective:** Build a fully autonomous, cost-effective affiliate automation engine *inside* the existing application architecture. By replacing external workflow tools (like n8n/Zapier) with Supabase Edge Functions and Database Cron jobs, we eliminate subscription costs and rate limits.
**Philosophy:** "Code is free, Workflows are expensive." We will implement the orchestration logic directly in TypeScript.

## 2. Architecture: The "Serverless Loop"

The system runs entirely on Supabase infrastructure:
1.  **Trigger:** `pg_cron` (Database Scheduler) fires every X minutes.
2.  **Orchestrator:** A master Edge Function (`auto-agent`) that acts as the controller.
3.  **State:** PostgreSQL database tracks processed URLs to prevent duplicates.
4.  **Agents:** Modular TypeScript functions for Scraping, AI Writing, and Broadcasting.

### High-Level Data Flow:
`Cron Job` -> `auto-agent (Edge Function)` -> `Scrape Sources` -> `Filter Duplicates (DB)` -> `Generate Content (AI)` -> `Monetize (Cuelinks)` -> `Broadcast (Telegram)`

## 3. Core Components

### 3.1. The Scheduler (Trigger)
Instead of an external trigger, we use the database's built-in cron.
- **Mechanism:** `select cron.schedule('*/30 * * * *', 'select net.http_post(...)');`
- **Frequency:** Configurable (e.g., every 30 mins).
- **Cost:** Free (part of Supabase).

### 3.2. The Scout (Discovery Module)
A flexible scraper running in the Edge Function runtime.
- **Sources:**
  - **RSS Feeds:** Amazon "Movers & Shakers", Flipkart RSS (if available).
  - **Site Parsing:** `deno-dom` scraping of specific "Deal of the Day" URLs.
- **Logic:**
  - Fetch list of URLs.
  - **Anti-Duplication:** Check `discovered_links` table. If URL exists, discard immediately.
  - **Quality Gate:** Simple heuristic (e.g., "Discount > 0%") before passing to AI.

### 3.3. The Brain (Content & Intelligence)
Leverages the existing `ai-assistant` logic but automated.
- **Input:** Raw Product Title, Price, Description.
- **Process:**
  - Call `ai-assistant` internally.
  - Request: "Generate Telegram HTML for {Title} at {Price}".
- **Output:** Formatted HTML string ready for sending.

### 3.4. The Cashier (Monetization)
Automated link transformation.
- **Functionality:**
  - Take clean URL.
  - Call **Cuelinks API** (or fallback to manual ID tagging).
  - Append tracking parameter: `&subid=auto_gen_{timestamp}`.

### 3.5. The Broadcaster (Distribution)
Direct API integrations.
- **Telegram:** Use the existing `telegram-post` logic.
- **Twitter/X:** (Future) Simple API call.
- **Website:** Insert into `deals` table with `status = 'published'` for immediate visibility on the user dashboard.

## 4. Database Schema Requirements

We need new tables to manage the state of the automation.

### `automation_logs`
Tracks the execution of the cron jobs to ensure reliability.
- `id`: UUID
- `run_at`: Timestamp
- `deals_found`: Integer
- `deals_posted`: Integer
- `status`: 'success' | 'failure'
- `error_log`: Text

### `discovered_links`
The memory of the agent. Used to avoid spamming the same deal.
- `url_hash`: String (Unique Index) - MD5 of the normalized URL.
- `original_url`: Text
- `source`: 'amazon_rss' | 'flipkart_scrape'
- `first_seen`: Timestamp
- `last_processed`: Timestamp
- `status`: 'posted' | 'rejected_low_quality' | 'failed'

## 5. Implementation Roadmap

### Phase 1: Infrastructure
- [ ] Create `automation_logs` and `discovered_links` tables.
- [ ] Enable `pg_cron` extension in Supabase.
- [ ] Create the shell Edge Function `process-schedule`.

### Phase 2: The Scraper Logic
- [ ] Implement RSS parsing in `process-schedule`.
- [ ] Implement `checkDuplicate` logic against the DB.

### Phase 3: The Assembly Line
- [ ] Connect Scraper -> AI -> Telegram in the Edge Function.
- [ ] Add error handling (so one bad deal doesn't crash the whole batch).

### Phase 4: Control Panel
- [ ] Add a "Schedulers" tab in `Settings.tsx` to view logs and manually trigger a run.

## 6. Cost Analysis
- **Old Plan (n8n/Zapier):** $20-$50/month for ~1000 tasks.
- **New Plan (Internal):**
  - **Supabase Edge Functions:** 500k invocations/month free.
  - **Database:** Included in existing plan.
  - **AI (Gemini/OpenAI):** Pay-per-use (very low for text).
  - **Total:** ~$0 - $5/month depending on AI usage.

## 7. Risks & Mitigation
- **Rate Limiting:** Scrapers might get blocked.
  - *Mitigation:* Use rotating user-agents, fetch slowly (serial processing), and respect `robots.txt` where reasonable.
- **Runaway Costs:** AI loop running on bad data.
  - *Mitigation:* Hard limit on "deals per run" (e.g., max 5 per 30 mins).
