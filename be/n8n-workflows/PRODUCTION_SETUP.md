# Production Workflow Setup Guide

## What's New in This Version

### ✅ Duplicate Detection
- **Checks before posting** if URL was posted in last 24 hours
- **Prevents spam** by rejecting duplicates automatically
- **Logs rejections** to automation_logs table

### ✅ Proper Logging
- **Success logs:** Records successful posts with metrics
- **Failure logs:** Records rejections with reasons
- **Database tracking:** All URLs stored in `discovered_links`

### ✅ Better Error Handling
- **Graceful failures:** Returns clear error messages
- **Detailed responses:** Tells you why something failed

---

## Import & Setup

###Step 1: Import the Workflow

1. **In n8n** (`http://localhost:5678`)
2. **Delete the old `test-with-mock` workflow** (optional, but recommended)
3. **Import** → Select `production-workflow.json`
4. **Save** the workflow

### Step 2: Configure Telegram Credential

1. Click on **"Post to Telegram**" node
2. Select your **Telegram Bot** credential
3. If not created:
   - Click "Create New"
   - Enter your bot token
   - Save

### Step 3: Activate

- Toggle **"Active"** at the top right
- The workflow is now live!

---

## How It Works

### Flow Diagram:
```
Webhook receives URL
  ↓
Check if duplicate (last 24h)
  ↓
  ├─ DUPLICATE FOUND
  │    ↓
  │  Log as rejected
  │    ↓
  │  Return "already posted"
  │
  └─ NOT DUPLICATE
       ↓
     Mock product data
       ↓
     Monetize link
       ↓
     Format Telegram message
       ↓
     Post to Telegram
       ↓
     Save to discovered_links
       ↓
     Log success
       ↓
     Return "success"
```

---

## Testing

### Test 1: First Post (Should Succeed)
```bash
curl -X POST http://localhost:5678/webhook/deal \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.amazon.in/dp/TEST123"}'
```

**Expected:**
```json
{
  "success": true,
  "message": "Posted to Telegram successfully!"
}
```

### Test 2: Duplicate Post (Should Be Rejected)
**Run the same command again immediately:**
```bash
curl -X POST http://localhost:5678/webhook/deal \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.amazon.in/dp/TEST123"}'
```

**Expected:**
```json
{
  "success": false,
  "reason": "duplicate",
  "message": "This product was already posted in the last 24 hours"
}
```

### Test 3: New Product (Should Succeed)
```bash
curl -X POST http://localhost:5678/webhook/deal \
  -H "Content-Type": application/json" \
  -d '{"url": "https://www.amazon.in/dp/TEST456"}'
```

---

## Verify It's Working

### 1. Check Telegram
- Open `@deals_fiesta`
- You should see posts for TEST123 and TEST456 (but NOT a duplicate TEST123)

### 2. Check Automation Dashboard
- Go to `/automation` in LinkGenie
- **Stats should show:**
  - Total Runs: 3
  - Success Rate: 66% (2 success, 1 rejected)
  - Deals Posted: 2

### 3. Check Database
```sql
-- In Supabase SQL Editor
SELECT * FROM discovered_links ORDER BY created_at DESC LIMIT 5;
```

You should see:
- TEST123 (status: posted)
- TEST456 (status: posted)

```sql
SELECT * FROM automation_logs ORDER BY run_at DESC LIMIT 5;
```

You should see:
- 2 rows with status='success'
- 1 row with status='failed' and error_log='{"reason":"duplicate_url"}'

---

## Update Your App

The "Quick Post" button now needs to use the new webhook path:

### Update Products.tsx:

Change line ~150:
```typescript
// OLD:
const response = await fetch('http://localhost:5678/webhook/deal-mock', {

// NEW:
const response = await fetch('http://localhost:5678/webhook/deal', {
```

This makes the UI use the production workflow with duplicate detection!

---

## Monitoring

### View Logs in n8n:
1. Click **"Executions"** in left sidebar
2. See all runs with status (success/failed)
3. Click any execution to see detailed flow
4. Green = success, Red = rejected duplicate

### View Logs in Automation Dashboard:
1. Go to `/automation`
2. See aggregated stats
3. "Recent Runs" shows execution history
4. Click "Refresh Data" to update

---

## What Changed from Mock Version

| Feature | Old (test-with-mock) | New (production) |
|---------|---------------------|------------------|
| Duplicate Check | ❌ No | ✅ Yes (24h window) |
| Logging | ❌ No | ✅ Full logging |
| Database Tracking | ❌ No | ✅ discovered_links table |
| Error Messages | ⚠️ Generic | ✅ Specific reasons |
| Webhook Path | `/deal-mock` | `/deal` |

---

## Troubleshooting

### "Duplicate rejected" but I haven't posted this
**Solution:** Check discovered_links table for old test data. Delete if needed:
```sql
DELETE FROM discovered_links WHERE url LIKE '%TEST%';
```

### Dashboard shows 0 runs
**Solution:** Make sure log-workflow Edge Function is deployed:
```bash
supabase functions deploy log-workflow
```

### Telegram not posting
**Solution:** 
1. Check Telegram credential is set
2. Verify bot is admin in channel
3. Check n8n logs: `docker logs n8n --tail 50`

---

## Next Steps

Once this is working:

1. **Replace mock data** with real scraper (Week 2)
2. **Add RSS feeds** for automated discovery (Week 3)
3. **Schedule the workflow** to run every 30 minutes (Week 3)
4. **Add more channels** (Twitter, Website) (Week 4)

---

**You now have a production-ready automation system with duplicate protection!** 🎉
