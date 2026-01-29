# n8n Workflows for DevTools Nexus

## 🎯 Quick Start

### 1. Import Workflows

1. Open n8n: http://localhost:5678
2. Click "Workflows" in the left sidebar
3. Click "+ Add workflow" or "Import from file"
4. Import each JSON file from this folder

### 2. Configure Credentials

For each workflow, you'll need to set up:

- **Supabase** - Your database connection
- **Gemini API** - For AI content generation
- **HTTP Request** - For Next.js API calls

### 3. Activate Workflows

- Toggle the "Active" switch in the top right of each workflow
- Scheduled workflows will run automatically
- Webhook workflows will wait for triggers

---

## 📋 Available Workflows

### WF1: Topic Discovery (Daily)
**File:** `1-topic-discovery-daily.json`  
**Schedule:** Every day at 6 AM  
**Purpose:** Automatically discover trending topics

**What it does:**
1. Searches Google Trends for rising topics
2. Checks Reddit for hot posts
3. Analyzes each topic with Gemini AI
4. Saves promising topics to Supabase
5. Sends email notification

**Manual Test:**
- Open workflow
- Click "Execute Workflow" button
- Check Supabase for new topics

---

### WF2: Content Generation (On Approval)
**File:** `2-content-generation-webhook.json`  
**Trigger:** Webhook from Next.js when topic is approved  
**Purpose:** Generate full article automatically

**What it does:**
1. Receives approved topic via webhook
2. Researches competitor articles
3. Generates article outline
4. Writes full 2000+ word article
5. Creates AI images
6. Saves to Supabase for review

**Manual Test:**
1. In n8n, click "Execute Workflow"
2. Use test data from workflow
3. Check Supabase for new article

**Webhook URL to add in Next.js:**
```
http://localhost:5678/webhook/topic-approved
```

---

### WF3: Post-Publish Actions
**File:** `3-post-publish-webhook.json`  
**Trigger:** Webhook when article is published  
**Purpose:** Handle post-publish automation

**What it does:**
1. Receives published article
2. Schedules social media posts
3. Updates internal links
4. Sends success notification

**Webhook URL:**
```
http://localhost:5678/webhook/article-published
```

---

### WF4: Analytics Sync (Daily)
**File:** `4-analytics-sync-daily.json`  
**Schedule:** Every day at 11 PM  
**Purpose:** Update article performance metrics

**What it does:**
1. Fetches all published articles
2. Gets view/click data
3. Updates Supabase metrics
4. Sends weekly performance report

---

## 🔧 Workflow Customization

### Adding Your API Keys

1. **Supabase Credential:**
   - In n8n, go to "Credentials" → "New"
   - Select "Supabase"
   - Add your Supabase URL and service role key

2. **Gemini API:**
   - Add as HTTP Request credential
   - Or use n8n's AI node (if available)

3. **Email Notifications:**
   - Configure SMTP settings
   - Or use MailerLite/SendGrid

### Modifying Schedules

To change when workflows run:
1. Open workflow in n8n
2. Click the "Schedule Trigger" node
3. Change the cron expression
4. Save workflow

**Examples:**
- Every hour: `0 * * * *`
- Every 6 hours: `0 */6 * * *`
- Every Monday at 9 AM: `0 9 * * 1`

---

## 🧪 Testing Guide

### Test Workflow 1 (Topic Discovery)

```sql
-- After running workflow, check for new topics
SELECT * FROM content_topics 
WHERE status = 'pending_approval'
ORDER BY created_at DESC;
```

### Test Workflow 2 (Content Generation)

1. Create a test topic in Supabase
2. Approve it via admin dashboard
3. Watch n8n execution logs
4. Check for generated article:

```sql
SELECT * FROM articles 
WHERE status = 'pending_review'
ORDER BY created_at DESC;
```

### Test Workflow 3 (Post-Publish)

1. Publish an article from admin
2. Check n8n logs
3. Verify social posts scheduled:

```sql
SELECT * FROM scheduled_posts 
WHERE status = 'scheduled'
ORDER BY scheduled_for;
```

---

## 📊 Monitoring

### Check Workflow Executions

In n8n:
- Go to "Executions"
- Filter by workflow
- Check success/failure status
- View execution details

### Database Logs

```sql
-- See all workflow activity
SELECT 
  workflow_name,
  status,
  duration_seconds,
  cost_usd,
  started_at
FROM workflow_logs
ORDER BY started_at DESC
LIMIT 50;
```

### Cost Tracking

```sql
-- Daily costs
SELECT 
  DATE(started_at) as date,
  COUNT(*) as executions,
  SUM(tokens_used) as total_tokens,
  SUM(cost_usd) as total_cost
FROM workflow_logs
WHERE started_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(started_at)
ORDER BY date DESC;
```

---

## 🚨 Troubleshooting

### Workflow Not Executing

**Check:**
1. Workflow is active (toggle switch)
2. Schedule is correct
3. n8n is running
4. No error in last execution

**Fix:**
- Click "Execute Workflow" manually
- Check n8n server logs
- Verify all credentials are set

### API Errors

**Common Issues:**
- Invalid API keys → Check .env.local
- Rate limits exceeded → Add delays
- Network errors → Check connectivity

**Fix:**
- Test API calls independently
- Add error handling nodes
- Implement retry logic

### Database Errors

**Issues:**
- Connection failed → Check Supabase credentials
- Permission denied → Verify RLS policies
- Insert failed → Check table schema

**Fix:**
```sql
-- Test connection
SELECT NOW();

-- Check RLS policies
SELECT * FROM pg_policies 
WHERE tablename IN ('content_topics', 'articles');
```

---

## 🔄 Workflow Dependencies

```
WF1 (Topic Discovery) 
  └─> Creates topics in DB
      └─> Admin approves topic
          └─> WF2 (Content Generation)
              └─> Creates article in DB
                  └─> Admin publishes article
                      └─> WF3 (Post-Publish)

WF4 (Analytics) runs independently every night
```

---

## 💡 Best Practices

1. **Start with Manual Testing**
   - Run workflows manually first
   - Verify each step works
   - Then enable automation

2. **Monitor Costs**
   - Check daily API usage
   - Set budget alerts
   - Optimize prompts to reduce tokens

3. **Quality Over Quantity**
   - Set high quality thresholds
   - Review AI output regularly
   - Adjust prompts as needed

4. **Backup Workflows**
   - Export workflows regularly
   - Version control JSON files
   - Document customizations

5. **Error Handling**
   - Add try-catch nodes
   - Implement fallbacks
   - Log all errors to database

---

## 📈 Scaling Up

Once working well:

1. **Increase Frequency**
   - Run topic discovery 2-3x daily
   - Generate multiple articles per day

2. **Add Data Sources**
   - HackerNews API
   - Twitter trends
   - GitHub trending
   - Dev.to RSS

3. **Enhance Content**
   - Add video scripts
   - Generate infographics
   - Create comparison tables
   - Include code examples

4. **Automate More**
   - Auto-publish high-scoring articles
   - Auto-update old articles
   - Auto-generate newsletters

---

## ✅ Success Metrics

Track these KPIs:

- **Topics discovered per day:** Target 10-20
- **Articles generated per week:** Target 5-10
- **Quality score average:** Target >75
- **Social posts scheduled:** Target 3 per article
- **API cost per article:** Target <$2

---

## 🎉 Ready to Automate!

Import the workflows, configure your credentials, and let the automation begin!
