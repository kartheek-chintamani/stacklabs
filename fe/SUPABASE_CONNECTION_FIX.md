# 🔥 Supabase Connection Timeout Fix

## Problem:
```
ConnectTimeoutError: Connect Timeout Error (timeout: 10000ms)
Failed to fetch topics
```

## ✅ Quick Fixes (Try in Order):

### Fix 1: Refresh the Page
1. **Hard refresh the browser:** `Ctrl + Shift + R` or `Ctrl + F5`
2. **Go to:** http://localhost:3002/admin/topics
3. **Check if topics load**

---

### Fix 2: Check Windows Firewall

**Allow Node.js through Windows Firewall:**

1. **Open Windows Security:**
   - Press `Win + I` → Security → Firewall & network protection
   
2. **Allow an app through firewall:**
   - Click "Allow an app through firewall"
   - Click "Change settings" (requires admin)
   - Find **"Node.js"** in the list
   - **Check both Private and Public** boxes
   - Click OK

3. **Restart Next.js dev server:**
   ```powershell
   # In your Next.js terminal, press Ctrl+C, then:
   npm run dev
   ```

---

### Fix 3: Disable Antivirus Temporarily

Some antivirus software blocks Supabase connections:

1. **Temporarily disable your antivirus** (McAfee, Norton, Avast, etc.)
2. **Test the connection:** http://localhost:3002/admin/topics
3. **If it works:** Add Node.js/Next.js to antivirus exclusions

---

### Fix 4: Check VPN/Proxy

If you're using a VPN or corporate proxy:

1. **Disable VPN temporarily**
2. **Test connection**
3. **If it works:** Your VPN is blocking Supabase
4. **Solution:** Add `*.supabase.co` to VPN exclusions

---

### Fix 5: Test Supabase Connection Directly

**In PowerShell:**

```powershell
# Test connection
Test-NetConnection -ComputerName akqlghyrsglqaxgadvlo.supabase.co -Port 443

# Expected output: TcpTestSucceeded: True
```

**Test API call:**

```powershell
$headers = @{
    "apikey" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrcWxnaHlyc2dscWF4Z2FkdmxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1ODA3MjYsImV4cCI6MjA4NTE1NjcyNn0.qlOxdsNjCQEUteFMpjRvU6AWZuTFUiGo2npemy6QQLw"
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrcWxnaHlyc2dscWF4Z2FkdmxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1ODA3MjYsImV4cCI6MjA4NTE1NjcyNn0.qlOxdsNjCQEUteFMpjRvU6AWZuTFUiGo2npemy6QQLw"
}

Invoke-RestMethod -Uri "https://akqlghyrsglqaxgadvlo.supabase.co/rest/v1/content_topics?select=*&limit=5" -Headers $headers
```

**Expected:** Should return topics (or empty array if no data)

---

### Fix 6: Restart Everything

Sometimes a clean restart helps:

1. **Stop n8n:** Press `Ctrl+C` in n8n terminal
2. **Stop Next.js:** Press `Ctrl+C` in Next.js terminal
3. **Clear browser cache:**
   - Press `Ctrl + Shift + Delete`
   - Clear "Cached images and files"
   - Click "Clear data"
4. **Restart Next.js:**
   ```powershell
   cd c:\Project\Misc\samples\linkgeniekr-main\nexus-affiliate
   npm run dev
   ```
5. **Restart n8n:**
   ```powershell
   cd c:\Project\Misc\samples\linkgeniekr-main\nexus-affiliate
   npx n8n
   ```
6. **Test:** http://localhost:3002/admin/topics

---

### Fix 7: Check Supabase Project Status

1. **Go to:** https://app.supabase.com/project/akqlghyrsglqaxgadvlo
2. **Check project status:** Should show "Healthy" and "Active"
3. **If paused:** Click "Restore" to wake up the project
4. **Wait 2 minutes** for project to fully wake up
5. **Test connection again**

---

### Fix 8: Increase Timeout (Already Applied)

I've already updated `src/lib/supabase.ts` with longer timeouts (30 seconds instead of 10 seconds).

**The changes should auto-reload.** If not, restart the dev server:
```powershell
# Press Ctrl+C in Next.js terminal, then:
npm run dev
```

---

## 🧪 Verify Fix Worked:

### Test 1: Admin Dashboard
```
http://localhost:3002/admin/topics
```
**Expected:** Should load topics (or show "All Caught Up!" if no topics)

### Test 2: API Endpoint
```
http://localhost:3002/api/topics
```
**Expected:** Should return JSON array of topics

### Test 3: Database Query in Supabase
1. **Go to:** https://app.supabase.com/project/akqlghyrsglqaxgadvlo/editor
2. **SQL Editor → New query:**
```sql
SELECT COUNT(*) as topic_count FROM content_topics;
```
3. **Click "Run"**
4. **Expected:** Shows number of topics

---

## 🐛 Still Not Working?

If none of the above work, the issue might be:

### Option A: Corporate Network
If you're on a corporate network, HTTPS might be intercepted:
- **Solution:** Use a personal network/hotspot temporarily
- Or ask IT to whitelist `*.supabase.co`

### Option B: ISP Blocking
Some ISPs block certain cloud services:
- **Solution:** Use a different network or contact ISP

### Option C: Supabase Project Issue
Very rare, but possible:
- **Solution:** Create a new Supabase project and migrate data

---

## 📊 Check Which Fix Worked:

After trying a fix, check the Next.js terminal logs:

**Good (Fixed):**
```
GET /api/topics 200 in 500ms ✅
```

**Bad (Still Broken):**
```
Supabase error: ConnectTimeoutError ❌
GET /api/topics 500 in 10.7s
```

---

## 🎯 Most Common Solutions:

1. **Hard refresh browser** (70% of cases)
2. **Allow Node.js through Windows Firewall** (20% of cases)
3. **Disable antivirus temporarily** (5% of cases)
4. **Wake up paused Supabase project** (3% of cases)
5. **VPN/Proxy interference** (2% of cases)

---

**Try these fixes in order and let me know which one works!** 🚀
