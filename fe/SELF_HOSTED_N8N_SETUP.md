# Self-Hosted n8n Setup Guide
## Alternative to n8n Cloud - Save $20/month

**Advantages:**
- ✅ Free (only server costs)
- ✅ Unlimited workflow executions
- ✅ Full control over data
- ✅ No company email required

**Requirements:**
- Server with Node.js (or Docker)
- 1GB RAM minimum (2GB recommended)
- Your existing hosting plan should work

---

## Option 1: Docker Setup (Recommended - 10 minutes)

If your hosting supports Docker:

### Step 1: Install via Docker
```bash
# Create directory for n8n data
mkdir ~/.n8n
cd ~/.n8n

# Run n8n container
docker run -d \
  --name n8n \
  -p 5678:5678 \
  -e N8N_BASIC_AUTH_ACTIVE=true \
  -e N8N_BASIC_AUTH_USER=admin \
  -e N8N_BASIC_AUTH_PASSWORD=your_secure_password_here \
  -e N8N_HOST=your-domain.com \
  -e N8N_PORT=5678 \
  -e N8N_PROTOCOL=https \
  -e WEBHOOK_URL=https://your-domain.com \
  -e GENERIC_TIMEZONE=America/New_York \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

### Step 2: Access n8n
Visit: `http://your-server-ip:5678`

Login with:
- Username: `admin`
- Password: `your_secure_password_here`

---

## Option 2: Direct Install with npm (15 minutes)

If you don't have Docker:

### Step 1: Install n8n globally
```bash
# Requires Node.js 18+ (check: node --version)
npm install -g n8n

# Start n8n
n8n start
```

### Step 2: Access n8n
Visit: `http://localhost:5678`

### Step 3: Keep it running (use PM2)
```bash
# Install PM2 process manager
npm install -g pm2

# Start n8n with PM2
pm2 start n8n --name "n8n-automation"

# Save PM2 configuration
pm2 save

# Enable PM2 to start on boot
pm2 startup
```

---

## Option 3: Easiest - Railway.app (Free tier, 5 minutes)

If your hosting doesn't support Docker/Node.js:

### Step 1: Deploy to Railway
1. Visit: https://railway.app
2. Sign up with GitHub
3. Click "New Project" > "Deploy n8n"
4. Railway will auto-deploy n8n for you

### Step 2: Get URL
- Railway provides: `https://your-app.railway.app`
- Free tier: 500 hours/month (sufficient for Phase 0)

---

## Option 4: Local Development Only (Start immediately)

For now, run n8n locally while you set up production:

```bash
# Install and run locally
npx n8n

# Access at: http://localhost:5678
```

You can test all workflows locally, then move to production later.

---

## Configuration for Your Setup

Once n8n is running, configure:

### 1. Set Webhook URL
Settings > General > Webhook URL:
```
http://your-server-ip:5678/webhook
# OR for production:
https://your-domain.com/n8n/webhook
```

### 2. Enable Basic Auth (Security)
```bash
# Set these environment variables:
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=your_secure_password
```

### 3. Setup Credentials
In n8n UI:
- Settings > Credentials
- Add: Supabase API (paste your Supabase keys)
- Add: Google Gemini API
- Add: Anthropic API

---

## Update Your .env File

```bash
# For local development:
N8N_WEBHOOK_URL=http://localhost:5678/webhook
N8N_API_KEY=not_required_for_local

# For production (after deployment):
N8N_WEBHOOK_URL=https://your-domain.com/n8n/webhook
N8N_API_KEY=create_api_key_in_n8n_settings
```

---

## Which Option Should You Choose?

**Quick Start TODAY:** Use Option 4 (local `npx n8n`)
- Test workflows immediately
- No configuration needed
- Move to production later

**Best for Your Hosting:** Option 1 (Docker) or Option 2 (npm + PM2)
- Runs on your server
- $0/month cost
- Full control

**Easiest Cloud Alternative:** Option 3 (Railway.app)
- Free tier available
- No server management
- 5-minute setup

---

## Next Steps

Tell me which option you want to use, and I'll help you:
1. Get it running
2. Import the WF1 workflow
3. Test your first automation

**Recommended for NOW:** Start with Option 4 (local), perfect for Phase 0 development!
