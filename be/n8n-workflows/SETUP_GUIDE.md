# n8n Workflow Setup Guide

## Step 1: Import the Workflow
1. Open n8n at `http://localhost:5678`
2. Click "Workflows" → "Import from File"
3. Select: `n8n-workflows/deal-discovery.json`

## Step 2: Configure Credentials

### A. Supabase Authentication
1. In n8n, go to **Credentials** → **New**
2. Select **"HTTP Header Auth"**
3. Name it: `Supabase Auth`
4. Add Header:
   - **Name:** `Authorization`
   - **Value:** `Bearer YOUR_SUPABASE_ANON_KEY`

**Get your key:**
- Open `.env` file
- Copy the value of `VITE_SUPABASE_PUBLISHABLE_KEY`

---

### B. Telegram Bot
1. In n8n, go to **Credentials** → **New**
2. Select **"Telegram API"**
3. Name it: `Telegram Bot`
4. Enter:
   - **Access Token:** Your bot token (from Settings page in LinkGenie)

**Get your bot token:**
- In LinkGenie → Settings → Integrations → Telegram
- Copy the bot token you added earlier

---

## Step 3: Set Environment Variables

n8n needs access to your Supabase URLs. Add these to n8n:

1. Stop n8n: `docker stop n8n`
2. Restart with environment variables:

```bash
docker run -d \
  --name n8n \
  -p 5678:5678 \
  -e VITE_SUPABASE_URL="YOUR_SUPABASE_URL" \
  -e VITE_SUPABASE_PUBLISHABLE_KEY="YOUR_SUPABASE_KEY" \
  -e TELEGRAM_CHANNEL_ID="YOUR_CHANNEL_ID" \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

**Get these values from your `.env` file.**

---

## Step 4: Test the Workflow

1. Open the imported workflow in n8n
2. Click **"Execute Workflow"** (play button at bottom)
3. Watch each node light up as it processes
4. Check your Telegram channel for the post!

---

## Step 5: Enable Automation

Once you've tested successfully:
1. Click the **toggle** at the top right (Active/Inactive)
2. Turn it **ON**
3. The workflow will now run every 30 minutes automatically

---

## Troubleshooting

### "HTTP Request failed"
- Check that your Supabase credentials are correct
- Verify Edge Functions are deployed: `supabase functions list`

### "No items to process"
- The RSS feed might be empty
- Try changing the RSS URL to a more active category

### "Telegram API error"
- Verify bot token is correct
- Make sure the bot is admin in your channel
- Check TELEGRAM_CHANNEL_ID format (should start with `-100`)

---

## Next Steps

1. **Add more RSS sources** (Flipkart, Myntra)
2. **Adjust the Quality Gate** (change discount threshold)
3. **Customize the Telegram message** (edit the "Format Telegram Post" node)

The workflow is ready to run!
