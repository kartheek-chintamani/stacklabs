# 🚀 How to Start n8n

## Option 1: Using npx (Recommended - No Install Needed)

Open a **NEW terminal** in your project folder and run:

```bash
cd c:\Project\Misc\samples\linkgeniekr-main\nexus-affiliate

npx n8n
```

This will:
- Download n8n if needed (first time only)
- Start n8n on http://localhost:5678
- Keep running until you press Ctrl+C

**When you see:**
```
n8n ready on 0.0.0.0, port 5678
```

**n8n is running!** ✅ Go to: http://localhost:5678

---

## Option 2: Install Globally with Administrator Rights

If you want to install n8n permanently:

1. **Close all terminals**
2. **Right-click PowerShell → "Run as Administrator"**
3. Run: `npm install -g n8n`
4. Then start: `n8n start`

---

## Environment Variables

Before starting n8n, make sure your `.env.local` has:

```bash
GEMINI_API_KEY=your-actual-key
N8N_WEBHOOK_URL=http://localhost:5678/webhook
```

Then pass the Gemini key to n8n:

```bash
# Windows PowerShell
$env:GEMINI_API_KEY="your-gemini-key-here"
npx n8n
```

Or in one command:

```bash
npx --yes n8n
```

(n8n will read from `.env.local` if configured)

---

## Quick Start Checklist

- [ ] Open NEW terminal/PowerShell
- [ ] Navigate to project: `cd c:\Project\Misc\samples\linkgeniekr-main\nexus-affiliate`
- [ ] Run: `npx n8n`
- [ ] Wait for "n8n ready on port 5678"
- [ ] Open browser: http://localhost:5678
- [ ] Import workflow from: `n8n-workflows/2-content-generation-webhook.json`
- [ ] Activate workflow (toggle switch)
- [ ] Test by approving a topic in Next.js admin

---

## Troubleshooting

### Port Already in Use

If you see "port 5678 already in use":

```bash
# Windows - Find and kill process on port 5678
netstat -ano | findstr :5678
taskkill /PID <PID> /F
```

### Permission Errors

Use npx instead of global install, or run PowerShell as Administrator.

### Can't Access http://localhost:5678

Make sure:
1. n8n terminal is still running (don't close it)
2. No firewall blocking port 5678
3. Try http://127.0.0.1:5678 instead

---

## Next Steps

Once n8n is running:

1. **Create account** (first time only - local account)
2. **Import workflow**: `n8n-workflows/2-content-generation-webhook.json`
3. **Activate workflow** (green toggle in top right)
4. **Test**: Approve a topic in Next.js admin dashboard

See `n8n-workflows/IMPORT_GUIDE.md` for detailed workflow setup.
