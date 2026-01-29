# PRD: LinkGenie Agentic Affiliate Engine (Phase 2)
## Automated Deal Discovery & Distribution System

---

## 1. Executive Summary

### 1.1 Objective
Transform LinkGenie from a manual link-generation tool into a fully autonomous affiliate marketing ecosystem. The system will automatically discover deals, generate platform-optimized content, monetize links, and distribute across multiple channels—all without manual intervention.

### 1.2 Core Philosophy
**"Sleep-to-Commission"** - The system runs 24/7, discovering and posting high-quality deals while you focus on strategy.

### 1.3 Success Metrics
- **Primary:** 50+ automated posts per day across all channels
- **Secondary:** 15%+ click-through rate on auto-generated content
- **Tertiary:** Zero duplicate posts (anti-spam validation)

---

## 2. System Architecture

### 2.1 Technology Stack
| Component | Technology | Hosting |
|-----------|-----------|---------|
| Orchestration | n8n | Self-Hosted (Docker on VPS) |
| Intelligence | Gemini 2.0 Flash | Google AI API |
| Database | PostgreSQL/Supabase | Supabase Cloud |
| Monetization | Cuelinks API | Cloud API |
| Distribution | Telegram Bot API, Twitter API | Cloud APIs |
| Frontend | React + Supabase | Existing LinkGenie App |

### 2.2 Workflow Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    TRIGGER LAYER                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │ Cron     │  │ RSS      │  │ Webhook  │                  │
│  │ Every    │  │ Feed     │  │ Manual   │                  │
│  │ 30 min   │  │ Monitor  │  │ Trigger  │                  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘                  │
└───────┼─────────────┼─────────────┼────────────────────────┘
        │             │             │
        └─────────────┴─────────────┘
                      │
        ┌─────────────▼─────────────┐
        │   n8n ORCHESTRATOR        │
        │   (Master Workflow)       │
        └─────────────┬─────────────┘
                      │
        ┌─────────────▼─────────────────────────────┐
        │         PROCESSING PIPELINE                │
        │                                            │
        │  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
        │  │  SCOUT   │→ │  BRAIN   │→ │ CASHIER │ │
        │  │ Discover │  │ Generate │  │ Monetize│ │
        │  │  Deals   │  │ Content  │  │  Links  │ │
        │  └──────────┘  └──────────┘  └─────────┘ │
        └─────────────┬──────────────────────────────┘
                      │
        ┌─────────────▼─────────────┐
        │   DISTRIBUTION LAYER       │
        │  ┌────────┐  ┌──────────┐ │
        │  │Telegram│  │ Website  │ │
        │  │  Bot   │  │Dashboard │ │
        │  └────────┘  └──────────┘ │
        └────────────────────────────┘
```

---

## 3. Detailed Component Specifications

### 3.1 The Scout (Discovery Engine)

#### 3.1.1 Data Sources
**RSS Feeds:**
- Amazon India: Bestsellers, Movers & Shakers
- Flipkart: Top Deals RSS (if available)
- Custom: Parse "Deal of the Day" pages

**Web Scraping Targets:**
- Amazon: `/gp/goldbox` (Lightning Deals)
- Flipkart: `/offers-store`
- Myntra: `/shop/deals`

#### 3.1.2 n8n Workflow: `deal-discovery`
**Trigger:** Cron (Every 30 minutes)

**Nodes:**
1. **RSS Feed Reader** (Amazon/Flipkart)
   - Parse feed
   - Extract: `title`, `link`, `pubDate`
   
2. **HTTP Request** (For non-RSS sources)
   - Fetch page HTML
   - Pass to Supabase Function `scrape-product`
   
3. **Database Check (Duplicate Filter)**
   - Query Supabase: `SELECT * FROM discovered_links WHERE url_hash = MD5($url)`
   - If exists → **STOP**
   - If new → Continue
   
4. **Quality Gate**
   - Check `discount_percent > 10`
   - Check `in_stock = true`
   - If failed → Log rejection, **STOP**
   
5. **Insert to `discovered_links`**
   - Store: `url`, `url_hash`, `source`, `first_seen`, `status: 'pending'`

**Output:** List of validated product URLs (max 5 per run)

---

### 3.2 The Brain (Content Generation)

#### 3.2.1 AI Prompting Strategy
**Platform-Specific Templates:**

**Telegram Format:**
```
Role: You are a deal curator for tech enthusiasts in India.
Task: Create a Telegram post using HTML formatting.

Rules:
- Use <b> for headlines
- Use <s> for original price (strikethrough)
- Include 2-3 relevant emojis
- Add urgency ("Limited Stock", "Today Only")
- Max 200 words

Example:
<b>🔥 Samsung Galaxy S24 Ultra - MASSIVE DROP!</b>

💰 Only <b>₹79,999</b> <s>₹1,09,999</s> (27% OFF!)

📱 Top Features:
• 200MP Camera
• Snapdragon 8 Gen 3
• 5000mAh Battery

⚡ <b>Limited Period Offer</b>
<a href="{LINK}">👉 GRAB NOW</a>
```

**Twitter Format:**
```
Create a 3-tweet thread:
1. Hook (question or bold statement)
2. Value prop (why this deal matters)
3. CTA with link and hashtags (#AmazonDeals #TechDeals)
```

#### 3.2.2 n8n Workflow: `content-generation`
**Trigger:** Webhook from `deal-discovery`

**Nodes:**
1. **Item Input** (product data from Scout)
2. **HTTP Request → Gemini API**
   - Endpoint: Gemini 2.0 Flash
   - Prompt: Dynamic based on platform
   - Response: JSON `{telegram_html, twitter_thread, web_summary}`
   
3. **Store Generated Content**
   - Update `discovered_links` SET `generated_content = $json`, `status = 'ready'`

---

### 3.3 The Cashier (Monetization)

#### 3.3.1 Cuelinks Integration
**API Endpoint:** `https://api.cuelinks.com/v1/affiliate-link`

**Request:**
```json
{
  "url": "https://amazon.in/dp/B0ABC123",
  "subid": "auto_telegram_20260126_001"
}
```

**Response:**
```json
{
  "affiliate_url": "https://cuelinks.to/redirect?..."
}
```

#### 3.3.2 Sub-ID Tracking Format
`auto_{channel}_{date}_{sequence}`

Examples:
- `auto_telegram_20260126_001`
- `auto_web_20260126_002`

#### 3.3.3 n8n Workflow: `monetize-link`
**Nodes:**
1. **HTTP Request → Cuelinks**
   - Auth: Bearer token from credentials
   - Retry: 3 attempts with 5s delay
   
2. **Fallback Logic**
   - If Cuelinks fails → Use direct Amazon Associates tag
   - Format: `{url}?tag={your_amazon_id}&ref=auto`
   
3. **Update Database**
   - SET `affiliate_url = $result.affiliate_url`

---

### 3.4 The Broadcaster (Distribution)

#### 3.4.1 Telegram Distribution
**n8n Node:** `Telegram.sendMessage`

**Configuration:**
```javascript
{
  chat_id: process.env.TELEGRAM_CHANNEL_ID,
  text: {{$node["content-generation"].json["telegram_html"]}},
  parse_mode: "HTML",
  disable_web_page_preview: false
}
```

**Multi-Channel Logic:**
- Query Supabase `telegram_channels` table
- Loop through all active channels
- Send to each with 2-second delay (anti-spam)

#### 3.4.2 Website Sync
**n8n Node:** `HTTP Request → Supabase`

**Webhook Endpoint:** Your existing Supabase API
**Action:** `INSERT INTO deals`

**Payload:**
```json
{
  "title": "{{$product.title}}",
  "original_url": "{{$product.url}}",
  "affiliate_url": "{{$monetized.link}}",
  "image_url": "{{$product.image}}",
  "original_price": "{{$product.original_price}}",
  "discounted_price": "{{$product.current_price}}",
  "discount_percent": "{{$product.discount}}",
  "category": "auto-generated",
  "merchant_name": "{{$product.merchant}}",
  "is_automated": true
}
```

---

## 4. Database Schema Updates

### 4.1 New Tables

#### `discovered_links`
```sql
CREATE TABLE discovered_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url TEXT NOT NULL,
  url_hash TEXT UNIQUE NOT NULL, -- MD5(normalized_url)
  source TEXT NOT NULL, -- 'amazon_rss', 'flipkart_scrape'
  first_seen TIMESTAMP DEFAULT NOW(),
  last_processed TIMESTAMP,
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'posted', 'rejected', 'failed'
  rejection_reason TEXT,
  generated_content JSONB,
  affiliate_url TEXT,
  posted_to_channels TEXT[], -- ['telegram_main', 'web']
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_url_hash ON discovered_links(url_hash);
CREATE INDEX idx_status ON discovered_links(status);
CREATE INDEX idx_first_seen ON discovered_links(first_seen);
```

#### `automation_logs`
```sql
CREATE TABLE automation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_name TEXT NOT NULL,
  run_at TIMESTAMP DEFAULT NOW(),
  status TEXT NOT NULL, -- 'success', 'partial', 'failed'
  deals_found INTEGER DEFAULT 0,
  deals_processed INTEGER DEFAULT 0,
  deals_posted INTEGER DEFAULT 0,
  error_log JSONB,
  execution_time_ms INTEGER
);
```

### 4.2 Schema Modifications

#### Update `deals` table:
```sql
ALTER TABLE deals ADD COLUMN is_automated BOOLEAN DEFAULT false;
ALTER TABLE deals ADD COLUMN source_workflow TEXT;
ALTER TABLE deals ADD COLUMN posted_channels TEXT[];
```

---

## 5. Implementation Phases

### Phase 1: Infrastructure Setup (Week 1)
**Tasks:**
- [ ] Set up n8n on self-hosted VPS (DigitalOcean/Hetzner)
- [ ] Create Supabase migration for new tables
- [ ] Set up Cuelinks API account and get credentials
- [ ] Configure n8n credentials (Supabase, Gemini, Cuelinks, Telegram)

**Deliverables:**
- Running n8n instance accessible at `n8n.yourdomain.com`
- Database tables created
- All API keys stored in n8n credentials vault

---

### Phase 2: The Scout (Week 2)
**Tasks:**
- [ ] Build `deal-discovery` workflow in n8n
- [ ] Test RSS parsing (Amazon/Flipkart)
- [ ] Implement duplicate detection logic
- [ ] Add quality filtering (discount %, stock status)
- [ ] Test full pipeline with 5 sample products

**Deliverables:**
- Working discovery workflow (manual trigger first)
- Logs showing duplicates correctly rejected
- Data in `discovered_links` table

---

### Phase 3: The Brain + Cashier (Week 3)
**Tasks:**
- [ ] Build `content-generation` workflow
- [ ] Create platform-specific Gemini prompts
- [ ] Integrate Cuelinks monetization
- [ ] Add fallback for Cuelinks failures
- [ ] Test with real product data

**Deliverables:**
- Generated content in 3 formats (Telegram/Twitter/Web)
- Monetized affiliate links with tracking
- Sample output for review

---

### Phase 4: The Broadcaster (Week 4)
**Tasks:**
- [ ] Connect Telegram Bot API
- [ ] Implement multi-channel broadcast loop
- [ ] Add website sync (webhook to Supabase)
- [ ] Create error handling and retry logic
- [ ] Enable rate limiting (2s between posts)

**Deliverables:**
- Messages appearing in Telegram channels
- Deals visible in LinkGenie dashboard (tagged as "Auto-Generated")
- Logs showing successful broadcasts

---

### Phase 5: Automation & Monitoring (Week 5)
**Tasks:**
- [ ] Enable cron triggers (every 30 mins)
- [ ] Build monitoring dashboard in LinkGenie
  - Show automation logs
  - Display success/failure rates
  - List recent auto-generated deals
- [ ] Set up error alerts (email/Slack when workflow fails)
- [ ] Optimize performance (reduce API calls)

**Deliverables:**
- Fully autonomous system running 24/7
- Dashboard page showing automation health
- Alert system for failures

---

## 6. n8n Workflow Details

### 6.1 Master Workflow: `auto-affiliate-pipeline`
**Type:** Main orchestrator
**Trigger:** Cron (`*/30 * * * *`) - Every 30 minutes

**Flow:**
```
[Cron Trigger]
    ↓
[Check Last Run Time] → If < 25 mins ago → STOP (prevent overlap)
    ↓
[Execute Discovery] → Calls `deal-discovery` sub-workflow
    ↓
[Process Items Loop] → For each valid URL:
    ├─ [Generate Content] → Calls `content-generation`
    ├─ [Monetize Link] → Calls `monetize-link`
    └─ [Broadcast] → Calls `broadcaster`
    ↓
[Log Results] → Insert to `automation_logs`
    ↓
[Error Notification] → If failures > 50% → Send alert
```

### 6.2 Sub-Workflow: `deal-discovery`
Already detailed in Section 3.1.2

### 6.3 Sub-Workflow: `broadcaster`
**Nodes:**
1. **Split to Batches** (5 items at a time)
2. **Loop:**
   - Send to Telegram
   - Wait 2 seconds
   - Send to Website (Supabase webhook)
3. **Update Status** (`discovered_links.status = 'posted'`)

---

## 7. Cost Analysis

### 7.1 Infrastructure Costs
| Service | Plan | Monthly Cost |
|---------|------|--------------|
| n8n VPS | DigitalOcean Basic (2GB RAM) | $12/mo |
| Supabase | Pro (already paying) | $0 incremental |
| Cuelinks | Free tier (10k conversions) | $0 |
| Gemini API | Pay-as-you-go (~500 calls/day @ $0.0001) | ~$1.50/mo |
| **TOTAL** | | **~$13.50/mo** |

### 7.2 ROI Calculation
**Assumptions:**
- 50 auto-posts/day = 1,500/month
- 5% CTR = 75 clicks/day
- 1% conversion = 0.75 sales/day = 22.5 sales/month
- Avg commission: ₹200/sale
- **Monthly Revenue:** ₹4,500 (~$55)

**Net Profit:** $55 - $13.50 = **$41.50/mo** (306% ROI)

---

## 8. Control Panel (Dashboard Integration)

### 8.1 New Page: `Automation.tsx`
**Route:** `/automation`

**Sections:**
1. **Live Status**
   - Last run time
   - Current status (Running/Idle/Error)
   - Deals in queue
   
2. **Statistics (Last 24h)**
   - Deals discovered
   - Deals posted
   - Success rate %
   - Top performing channel
   
3. **Manual Controls**
   - [Trigger Now] button (webhook to n8n)
   - [Pause/Resume] toggle
   - [View Logs] (table from `automation_logs`)
   
4. **Recent Activity**
   - Real-time feed of auto-generated deals
   - Links to view full posts

---

## 9. Risk Mitigation

### 9.1 Anti-Spam Measures
- **Duplicate Detection:** Hash-based checking
- **Rate Limiting:** Max 5 posts per run (30 min interval)
- **Quality Gate:** Only discount > 10%

### 9.2 Error Handling
- **API Failures:** Retry 3x with exponential backoff
- **Data Validation:** Schema checks before DB insert
- **Graceful Degradation:** Skip failed items, continue pipeline

### 9.3 Monitoring
- **Health Checks:** n8n webhook every 5 mins
- **Alert Triggers:**
  - No successful runs in 2 hours
  - Error rate > 50%
  - Telegram API auth failure

---

## 10. Success Criteria

### 10.1 MVP Launch (End of Week 5)
- [ ] System runs autonomously for 48 hours without intervention
- [ ] Generates 20+ posts/day
- [ ] Zero duplicate posts
- [ ] 90%+ uptime

### 10.2 Optimization Phase (Month 2)
- [ ] Increase to 50+ posts/day
- [ ] Add Twitter distribution
- [ ] Implement ML-based quality scoring
- [ ] A/B test different content templates

---

## 11. Next Steps (Immediate Actions)

### Week 1 Checklist:
1. **Day 1-2:** Provision VPS and install n8n
2. **Day 3:** Run Supabase migrations
3. **Day 4:** Set up Cuelinks account
4. **Day 5:** Configure all n8n credentials
5. **Day 6-7:** Build first version of `deal-discovery` workflow

**First Milestone:** Successfully discover 5 deals and log them to the database.

---

## Appendix A: n8n Credentials Setup

**Required Credentials in n8n:**
1. **Supabase**
   - Type: Header Auth
   - Key: `apikey`
   - Value: `{SUPABASE_ANON_KEY}`
   
2. **Gemini API**
   - Type: Generic Credential
   - API Key: `{GEMINI_API_KEY}`
   
3. **Cuelinks**
   - Type: Header Auth
   - Key: `Authorization`
   - Value: `Bearer {CUELINKS_TOKEN}`
   
4. **Telegram Bot**
   - Type: Telegram API
   - Bot Token: `{TELEGRAM_BOT_TOKEN}`
