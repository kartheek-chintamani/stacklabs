# 🚀 Git Push Guide

## Step 1: Create GitHub Repository

1. **Go to:** https://github.com/new
2. **Repository name:** `nexus-affiliate`
3. **Private or Public:** Your choice
4. **Do NOT initialize** with README (you already have code)
5. **Click "Create repository"**

Copy the repository URL shown (looks like):
```
https://github.com/YOUR_USERNAME/nexus-affiliate.git
```

---

## Step 2: Add Remote Repository

**In PowerShell (in your project folder):**

```powershell
cd c:\Project\Misc\samples\linkgeniekr-main\nexus-affiliate

# Add remote (replace with YOUR GitHub URL!)
git remote add origin https://github.com/YOUR_USERNAME/nexus-affiliate.git

# Verify it was added
git remote -v
```

**Expected output:**
```
origin  https://github.com/YOUR_USERNAME/nexus-affiliate.git (fetch)
origin  https://github.com/YOUR_USERNAME/nexus-affiliate.git (push)
```

---

## Step 3: Create .gitignore (Protect Secrets!)

**IMPORTANT:** Don't push sensitive files!

Run this to create `.gitignore`:

```powershell
@"
# Dependencies
node_modules/
.next/
.env.local
.env

# Production
build/
dist/

# Logs
*.log
npm-debug.log*

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Secrets
*.env
.env.*
!.env.example
"@ | Out-File -FilePath .gitignore -Encoding utf8
```

---

## Step 4: Commit Your Changes

```powershell
# Check what files are ready
git status

# Add all files
git add .

# Commit
git commit -m "Initial commit: AI content automation system with Next.js, Supabase, n8n"
```

---

## Step 5: Push to GitHub

```powershell
# Push to GitHub (first time)
git push -u origin master
```

**You'll be prompted for GitHub credentials:**
- **Username:** Your GitHub username
- **Password:** Use a **Personal Access Token** (not your password!)

---

## 🔑 Create GitHub Personal Access Token

If you don't have one:

1. **Go to:** https://github.com/settings/tokens
2. **Click "Generate new token (classic)"**
3. **Note:** "Git push access"
4. **Expiration:** 90 days (or custom)
5. **Scopes:** Check `repo` (full control)
6. **Click "Generate token"**
7. **COPY THE TOKEN** (you won't see it again!)
8. **Use this token as your password** when pushing

---

## 📋 Complete Command Sequence

**Run these commands in order:**

```powershell
cd c:\Project\Misc\samples\linkgeniekr-main\nexus-affiliate

# 1. Create .gitignore (IMPORTANT!)
@"
node_modules/
.next/
.env.local
.env
*.log
"@ | Out-File -FilePath .gitignore -Encoding utf8

# 2. Add remote (REPLACE WITH YOUR URL!)
git remote add origin https://github.com/YOUR_USERNAME/nexus-affiliate.git

# 3. Stage all files
git add .

# 4. Commit
git commit -m "Initial commit: AI content automation system"

# 5. Push
git push -u origin master
```

---

## 🚨 Common Issues

### Error: "remote origin already exists"

**Fix:**
```powershell
# Remove existing remote
git remote remove origin

# Add it again
git remote add origin https://github.com/YOUR_USERNAME/nexus-affiliate.git
```

### Error: "Authentication failed"

**Fix:** Use Personal Access Token, not password!
1. Create token at: https://github.com/settings/tokens
2. Use token as password when pushing

### Error: "Permission denied"

**Fix:** Check repository URL and credentials

---

## ✅ Success!

Once pushed, you'll see:
```
Enumerating objects: 100, done.
Counting objects: 100% (100/100), done.
Writing objects: 100% (100/100), done.
To https://github.com/YOUR_USERNAME/nexus-affiliate.git
 * [new branch]      master -> master
Branch 'master' set up to track remote branch 'master' from 'origin'.
```

Your code is now on GitHub! 🎉

---

## 🔐 IMPORTANT: Verify Secrets Are Protected

**After pushing, check GitHub:**

1. Go to your repository on GitHub
2. **Make sure `.env.local` is NOT visible!**
3. **Make sure API keys are NOT in any files!**

If you accidentally pushed secrets:
1. **Immediately rotate ALL API keys** (Supabase, Gemini, etc.)
2. Remove from Git history: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository

---

## 📝 Future Pushes

After initial setup, pushing is simple:

```powershell
git add .
git commit -m "Your commit message"
git push
```

---

Need help? Let me know where you're stuck! 🚀
