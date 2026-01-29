# Implementation Plan: Nexus-Affiliate Platform
## **🤖 AUTOMATION-FIRST EDITION**

**Version:** 2.0 (n8n + Gemini Pro)  
**Date:** January 28, 2026  
**Approach:** Maximum Automation, Minimum Manual Work  
**Timeline:** 10 Weeks to Full Automation

---

## Executive Summary

This implementation plan delivers a **fully autonomous affiliate content platform** powered by **15 n8n workflows** and **Gemini Pro AI**. After initial setup, the system operates with **zero daily manual intervention**, continuously discovering trends, generating content, publishing, distributing, and optimizing itself.

### Automation-First Principles

1. **n8n orchestrates everything** - No cron jobs, no separate scripts
2. **Gemini Pro powers all AI** - 75% cost savings vs Claude/GPT-4
3. **Self-healing by default** - Error recovery workflow handles failures
4. **Event-driven architecture** - Workflows trigger each other automatically
5. **One-time setup, infinite operation** - Set it and (mostly) forget it

### Key Deliverables

- 15 production-ready n8n workflows (with JSON exports)
- Next.js frontend optimized for ISR
- Supabase database with automation-optimized schema
- Complete monitoring and alerting system
- Zero-touch content pipeline (10+ articles/day)

---

## User Review Required

> [!IMPORTANT]
> **Resource Requirements (Automation-Optimized)**
> - **Initial Setup Time:** 80-100 hours (one-time investment)
> - **Ongoing Manual Work:** <2 hours/week (monitoring only)
> - **n8n Hosting:** $20/month (self-hosted on Digital Ocean) OR $20/month (n8n Cloud starter)
> - **Gemini Pro API:** ~$100/month (vs $400-600 for Claude/GPT-4)
> - **Other Services:** ~$150/month (Supabase, Firecrawl, Ayrshare, etc.)
> - **Total Monthly Cost:** ~$270/month (70% cheaper than multi-LLM approach)

> [!WARNING]
> **Critical Decisions Needed**
> 1. **n8n Hosting:** Self-hosted (more control, cheaper long-term) vs n8n Cloud (easier setup, higher cost at scale)
> 2. **Content Approval:** Zero-approval (full automation) vs First-50-Review (quality assurance)
> 3. **Error Handling:** Auto-retry + alert vs Pause-and-review
> 4. **Image Generation:** Replicate (cheaper, slower) vs DALL-E 3 (faster, pricier)

> [!CAUTION]
> **Automation Risks to Address**
> - First 2 weeks: Manual review of AI outputs to calibrate prompts
> - Gemini API rate limits: 60 requests/minute (manageable but need monitoring)
> - Workflow dependencies: One failure can block downstream workflows
> - Data quality: Garbage in, garbage out - trend detection must be solid

---

## Proposed Changes

### Component 1: n8n Automation Hub (THE CORE)

> **This is the heart of the system** - All intelligence and automation flows through n8n

#### [NEW] [n8n/docker-compose.yml](file:///Users/kartheekchintamani/Code/Projects/linkgeniekr/n8n/docker-compose.yml)

**Setup:** Self-hosted n8n with PostgreSQL

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    restart: always
    environment:
      POSTGRES_DB: n8n
      POSTGRES_USER: n8n
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - n8n-postgres-data:/var/lib/postgresql/data
    networks:
      - n8n-network

  n8n:
    image: n8nio/n8n:latest
    restart: always
    ports:
      - "5678:5678"
    environment:
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_DATABASE=n8n
      - DB_POSTGRESDB_USER=n8n
      - DB_POSTGRESDB_PASSWORD=${POSTGRES_PASSWORD}
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=${N8N_USER}
      - N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD}
      - N8N_HOST=${N8N_HOST}
      - N8N_PROTOCOL=https
      - NODE_ENV=production
      - WEBHOOK_URL=${N8N_WEBHOOK_URL}
      - GENERIC_TIMEZONE=Asia/Kolkata
      # Increase timeout for long-running AI tasks
      - EXECUTIONS_TIMEOUT=600
      - EXECUTIONS_TIMEOUT_MAX=1200
    volumes:
      - n8n-data:/home/node/.n8n
    networks:
      - n8n-network
    depends_on:
      - postgres

volumes:
  n8n-postgres-data:
  n8n-data:

networks:
  n8n-network:
```

---

### Component 2: n8n Workflow Implementations

#### [NEW] [n8n-workflows/WF1-trend-detector.json](file:///Users/kartheekchintamani/Code/Projects/linkgeniekr/n8n-workflows/WF1-trend-detector.json)

**Workflow 1: Trend Detector**

**Visual Node Structure:**
```
[Schedule Trigger (0,0,6,12,18)]
    ↓
[HTTP: Google Trends] ────┐
[HTTP: Product Hunt] ──────┤
[HTTP: Reddit API] ────────┤
[HTTP: Twitter API] ───────┤
[HTTP: Amazon Best] ───────┘
    ↓
[Merge: All Sources]
    ↓
[Code: Normalize Data]
    ↓
[Gemini Pro: Score Viability]
    ↓
[Filter: Score > 70]
    ↓
[Gemini Pro: Generate Keywords]
    ↓
[Supabase: Check Duplicates]
    ↓
[IF: Not Duplicate]
        ↓
    [Supabase: Insert to Queue]
        ↓
    [Slack: Notify High Priority] (optional)
```

**Key Node Configurations:**

**1. Schedule Trigger:**
```json
{
  "rule": "0 0,6,12,18 * * *",
  "name": "Every 6 hours"
}
```

**2. HTTP: Google Trends:**
```json
{
  "method": "GET",
  "url": "https://trends.google.com/trends/api/dailytrends",
  "qs": {
    "geo": "US",
    "hl": "en-US"
  },
  "authentication": "none"
}
```

**3. Gemini Pro: Score Viability:**
```json
{
  "method": "POST",
  "url": "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
  "authentication": "api_key",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "contents": [{
      "parts": [{
        "text": "You are an affiliate marketing analyst...(full prompt from PRD)"
      }]
    }],
    "generationConfig": {
      "temperature": 0.3,
      "topK": 40,
      "topP": 0.95,
      "maxOutputTokens": 2048,
      "responseMimeType": "application/json"
    }
  }
}
```

**4. Supabase: Insert to Queue:**
```json
{
  "method": "POST",
  "url": "{{$env.SUPABASE_URL}}/rest/v1/content_queue",
  "headers": {
    "apikey": "{{$env.SUPABASE_ANON_KEY}}",
    "Authorization": "Bearer {{$env.SUPABASE_SERVICE_KEY}}",
    "Content-Type": "application/json"
  },
  "body": {
    "topic": "={{$json.topic}}",
    "source": "={{$json.source}}",
    "priority_score": "={{$json.score}}",
    "target_keyword": "={{$json.target_keywords[0]}}",
    "metadata": "={{JSON.stringify($json)}}"
  }
}
```

---

#### [NEW] [n8n-workflows/WF4-content-generator.json](file:///Users/kartheekchintamani/Code/Projects/linkgeniekr/n8n-workflows/WF4-content-generator.json)

**Workflow 4: Content Generator (MASTER)**

**Visual Node Structure:**
```
[Schedule: Every 1 hour]
    ↓
[Supabase: Get Top Queue Item (status=queued)]
    ↓
[IF: Item Exists] ──── NO ──→ [Stop]
    ↓ YES
[Supabase: Update Status to 'processing']
    ↓
[Set: Variables (topic, keyword, etc.)]
    ↓
[Firecrawl: Scrape Top 3 Articles] ─┐
    ↓                                │
[Gemini: Research Agent] ←──────────┘
    ↓
[Gemini: Writer Agent]
    ↓
[Gemini: Editor Agent]
    ↓
[Gemini: Meta Generator]
    ↓
[Gemini: FAQ Generator]
    ↓
[Execute Workflow: WF5 Quality Check]
    ↓
[IF: QA Passed] ──── NO ──→ [Execute: WF15 Error Recovery]
    ↓ YES
[Execute Workflow: WF6 Asset Creator]
    ↓
[Execute Workflow: WF7 SEO Optimizer]
    ↓
[Supabase: Insert Article]
    ↓
[Supabase: Update Queue Status = 'completed']
    ↓
[Execute Workflow: WF8 Publisher]
```

**Key Node: Gemini Writer Agent**

```json
{
  "name": "Gemini Writer Agent",
  "type": "n8n-nodes-base.httpRequest",
  "position": [1200, 300],
  "parameters": {
    "method": "POST",
    "url": "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
    "authentication": "predefinedCredentialType",
    "nodeCredentialType": "googleGenerativeAiApi",
    "sendQuery": false,
    "sendHeaders": true,
    "headerParameters": {
      "parameter": [
        {
          "name": "Content-Type",
          "value": "application/json"
        }
      ]
    },
    "sendBody": true,
    "bodyParameters": {
      "parameter": [
        {
          "name": "contents",
          "value": "={{[\n  {\n    \"parts\": [{\n      \"text\": `You are a tech journalist for Nexus-Affiliate writing the article: \"${$json.title}\"\n\nOutline: ${JSON.stringify($json.outline)}\nTarget Length: 2000-2500 words\nStyle: Informative, conversational, trustworthy\n\nCRITICAL RULES:\n1. Use \"we\", \"our testing\", \"in our experience\"\n2. Include specific details and numbers\n3. Natural keyword integration\n4. Add [internal link] suggestions\n5. Include product comparisons\n6. End with \"Best Overall\" pick\n7. Add affiliate disclosure at top\n\nFormat in Markdown. Return complete article.`\n    }]\n  }\n]}"
        },
        {
          "name": "generationConfig",
          "value": "={\"temperature\": 0.7, \"maxOutputTokens\": 8192}"
        }
      ]
    }
  }
}
```

**Node: Execute Sub-Workflow (WF5 QA)**
```json
{
  "name": "Execute WF5 Quality Check",
  "type": "n8n-nodes-base.executeWorkflow",
  "position": [1800, 300],
  "parameters": {
    "workflowId": "={{$env.WF5_WORKFLOW_ID}}",
    "inputData": {
      "article_content": "={{$json.article_content}}",
      "metadata": "={{$json.metadata}}"
    },
    "waitForResults": true
  }
}
```

---

#### [NEW] [n8n-workflows/WF5-quality-assurance.json](file:///Users/kartheekchintamani/Code/Projects/linkgeniekr/n8n-workflows/WF5-quality-assurance.json)

**Workflow 5: Quality Assurance**

**Node Structure:**
```
[Webhook Trigger: From WF4]
    ↓
[Set: Input Variables]
    ↓
[HTTP: Copyscape Plagiarism Check] ─────┐
    ↓                                    │
[Code: Calculate Readability Score] ────┤
    ↓                                    │
[Code: Keyword Density Check] ──────────┤
    ↓                                    │
[Gemini: Quality Assessment] ───────────┘
    ↓
[Code: Aggregate All Checks]
    ↓
[IF: All Checks Passed]
    ↓ YES                    ↓ NO
[Return: PASS]          [Return: FAIL + Reasons]
```

**Key Node: Readability Calculation**
```javascript
// Code node: Calculate Flesch-Kincaid
const text = $input.item.json.article_content;

// Strip markdown
const plainText = text.replace(/[#*`\[\]]/g, '');

// Count sentences
const sentences = plainText.split(/[.!?]+/).filter(s => s.trim().length > 0).length;

// Count words
const words = plainText.split(/\s+/).filter(w => w.length > 0).length;

// Count syllables (simplified)
const syllables = plainText.match(/[aeiouy]{1,2}/gi)?.length || 0;

// Flesch-Kincaid formula
const score = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);

return {
  readability_score: Math.round(score),
  passed: score >= 50 && score <= 70, // Sweet spot for general audience
  words: words,
  sentences: sentences
};
```

**Key Node: Gemini Quality Assessment**
```json
{
  "prompt": "Rate this article on quality (0-100):\n\n{{$json.article_content}}\n\nCriteria:\n- Provides genuine value\n- Specific, detailed information\n- Clear structure\n- Trustworthy tone\n- Unique insights\n- Proper grammar\n\nReturn JSON: {\"score\": number, \"strengths\": [], \"weaknesses\": [], \"pass_threshold\": boolean}",
  "temperature": 0.2,
  "maxOutputTokens": 1024
}
```

---

#### [NEW] [n8n-workflows/WF6-asset-creator.json](file:///Users/kartheekchintamani/Code/Projects/linkgeniekr/n8n-workflows/WF6-asset-creator.json)

**Workflow 6: Asset Creator**

**Node Structure:**
```
[Webhook: From WF4]
    ↓
[Gemini: Generate Image Prompts]
    ↓
[Split: Create 4 Parallel Branches]
    ↓
[Replicate: Hero Image] ────────────┐
[Replicate: Social 1:1] ────────────┤
[Replicate: Social 16:9] ───────────┤
[Replicate: Social 9:16] ───────────┘
    ↓
[Merge: All Images]
    ↓
[Loop: For Each Image]
    ↓
    [Code: Compress & Optimize]
    ↓
    [Supabase Storage: Upload]
    ↓
    [Gemini Vision: Generate Alt Text]
    ↓
[End Loop]
    ↓
[Supabase: Update Article with URLs]
    ↓
[Return: SUCCESS]
```

**Key Node: Replicate Image Generation**
```json
{
  "name": "Replicate: Hero Image",
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "method": "POST",
    "url": "https://api.replicate.com/v1/predictions",
    "authentication": "predefinedCredentialType",
    "nodeCredentialType": "replicateApi",
    "sendBody": true,
    "bodyParameters": {
      "version": "black-forest-labs/flux-1-schnell",
      "input": {
        "prompt": "={{$json.hero_image_prompt}}",
        "width": 1200,
        "height": 630,
        "num_outputs": 1
      }
    }
  }
}
```

**Key Node: Gemini Vision Alt Text**
```json
{
  "prompt": "Describe this image for accessibility (alt text). Be concise (120 chars max) but descriptive:\n\nImage URL: {{$json.image_url}}",
  "model": "gemini-pro-vision",
  "temperature": 0.3
}
```

---

#### [NEW] [n8n-workflows/WF9-social-distributor.json](file:///Users/kartheekchintamani/Code/Projects/linkgeniekr/n8n-workflows/WF9-social-distributor.json)

**Workflow 9: Social Media Distributor**

**Node Structure:**
```
[Webhook: From WF8] OR [Schedule: Optimal Times]
    ↓
[Supabase: Get Article Details]
    ↓
[Gemini: Generate Social Copy for All Platforms]
    ↓
[Gemini: Generate Hashtag Strategy]
    ↓
[Split: Parallel Social Posts]
    ↓
[Ayrshare: Twitter] ─────────────┐
[Ayrshare: LinkedIn] ────────────┤
[Ayrshare: Instagram] ───────────┤
[Ayrshare: Facebook] ────────────┤
[Pinterest API: Create Pin] ─────┘
    ↓
[Merge: All Post Results]
    ↓
[Loop: Store Each Post]
    ↓
    [Supabase: Insert social_posts]
    ↓
[End Loop]
    ↓
[Google Sheets: Log Posts]
```

**Key Node: Ayrshare Multi-Platform**
```json
{
  "name": "Ayrshare: Multi-Post",
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "method": "POST",
    "url": "https://app.ayrshare.com/api/post",
    "authentication": "predefinedCredentialType",
    "nodeCredentialType": "ayrshareApi",
    "sendBody": true,
    "bodyParameters": {
      "post": "={{$json.twitter_copy}}",
      "platforms": ["twitter", "linkedin", "instagram", "facebook"],
      "mediaUrls": ["={{$json.image_url}}"],
      "shortenLinks": true,
      "scheduleDate": "={{$json.optimal_post_time}}"
    }
  }
}
```

---

### Component 3: Frontend Application

#### [NEW] [package.json](file:///Users/kartheekchintamani/Code/Projects/linkgeniekr/package.json)

**Minimal Dependencies (Automation-Optimized)**

```json
{
  "name": "nexus-affiliate",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^15.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@supabase/supabase-js": "^2.39.0",
    "@tanstack/react-query": "^5.17.0",
    "next-themes": "^0.2.1",
    "framer-motion": "^11.0.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "typescript": "^5",
    "tailwindcss": "^4.0",
    "autoprefixer": "^10"
  }
}
```

**Why minimal?** The frontend is mostly static content served via ISR. Heavy lifting happens in n8n workflows.

---

#### [NEW] [app/layout.tsx](file:///Users/kartheekchintamani/Code/Projects/linkgeniekr/app/layout.tsx)

**Root Layout with Analytics**

```typescript
import { Analytics } from '@/components/Analytics'
import { ThemeProvider } from 'next-themes'

export const metadata = {
  metadataBase: new URL('https://nexus-affiliate.com'),
  title: {
    template: '%s | Nexus-Affiliate',
    default: 'Nexus-Affiliate - AI-Powered Tech Reviews'
  },
  description: 'Comprehensive, unbiased tech reviews powered by AI research'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system">
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
```

---

#### [NEW] [app/reviews/[slug]/page.tsx](file:///Users/kartheekchintamani/Code/Projects/linkgeniekr/app/reviews/[slug]/page.tsx)

**Dynamic Review Page with ISR**

```typescript
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Suspense } from 'react'
import { notFound } from 'next/navigation'

// ISR: Revalidate every 4 hours
export const revalidate = 14400

export async function generateStaticParams() {
  const supabase = createServerComponentClient({ cookies })
  
  // Pre-generate top 100 articles at build time
  const { data: articles } = await supabase
    .from('articles')
    .select('slug')
    .eq('status', 'published')
    .order('total_views', { ascending: false })
    .limit(100)
  
  return articles?.map(article => ({ slug: article.slug })) || []
}

export default async function ReviewPage({ params }: { params: { slug: string } }) {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: article } = await supabase
    .from('articles')
    .select('*, products(*)')
    .eq('slug', params.slug)
    .eq('status', 'published')
    .single()
  
  if (!article) notFound()
  
  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(article.schema_markup) }}
      />
      
      <h1>{article.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: article.html_content }} />
      
      {/* Affiliate disclosure */}
      <AffiliateDisclosure />
      
      {/* Track affiliate clicks */}
      <Suspense fallback={null}>
        <AffiliateTracker articleId={article.id} />
      </Suspense>
    </article>
  )
}
```

---

#### [NEW] [components/AffiliateTracker.tsx](file:///Users/kartheekchintamani/Code/Projects/linkgeniekr/components/AffiliateTracker.tsx)

**Client Component for Click Tracking**

```typescript
'use client'

import { useEffect } from 'react'

export function AffiliateTracker({ articleId }: { articleId: string }) {
  useEffect(() => {
    // Track all affiliate link clicks
    const handleClick = async (e: MouseEvent) => {
      const target = e.target as HTMLAnchorElement
      
      if (target.tagName === 'A' && target.dataset.affiliateId) {
        // Track click
        await fetch('/api/affiliate/track-click', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: target.dataset.productId,
            articleId: articleId,
            affiliateId: target.dataset.affiliateId
          })
        })
        
        // Optional: Trigger n8n webhook for advanced tracking
        await fetch(process.env.NEXT_PUBLIC_N8N_WEBHOOK_CLICK_TRACKING!, {
          method: 'POST',
          body: JSON.stringify({ productId: target.dataset.productId, articleId })
        })
      }
    }
    
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [articleId])
  
  return null
}
```

---

### Component 4: Supabase Database

#### [NEW] [supabase/migrations/001_automation_schema.sql](file:///Users/kartheekchintamani/Code/Projects/linkgeniekr/supabase/migrations/001_automation_schema.sql)

**Complete automation-optimized schema** (from PRD Section 3)

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Content queue (feeds WF4)
CREATE TABLE content_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic TEXT NOT NULL,
  source TEXT,
  priority_score DECIMAL(5,2),
  target_keyword TEXT,
  keyword_volume INTEGER,
  keyword_difficulty INTEGER,
  estimated_commission_rate DECIMAL(5,2),
  metadata JSONB,
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP,
  article_id UUID
);

CREATE INDEX idx_queue_status_priority ON content_queue(status, priority_score DESC);
CREATE INDEX idx_queue_created ON content_queue(created_at DESC);

-- Articles
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  meta_description TEXT,
  content TEXT,
  html_content TEXT,
  excerpt TEXT,
  featured_image_url TEXT,
  featured_image_alt TEXT,
  
  target_keyword TEXT,
  secondary_keywords TEXT[],
  schema_markup JSONB,
  
  category TEXT,
  tags TEXT[],
  
  generated_by TEXT DEFAULT 'gemini-pro',
  quality_score DECIMAL(5,2),
  readability_score DECIMAL(5,2),
  plagiarism_score DECIMAL(5,2),
  
  status TEXT DEFAULT 'draft',
  published_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW(),
  last_refreshed_at TIMESTAMP,
  
  total_views INTEGER DEFAULT 0,
  total_affiliate_clicks INTEGER DEFAULT 0,
  estimated_revenue DECIMAL(10,2) DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_status_published ON articles(status, published_at DESC);
CREATE INDEX idx_articles_keyword ON articles(target_keyword);

-- Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  brand TEXT,
  category TEXT,
  
  price DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  price_last_checked TIMESTAMP,
  
  affiliate_link TEXT NOT NULL,
  affiliate_program TEXT,
  commission_rate DECIMAL(5,2),
  
  description TEXT,
  image_url TEXT,
  features JSONB,
  specs JSONB,
  pros TEXT[],
  cons TEXT[],
  
  our_rating DECIMAL(3,2),
  amazon_rating DECIMAL(3,2),
  review_count INTEGER,
  
  total_clicks INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_slug ON products(slug);

-- Affiliate clicks
CREATE TABLE affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id),
  article_id UUID REFERENCES articles(id),
  user_id UUID,
  
  clicked_at TIMESTAMP DEFAULT NOW(),
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  
  user_agent TEXT,
  device_type TEXT,
  country TEXT,
  
  converted BOOLEAN DEFAULT FALSE,
  conversion_date TIMESTAMP,
  commission_amount DECIMAL(10,2),
  commission_currency TEXT
);

CREATE INDEX idx_clicks_product ON affiliate_clicks(product_id);
CREATE INDEX idx_clicks_article ON affiliate_clicks(article_id);
CREATE INDEX idx_clicks_date ON affiliate_clicks(clicked_at DESC);

-- Social posts
CREATE TABLE social_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID REFERENCES articles(id),
  platform TEXT,
  post_id TEXT,
  post_content TEXT,
  post_url TEXT,
  image_url TEXT,
  
  impressions INTEGER DEFAULT 0,
  engagements INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2),
  
  posted_at TIMESTAMP DEFAULT NOW(),
  metrics_last_updated TIMESTAMP
);

CREATE INDEX idx_social_article ON social_posts(article_id);
CREATE INDEX idx_social_platform ON social_posts(platform);

-- Email subscribers
CREATE TABLE email_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  
  subscription_tier TEXT DEFAULT 'free',
  subscription_source TEXT,
  preferences JSONB,
  
  subscribed_at TIMESTAMP DEFAULT NOW(),
  unsubscribed_at TIMESTAMP,
  email_verified BOOLEAN DEFAULT FALSE,
  
  total_emails_received INTEGER DEFAULT 0,
  total_emails_opened INTEGER DEFAULT 0,
  total_links_clicked INTEGER DEFAULT 0,
  last_engaged_at TIMESTAMP
);

CREATE INDEX idx_subscribers_email ON email_subscribers(email);
CREATE INDEX idx_subscribers_tier ON email_subscribers(subscription_tier);

-- Workflow errors (for WF15)
CREATE TABLE workflow_errors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id TEXT,
  workflow_name TEXT,
  error_type TEXT,
  error_message TEXT,
  error_context JSONB,
  
  resolution_status TEXT DEFAULT 'new',
  ai_suggested_fix TEXT,
  
  occurred_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);

CREATE INDEX idx_errors_status ON workflow_errors(resolution_status);
CREATE INDEX idx_errors_occurred ON workflow_errors(occurred_at DESC);

-- Row-Level Security
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Public read for published articles
CREATE POLICY "Public read published articles"
  ON articles FOR SELECT
  USING (status = 'published');

-- Public read for products
CREATE POLICY "Public read products"
  ON products FOR SELECT
  USING (true);
```

---

## Verification Plan

### Phase 1: Individual Workflow Testing

**Week 1-2: Test each workflow in isolation**

```bash
# Test WF1: Trend Detector
1. Manually trigger WF1
2. Verify it hits all APIs (Google Trends, Product Hunt, etc.)
3. Check Gemini scoring works
4. Confirm topics inserted to Supabase content_queue
5. Validate priority scoring logic

# Test WF4: Content Generator
1. Manually add a topic to content_queue
2. Trigger WF4
3. Monitor execution (should take 8-12 min)
4. Verify Firecrawl scrapes competitors
5. Check all 3 Gemini agents run
6. Confirm WF5, WF6, WF7 are called
7. Validate final article in database

# Test WF5: Quality Assurance
1. Feed it a good article → should PASS
2. Feed it plagiarized content → should FAIL
3. Feed it keyword-stuffed content → should FAIL
4. Verify all checks run correctly

# Test WF9: Social Distributor
1. Trigger with test article
2. Verify posts to all platforms (Twitter, LinkedIn, etc.)
3. Check social_posts table populated
4. Validate images attached correctly
```

### Phase 2: End-to-End Integration Testing

**Week 3: Full automation pipeline**

```bash
# Scenario 1: Happy Path (Everything Works)
1. WF1 discovers trend → added to queue
2. WF4 picks it up → generates article
3. WF5 quality checks → PASSES
4. WF6 creates images
5. WF7 optimizes SEO
6. WF8 publishes to website
7. WF9 shares on social media
8. WF11 tracks analytics

Expected: New article live on site + social posts + analytics recorded

# Scenario 2: Quality Failure (WF5 Rejects)
1. Artificially lower quality_score threshold
2. WF4 generates article
3. WF5 fails it
4. WF15 error recovery kicks in
5. Logs error, alerts admin

Expected: No article published, error logged

# Scenario 3: API Failure (Gemini Down)
1. Temporarily disable Gemini API key
2. WF4 attempts generation
3. Should fail gracefully
4. WF15 logs error, sends alert

Expected: Graceful failure, no data corruption
```

### Phase 3: Load Testing

**Week 4: Stress test automation**

```bash
# Test: Can system handle 100 queued topics?
1. Bulk insert 100 topics to content_queue
2. Let WF4 run every hour
3. Monitor:
   - Gemini API rate limits
   - Database performance
   - Workflow execution times
   - Error rate

Target: 90%+ success rate, <10% errors

# Test: Social distribution at scale
1. Publish 50 articles in one day
2. WF9 should handle batched social posts
3. Monitor Ayrshare rate limits

Target: All posts successful or gracefully queued
```

### Phase 4: Manual Quality Audit

**Week 5-6: Human review of AI outputs**

```bash
# Review first 50 articles generated
For each article:
- [ ] Factually accurate?
- [ ] Well-structured?
- [ ] Affiliate disclosure present?
- [ ] Images relevant?
- [ ] Internal links appropriate?
- [ ] SEO optimized?
- [ ] Passes human "would I share this?" test

Target: 80%+ would share without edits
Action: Adjust Gemini prompts based on findings
```

---

## Resource Allocation

### Time Investment

| Phase | Tasks | Hours | Week |
|-------|-------|-------|------|
| **Setup** | n8n + Supabase setup | 8h | 1 |
| **WF1-3** | Trend detection workflows | 12h | 1-2 |
| **WF4-7** | Content generation pipeline | 20h | 2-3 |
| **WF8-10** | Publishing & distribution | 12h | 3-4 |
| **WF11-15** | Monitoring & optimization | 10h | 4-5 |
| **Frontend** | Next.js app | 15h | 5-6 |
| **Testing** | End-to-end validation | 12h | 6-7 |
| **Optimization** | Prompt tuning, bug fixes | 10h | 7-8 |
| **Launch Prep** | Final review, documentation | 6h | 8-9 |
| **TOTAL** | | **105h** | **9 weeks** |

**Daily Breakdown (if1 full-time developer):**
- **Weeks 1-8:** 13-15 hours/week (part-time)
- **Week 9:** Final push (20 hours)
- **Week 10:** Monitoring soft launch

---

## Cost Breakdown (Monthly)

| Service | Cost | Notes |
|---------|------|-------|
| **n8n Hosting** | $20 | Digital Ocean droplet (4GB RAM) |
| **Gemini Pro API** | $100 | ~13M tokens/day at $0.00025/1K |
| **Supabase Pro** | $25 | PostgreSQL + storage |
| **Firecrawl** | $39 | 1,000 pages/month plan |
| **Replicate (Images)** | $30 | ~300 images/month |
| **Ayrshare** | $30 | Social media posting |
| **Resend (Email)** | $20 | 50K emails/month |
| **Vercel Pro** | $20 | Unlimited bandwidth |
| **Domain** | $2 | .com domain |
| **Misc APIs** | $15 | SEMrush, analytics, etc. |
| **TOTAL** | **$301/month** | |

**Break-even:** ~60 affiliate conversions/month at $5 avg commission

---

## Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Gemini rate limits** | Medium | High | WF4 runs hourly (not faster), rate limit handling in WF15 |
| **Poor content quality** | Medium | High | WF5 strict QA, human audit first 50 articles, prompt refinement |
| **Affiliate program rejection** | Low | Medium | Start with 20-30 high-quality articles before applying |
| **n8n downtime** | Low | Critical | Self-hosted with health monitoring, auto-restart on crash |
| **Database overload** | Low | High | Connection pooling, read replicas at scale |
| **Broken affiliate links** | Medium | Medium | WF14 monitors 4x daily, auto-alert system |

---

## Success Criteria

### Week 10 (Launch)

- [ ] All 15 workflows operational and tested
- [ ] 50+ articles published (auto-generated)
- [ ] 90%+ automation rate (minimal manual intervention)
- [ ] <5% workflow error rate
- [ ] Gemini API costs <$150/month
- [ ] Next.js Lighthouse score 95+
- [ ] 100+ email subscribers (from soft launch)
- [ ] All legal pages live (privacy, terms, disclosures)

### Month 3 (Growth)

- [ ] 300+ articles published
- [ ] 10,000+ monthly pageviews
- [ ] 2%+ affiliate CTR
- [ ] $1,000+ monthly revenue
- [ ] 1,000+ email subscribers
- [ ] 98%+ workflow uptime
- [ ] Zero critical errors in logs

### Month 6 (Scale)

- [ ] 1,000+ articles published
- [ ] 50,000+ monthly pageviews
- [ ] 3%+ affiliate CTR
- [ ] $5,000+ monthly revenue
- [ ] 5,000+ email subscribers
- [ ] Page 1 rankings for 50+ keywords
- [ ] Featured in at least 1 tech publication

---

## Deployment Checklist

### Pre-Launch

**n8n Setup:**
- [ ] Deploy n8n via Docker Compose
- [ ] Secure with HTTPS (Let's Encrypt)
- [ ] Enable basic auth
- [ ] Import all 15 workflows
- [ ] Test each workflow individually
- [ ] Set up workflow health monitoring

**Supabase Setup:**
- [ ] Create project
- [ ] Run all migrations
- [ ] Set up Row-Level Security
- [ ] Configure automated backups (daily)
- [ ] Enable connection pooling

**API Credentials:**
- [ ] Gemini Pro API key (with billing)
- [ ] Firecrawl API key
- [ ] Ayrshare API key
- [ ] Replicate API key
- [ ] Resend API key
- [ ] Google Trends (no auth needed)
- [ ] Product Hunt API token
- [ ] Reddit API credentials
- [ ] Twitter API credentials

**Frontend Deploy:**
- [ ] Vercel project created
- [ ] Environment variables set
- [ ] Custom domain configured
- [ ] Analytics installed (GA4 + Mixpanel)
- [ ] Cookie consent banner live

### Post-Launch

**Week 1:**
- [ ] Monitor workflow execution logs daily
- [ ] Review first 20 auto-generated articles
- [ ] Check affiliate link tracking works
- [ ] Verify social posts going out
- [ ] Audit Gemini API costs

**Week 2:**
- [ ] Analyze first week traffic sources
- [ ] Check which articles getting traction
- [ ] Review email subscriber growth
- [ ] Test A/B testing workflow (WF12)
- [ ] Optimize prompts based on output quality

**Week 3-4:**
- [ ] Apply to affiliate programs (with 30+ articles)
- [ ] Set up revenue tracking
- [ ] Launch weekly email newsletter
- [ ] Enable premium content paywall
- [ ] Start collecting user feedback

---

## Appendix A: n8n Workflow JSON Exports

> **Note:** Full JSON exports for all 15 workflows are too large to include inline. They will be provided as separate files in `/n8n-workflows/` directory:

**Workflow Files:**
1. `WF1-trend-detector.json` (1,200 lines)
2. `WF2-keyword-researcher.json` (800 lines)
3. `WF3-competitor-monitor.json` (900 lines)
4. `WF4-content-generator.json` (2,500 lines) **← MASTER WORKFLOW**
5. `WF5-quality-assurance.json` (1,000 lines)
6. `WF6-asset-creator.json` (1,100 lines)
7. `WF7-seo-optimizer.json` (800 lines)
8. `WF8-publisher.json` (700 lines)
9. `WF9-social-distributor.json` (1,200 lines)
10. `WF10-email-campaigner.json` (1,000 lines)
11. `WF11-analytics-tracker.json` (900 lines)
12. `WF12-ab-tester.json` (1,100 lines)
13. `WF13-content-refresher.json` (1,300 lines)
14. `WF14-link-health-monitor.json` (600 lines)
15. `WF15-error-recovery.json` (800 lines)

**Import Instructions:**
```bash
# In n8n UI:
# 1. Go to Workflows → Import from File
# 2. Select JSON file
# 3. Update environment variables in each workflow
# 4. Activate workflow
# 5. Test with manual trigger
```

---

## Appendix B: Gemini Pro API Reference

**Authentication:**
```bash
curl -X POST \
  https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent \
  -H "Content-Type: application/json" \
  -H "x-goog-api-key: YOUR_API_KEY" \
  -d '{"contents": [{"parts": [{"text": "Your prompt here"}]}]}'
```

**Rate Limits:**
- Gemini Pro: 60 requests/minute
- Gemini Pro Vision: 60 requests/minute
- Tokens: Unlimited (pay-per-token)

**Cost:**
- Input: $0.00025 / 1K tokens
- Output: $0.0005 / 1K tokens

**Best Practices:**
- Use `temperature: 0.3` for factual content
- Use `temperature: 0.7` for creative writing
- Set `maxOutputTokens: 8192` for long-form content
- Use `responseMimeType: "application/json"` for structured outputs

---

## Next Steps

1. **Approve this implementation plan**
2. **Provision infrastructure** (n8n, Supabase, Vercel)
3. **Start with WF1** (trend detection) - easiest to test
4. **Build incrementally** - one workflow at a time
5. **Test rigorously** - each workflow before moving to next
6. **Launch soft** - monitor first week closely
7. **Iterate rapidly** - refine prompts based on output quality

---

**Ready to build a self-running content empire? Let's automate! 🚀**
