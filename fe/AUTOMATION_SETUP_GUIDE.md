# 🤖 Automation Setup Guide - DevTools Nexus

## Overview

This guide will help you set up the complete automation workflow using Supabase + n8n + Next.js.

---

## ✅ Prerequisites Checklist

- [x] Supabase project created
- [x] Supabase API keys added to `.env.local`
- [x] Gemini API key added
- [x] n8n running locally on port 5678
- [x] Next.js app running on port 3002

---

## 📊 Step 1: Set Up Supabase Database

### 1.1 Open Supabase SQL Editor

1. Go to: https://supabase.com/dashboard/project/akqlghyrsglqaxgadvlo/sql
2. Click "New Query"

### 1.2 Run the Schema

Copy and paste the entire contents of `SUPABASE_SCHEMA.sql` into the SQL editor and click "Run".

This will create:
- ✅ `content_topics` - AI-discovered topics for approval
- ✅ `articles` - Generated articles with review workflow
- ✅ `products` - Affiliate products database
- ✅ `article_products` - Junction table linking articles to products
- ✅ `affiliate_clicks` - Click tracking for analytics
- ✅ `assets` - Images and media
- ✅ `workflow_logs` - n8n execution logs
- ✅ `scheduled_posts` - Social media scheduling
- ✅ `user_settings` - Admin preferences

### 1.3 Verify Tables Created

Run this query to check:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see all 9 tables listed.

---

## 🔌 Step 2: Test Database Connection

The app will automatically connect to Supabase once the tables are set up.

### Test the Connection:

1. Visit: http://localhost:3002/admin/topics
2. The page should now show "No topics pending approval" (real database, empty state)
3. Previously it showed 3 mock topics - now it's connected to real data

---

## 🎯 Step 3: Understanding the Automation Flow

### The Complete Workflow:

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTOMATION WITH APPROVAL                       │
└─────────────────────────────────────────────────────────────────┘

Day 1 - 6 AM: Topic Discovery Workflow (WF1)
├─ n8n searches Google Trends, Reddit, Product Hunt
├─ AI (Gemini) analyzes each topic
├─ Topics saved to Supabase → status: "pending_approval"
└─ Email notification sent to admin

Admin Dashboard: Approve Topics
├─ Review AI analysis & quality scores
├─ Click "Approve" on best topics
└─ Status changed to "approved"

Within 1 Hour: Content Generation Workflow (WF2)
├─ n8n detects approved topic
├─ Research competitors (web scraping)
├─ AI generates comprehensive article (2000+ words)
├─ AI generates images (hero, thumbnails)
├─ Article saved to Supabase → status: "pending_review"
└─ Email notification sent to admin

Admin Dashboard: Review & Publish
├─ Read generated article
├─ Make any edits needed
├─ Click "Publish"
└─ Status changed to "published"

Immediate: Post-Publish Workflow (WF3)
├─ Article goes live on website
├─ Social media posts scheduled (Twitter, LinkedIn)
├─ Internal links added to related articles
└─ Analytics tracking enabled

Daily Monitoring: Analytics Workflow (WF4)
├─ Track page views, clicks, conversions
├─ Update article performance metrics
└─ Weekly performance report emailed
```

---

## 🔧 Step 4: Set Up n8n Workflows

### 4.1 Access n8n

Open: http://localhost:5678

### 4.2 Import Workflows

We'll create 4 main workflows:

#### Workflow 1: Topic Discovery (Daily at 6 AM)
**Purpose:** Find trending topics automatically

**Nodes:**
1. **Schedule Trigger** - Every day at 6 AM
2. **Google Trends API** - Fetch trending topics
3. **Reddit API** - Check hot posts in r/programming, r/devtools
4. **Product Hunt API** - Get recently launched tools
5. **Gemini AI** - Analyze each topic for quality
6. **Supabase Insert** - Save topics with status "pending_approval"
7. **Email Notification** - Alert admin about new topics

#### Workflow 2: Content Generation (On Topic Approval)
**Purpose:** Generate full article when admin approves a topic

**Trigger:** Supabase webhook when `content_topics.status` = 'approved'

**Nodes:**
1. **Webhook Trigger** - Receives topic approval
2. **Firecrawl** - Scrape competitor articles
3. **Gemini AI** - Generate article outline
4. **Gemini AI** - Write full article (2000+ words)
5. **Replicate** - Generate hero image
6. **Replicate** - Generate social share image
7. **Supabase Insert** - Save article with status "pending_review"
8. **Email Notification** - Alert admin article is ready

#### Workflow 3: Post-Publish Actions (On Article Publish)
**Purpose:** Handle everything after "Publish" is clicked

**Trigger:** Supabase webhook when `articles.status` = 'published'

**Nodes:**
1. **Webhook Trigger** - Receives publish event
2. **AI Analysis** - Find related articles for internal linking
3. **Supabase Update** - Add internal links
4. **Ayrshare API** - Schedule Twitter post (immediate)
5. **Ayrshare API** - Schedule LinkedIn post (+2 hours)
6. **MailerLite** - Add to email newsletter queue
7. **Email Notification** - Confirm publish success

#### Workflow 4: Analytics Sync (Daily at 11 PM)
**Purpose:** Update article performance metrics

**Nodes:**
1. **Schedule Trigger** - Every day at 11 PM
2. **Supabase Query** - Get all published articles
3. **For Each Article** - Loop through articles
4. **Get Analytics** - Fetch views, clicks from tracking
5. **Supabase Update** - Update metrics
6. **Weekly Report** - On Sundays, send performance email

---

## 🚀 Step 5: Test the Full Automation

### Manual Test Flow:

#### Test 1: Create a Topic Manually
```sql
-- Run in Supabase SQL Editor
INSERT INTO content_topics (
  topic_title,
  topic_description,
  niche_category,
  ai_analysis,
  quality_score,
  estimated_monthly_searches,
  competition_level,
  discovered_via,
  source_url,
  status
) VALUES (
  'Best AI Code Review Tools in 2026',
  'Comprehensive comparison of automated code review tools that use AI',
  'AI productivity tools for developers',
  '{"reasoning": "High search volume, low competition", "potential_keywords": ["ai code review", "automated code review", "best code review tools"]}'::jsonb,
  85,
  4500,
  'low',
  'manual_test',
  'https://test.com',
  'pending_approval'
);
```

#### Test 2: Visit Admin Dashboard
1. Go to http://localhost:3002/admin/topics
2. You should see the test topic
3. Click "Approve & Generate Article"
4. This should trigger Workflow 2 (if n8n is set up)

#### Test 3: Check Article Generation
1. After a few minutes, check Supabase:
```sql
SELECT id, title, status, created_at 
FROM articles 
ORDER BY created_at DESC 
LIMIT 5;
```

2. You should see a new article with status "pending_review"

#### Test 4: Publish Article
1. Once article appears in dashboard, review it
2. Click "Publish"
3. This triggers Workflow 3 (social media, internal linking)
4. Check the live site - article should be visible

---

## 🔍 Step 6: Monitor & Optimize

### Check Workflow Logs

In n8n:
- Click "Executions" to see all workflow runs
- Check for errors or failures
- Monitor token usage and costs

### Check Database Logs

```sql
-- See all workflow executions
SELECT 
  workflow_name,
  status,
  started_at,
  duration_seconds,
  tokens_used,
  cost_usd
FROM workflow_logs
ORDER BY started_at DESC
LIMIT 20;
```

### Check Performance

```sql
-- Dashboard stats
SELECT * FROM get_dashboard_stats();

-- Affiliate performance
SELECT * FROM affiliate_performance;

-- Daily stats
SELECT * FROM daily_stats LIMIT 30;
```

---

## 💰 Cost Management

### Daily Budget Breakdown:

**AI API Calls:**
- Topic Analysis (10 topics): ~$0.10
- Article Generation (3 articles): ~$1.50
- Image Generation (6 images): ~$0.30
- **Daily Total: ~$2.00**

**Monthly Projected: $60**

### Cost Optimization Tips:

1. **Set Quality Thresholds**
   - Only approve topics with score > 75
   - Reduces unnecessary article generation

2. **Batch Operations**
   - Generate multiple articles in one workflow run
   - Saves on API initialization overhead

3. **Use Caching**
   - Cache competitor research for similar topics
   - Reuse image prompts when possible

4. **Monitor Token Usage**
   ```sql
   -- Check daily costs
   SELECT 
     DATE(started_at) as date,
     SUM(cost_usd) as daily_cost,
     SUM(tokens_used) as daily_tokens
   FROM workflow_logs
   GROUP BY DATE(started_at)
   ORDER BY date DESC;
   ```

---

## 🐛 Troubleshooting

### Problem: Topics not appearing in dashboard

**Check:**
1. Database connection: `SELECT * FROM content_topics;`
2. API route working: http://localhost:3002/api/topics
3. Console errors in browser DevTools

**Solution:**
- Restart Next.js dev server
- Check Supabase logs for errors
- Verify RLS policies allow reads

### Problem: n8n workflow not triggering

**Check:**
1. n8n is running: http://localhost:5678
2. Webhook URL is correct in Supabase
3. Workflow is active (toggle switch in n8n)

**Solution:**
- Test webhook manually with curl
- Check n8n execution logs
- Verify API keys are correct

### Problem: AI generation fails

**Check:**
1. Gemini API key is valid
2. Rate limits not exceeded
3. Prompt is well-formed

**Solution:**
- Add fallback to Claude API
- Implement retry logic
- Monitor error logs

---

## 📚 Next Steps

Once automation is working:

1. **Add More Data Sources**
   - Twitter API for trends
   - HackerNews API
   - Dev.to RSS feeds

2. **Enhance AI Generation**
   - Add competitor analysis
   - Include code examples
   - Generate comparison tables

3. **Expand Publishing**
   - Auto-post to Medium
   - Create YouTube scripts
   - Generate podcast summaries

4. **Advanced Analytics**
   - A/B test headlines
   - Track conversion funnels
   - Optimize for SEO rankings

---

## ✅ Success Checklist

- [ ] Supabase tables created
- [ ] Database connection working
- [ ] Admin dashboard shows real data
- [ ] Can manually create and approve topics
- [ ] n8n workflows imported
- [ ] Topic discovery workflow runs
- [ ] Article generation workflow runs
- [ ] Can publish articles
- [ ] Published articles appear on site
- [ ] Social media posts scheduled
- [ ] Analytics tracking working
- [ ] Email notifications sending

**When all checked → You're fully automated! 🎉**

---

## 📞 Need Help?

Check these files:
- `SUPABASE_SCHEMA.sql` - Database structure
- `ENHANCED_PRD.md` - Full system documentation
- `APP_STATUS.md` - Current app features
- `TROUBLESHOOTING.md` - Common issues

**Your automation is now ready to run 24/7!**
