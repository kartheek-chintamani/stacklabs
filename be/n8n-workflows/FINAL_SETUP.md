## How to Set Up the Final Working Workflow

### Step 1: Clean Up Old Workflows
In n8n, delete all previous test workflows to avoid confusion.

### Step 2: Import the New Workflow
1. Import `final-working-workflow.json`
2. Open it

### Step 3: Configure Telegram Credential (ONLY credential needed)
1. Click on **"Post to Telegram"** node
2. Click on **"Credential to connect with"** dropdown
3. **If you have a Telegram credential already:** Select it
4. **If not, create one:**
   - Click "Create New"
   - Enter your Bot Token (from BotFather or Link Genie Settings)
   - Save

### Step 4: Activate
- Click the toggle at top right to make it **Active**

### Step 5: Test
Run this command:
```bash
curl -X POST http://localhost:5678/webhook/deal \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.amazon.in/dp/B0DFXV72S1"}'
```

### Expected Response:
```json
{
  "success": true,
  "message": "Deal posted successfully to @deals_fiesta",
  "product": "Product Name",
  "affiliate_link": "https://..."
}
```

### Troubleshooting:

**If you see "Error in workflow":**
1. In n8n, click **"Executions"** in left sidebar
2. Click the latest failed execution
3. See which node failed (red X mark)
4. Common issues:
   - **Telegram credential not set**: Set it on "Post to Telegram" node
   - **Channel ID wrong**: Make sure your bot is admin in the channel
   - **Bot token invalid**: Double-check the token

**Channel ID Format:**
- Public channel: `@channel_username` (e.g., `@deals_fiesta`)
- Private channel: Numeric ID (e.g., `-1001234567890`)

To get numeric ID for private channel:
1. Add your bot to the channel
2. Post a message
3. Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
4. Look for `"chat":{"id":-100...}`
