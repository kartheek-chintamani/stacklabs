# Fix: Gemini API DNS Error in n8n

## Problem
The n8n workflow fails with: **"The DNS server returned an error"** when trying to call the Gemini API.

## Root Cause
The workflow JSON file has a **hardcoded, invalid Gemini API key** in the URL (line 31):
```
https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyBGwcKNfNbtoXApx-TBf5OsmZ8QV1016WE
```

This key is either expired or invalid, causing the DNS error.

## Solution: Add Your Gemini API Key

### Step 1: Get a Free Gemini API Key

1. Go to: **https://aistudio.google.com/app/apikey**
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the generated key (starts with `AIzaSy...`)

### Step 2: Add Key to `.env.local`

Edit [`/Users/kartheekchintamani/Code/Projects/stacklabs/fe/.env.local`](file:///Users/kartheekchintamani/Code/Projects/stacklabs/fe/.env.local):

```bash
# Find this line (line 21):
GEMINI_API_KEY=

# Replace with your actual key:
GEMINI_API_KEY=AIzaSyYOUR_ACTUAL_KEY_HERE
```

### Step 3: Update the n8n Workflow

You have two options:

#### Option A: Edit the Workflow in n8n (Recommended)

1. Open n8n: http://localhost:5678
2. Open your workflow
3. Click on the **"Call Gemini (2min timeout)"** node
4. Find the URL field that currently has the hardcoded key
5. Replace it with:
   ```
   =https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={{ $env.GEMINI_API_KEY }}
   ```
6. Click **"Save"**
7. Make sure the workflow is **"Active"** (toggle in top right)

#### Option B: Import a Simpler Test Workflow

For testing, use a minimal workflow to verify the Gemini API works:

1. In n8n, create a **new workflow**
2. Add a **Manual Trigger** node
3. Add an **HTTP Request** node with:
   - Method: `POST`
   - URL: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_KEY_HERE`
   - Body Type: `JSON`
   - JSON:
     ```json
     {
       "contents": [{
         "parts": [{"text": "Say hello"}]
       }]
     }
     ```
4. Click **"Test workflow"**

If it works, you'll see a response from Gemini!

### Step 4: Test

After updating:

1. Go to: http://localhost:3000/admin/topics
2. Click **"Approve & Generate Article"** on a topic
3. Check n8n executions: http://localhost:5678/executions
4. You should see a successful execution!

## Quick Test Command

Test the Gemini API directly (replace `YOUR_KEY`):

```bash
curl -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_KEY_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [{"text": "Say hello"}]
    }]
  }'
```

If this works, the issue is just the workflow configuration.

## Summary

✅ Get Gemini API key from https://aistudio.google.com/app/apikey  
✅ Add `GEMINI_API_KEY=your_key` to `.env.local`  
✅ Update the n8n workflow to use `$env.GEMINI_API_KEY`  
✅ Test the workflow  

The hardcoded key in the workflow JSON is the problem - replacing it with your own key will fix the DNS error!
