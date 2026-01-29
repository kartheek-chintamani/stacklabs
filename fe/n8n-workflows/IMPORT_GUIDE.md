# 🚀 Quick Import Guide for n8n Workflows

## Step 1: Import Workflow 2 (Content Generation) - Most Critical

This is the workflow that generates articles when you approve topics.

### Import Steps:

1. **Open n8n:** http://localhost:5678

2. **Import Workflow:**
   - Click "Workflows" in left sidebar
   - Click "+ Add workflow" button (top right)
   - Click "Import from file"
   - Select: `2-content-generation-webhook.json`
   - Click "Import"

3. **Configure Environment Variables:**
   
   The workflow uses these from your `.env.local`:
   - `GEMINI_API_KEY` - Your Gemini API key
   - `NEXT_PUBLIC_APP_URL` - Your Next.js app URL (default: http://localhost:3002)

   **In n8n**, you can set these as environment variables:
   - Go to Settings → Environment Variables (if available)
   - OR add them to your n8n startup command:
     ```bash
     GEMINI_API_KEY=your-key NEXT_PUBLIC_APP_URL=http://localhost:3002 n8n start
     ```

4. **Activate the Workflow:**
   - Toggle the "Active" switch in top right corner
   - Should turn green ✅

5. **Copy Webhook URL:**
   
   The workflow should show a webhook URL like:
   ```
   http://localhost:5678/webhook/topic-approved
   ```

6. **Update Next.js Environment Variable:**
   
   Make sure your `.env.local` has:
   ```bash
   N8N_WEBHOOK_URL=http://localhost:5678/webhook/topic-approved
   ```

7. **Restart Next.js:**
   ```bash
   npm run dev
   ```

---

## Step 2: Test the Workflow

### Manual Test in n8n:

1. **Click "Execute Workflow"** in n8n
2. **Add test data** in the webhook node:
   ```json
   {
     "id": "test-123",
     "topic_title": "Top 5 AI Code Review Tools for 2026",
     "keywords": ["ai", "code review", "developer tools"],
     "target_audience": "software developers",
     "content_type": "comparison"
   }
   ```
3. **Click "Execute"** - Should generate an article!

### Live Test from Next.js:

1. **Go to:** http://localhost:3002/admin/topics
2. **Approve a topic**
3. **Check n8n Executions tab** - should show new execution
4. **Check Supabase** - should have new article in `articles` table

---

## Step 3: Import Workflow 1 (Topic Discovery) - Optional

This workflow runs daily to find new topics automatically.

### Import Steps:

1. **Import file:** `1-topic-discovery-daily.json`
2. **Same environment variables** as Workflow 2
3. **Activate workflow**
4. **Manual test:**
   - Click "Execute Workflow"
   - Wait 30-60 seconds
   - Check `/admin/topics` for new topics

**Schedule:** Runs every day at 6 AM

---

## 🔧 Troubleshooting

### Webhook Not Triggering

**Check:**
```bash
# Is n8n running?
curl http://localhost:5678/webhook/topic-approved

# Should return 404 or 405, not connection refused
```

**Fix:**
1. Make sure n8n is running: `n8n start`
2. Make sure workflow is **Active** (green toggle)
3. Check webhook URL matches `.env.local`

### Gemini API Errors

**Error:** "API key not valid"

**Fix:**
1. Verify `GEMINI_API_KEY` in `.env.local`
2. Test API key:
   ```bash
   curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_KEY" \
     -H 'Content-Type: application/json' \
     -d '{"contents":[{"parts":[{"text":"test"}]}]}'
   ```

### Article Not Saving

**Error:** "Failed to save article"

**Check:**
1. Is Next.js dev server running on port 3002?
2. Is Supabase connected properly?
3. Check Next.js logs for errors

**Test API directly:**
```bash
curl -X POST http://localhost:3002/api/articles \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","content":"Test content"}'
```

---

## 📊 Monitoring

### Check Workflow Executions:

1. **In n8n:** Click "Executions" in left sidebar
2. **See all runs:** Filter by workflow name
3. **Check details:** Click any execution to see step-by-step logs

### Check Database:

```sql
-- Check for new articles
SELECT id, title, status, created_at 
FROM articles 
ORDER BY created_at DESC 
LIMIT 10;

-- Check for approved topics
SELECT id, topic_title, status, approved_at
FROM content_topics 
WHERE status = 'approved'
ORDER BY approved_at DESC;
```

---

## ✅ Success Checklist

- [ ] n8n is running on http://localhost:5678
- [ ] Workflow 2 imported and **Active**
- [ ] Environment variables configured (GEMINI_API_KEY)
- [ ] Webhook URL in `.env.local` matches n8n
- [ ] Next.js dev server restarted
- [ ] Manual test in n8n works
- [ ] Approve topic from admin dashboard works
- [ ] New article appears in Supabase

---

## 🎉 You're Ready!

Once Workflow 2 is working:
- Approve topics → Articles generated automatically
- Articles appear in Supabase with status "pending_review"
- Review and publish from admin dashboard

Optional: Add Workflow 1 for automatic topic discovery daily.

---

## 💡 Tips

1. **Start Simple:** Only import Workflow 2 first, get it working
2. **Test Manually:** Use "Execute Workflow" before testing live
3. **Check Logs:** n8n executions show detailed error messages
4. **Monitor Costs:** Each article generation costs ~$0.10-0.50 in API credits

---

Need help? Check the main README.md or troubleshooting guide!
