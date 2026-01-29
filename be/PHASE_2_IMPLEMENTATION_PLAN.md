# Phase 2 Implementation Plan: Agentic Affiliate Engine

This document outlines the step-by-step roadmap to transition LinkGenie from a manual tool to a fully automated "Hands-Off" affiliate ecosystem using n8n, Gemini 2.0, and Cuelinks.

## Phase 2.1: Foundation & Data Architecture
**Objective:** Prepare the database to track automated discovery and prevent duplicate spam.
- [ ] **Task 2.1.1: Schema Update**
    - Create `discovered_deals` table to log raw URLs found by scrapers.
    - Add fields: `source_url` (unique), `scraped_at`, `status` (pending/processed/rejected), `price_history` (JSONB).
    - Add `automation_logs` table for debugging n8n workflows.
- [ ] **Task 2.1.2: Cuelinks Integration Setup**
    - Define Cuelinks API capabilities (Link conversion).
    - Create a reusable TypeScript helper or Edge Function snippet for Cuelinks API calls to keep API keys secure.

## Phase 2.2: The Scout (Automated Discovery)
**Objective:** Build the "Eyes" of the system to find deals 24/7.
- [ ] **Task 2.2.1: n8n RSS/Web Monitor Scraper**
    - Set up n8n Trigger (Cron every 15 mins).
    - Configure HTTP Request nodes to fetch "Hot Deals" RSS feeds (Amazon/Flipkart).
    - *Alternative:* Use `scrape-product` Edge Function for specific high-value product pages.
- [ ] **Task 2.2.2: Filtering Logic (The Gatekeeper)**
    - Implement n8n logic to check `discovered_deals` in Supabase.
    - **Rule:** If URL exists in last 24h -> SKIP.
    - **Rule:** If Price > Typical Price -> SKIP (requires price history logic).
    - **Rule:** If "Out of Stock" (detected via raw HTML regex or scraper) -> SKIP.

## Phase 2.3: The Cashier (Monetization & Tracking)
**Objective:** Ensure every link is monetized before content generation.
- [ ] **Task 2.3.1: Affiliate Link Transformation**
    - Create n8n node to pass `raw_url` to Cuelinks/vCommission API.
    - Append Sub-IDs: `&subid=auto_telegram` or `&subid=auto_web`.
    - **Fallback:** If Cuelinks fails, use direct Amazon/Flipkart affiliate tagging logic as backup.

## Phase 2.4: The Copywriter (AI Content Engine)
**Objective:** Generate platform-specific content that doesn't look like a bot.
- [ ] **Task 2.4.1: Advanced Prompt Engineering**
    - Create specific prompts for Gemini 2.0 Flash:
        - **Telegram Persona:** "Urgent, formatting-heavy (bold/strike), emoji-rich."
        - **Twitter Persona:** "Thread-starter, question-based hook, hashtags."
        - **Web Persona:** "SEO-focused description, key specs list."
- [ ] **Task 2.4.2: Content Generation Workflow**
    - Integrate Gemini node in n8n.
    - Input: Product Title, Specs, Discount %.
    - Output: JSON object with `{ telegram_text, twitter_text, web_summary }`.

## Phase 2.5: The Broadcaster (Distribution)
**Objective:** Publish content to channels and sync back to the dashboard.
- [ ] **Task 2.5.1: Telegram Automation**
    - Connect n8n to Telegram Bot API.
    - Send `telegram_text` + Image.
- [ ] **Task 2.5.2: Sync to LinkGenie Dashboard**
    - Fire a Webhook from n8n to LinkGenie (Supabase).
    - Insert the processed deal into the main `deals` table so it appears in the "My Products" UI as "Auto-Generated".
- [ ] **Task 2.5.3: Twitter/X Integration (Optional/Later)**
    - Authenticate Twitter API in n8n.
    - Post tweets/threads.

## Phase 2.6: Analytics & Optimization
**Objective:** Measure success.
- [ ] **Task 2.6.1: Automation Dashboard**
    - Update `Dashboard.tsx` to show a chart: "Manual vs Automated Deals".
    - Track "Scout Success Rate" (Deals found vs Deals rejected).

---

## Immediate Next Steps (Session 1)
1.  **Database Prep:** Create the `discovered_deals` table.
2.  **API Helper:** Create the secure Cuelinks wrapper (so n8n or app can call it safely).
3.  **Prototype Workflow:** Create the first simple n8n workflow: *RSS Trigger -> Filter -> Database Log*.
