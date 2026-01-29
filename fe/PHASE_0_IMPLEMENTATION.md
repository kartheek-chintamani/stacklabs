# Phase 0 Implementation Guide: Automation Setup
## Weeks 1-4 | Build The Machine

**Goal:** Deploy n8n automation infrastructure and publish first 10-15 articles  
**Time Investment:** 60-80 hours (one-time setup)  
**Budget:** $170/month + $500 legal (one-time)

---

## Pre-Flight Checklist

Before starting, ensure you have:
- [ ] Credit card for service sign-ups
- [ ] GitHub account (for code hosting)
- [ ] Domain name decided (register in Week 1)
- [ ] Email address for service notifications
- [ ] $600-800 available for initial setup costs
- [ ] 15-20 hours/week available for 4 weeks

---

## Week 1: Infrastructure Setup (15-20 hours)

### Day 1-2: Core Services Setup

#### 1. Domain Registration
```bash
# Recommended registrars:
# - Namecheap ($8-12/year)
# - Cloudflare ($8.57/year)
# - Porkbun ($8-10/year)

# Example domain patterns:
# - niche-focused: aitools.review, devtools.guide, smartgadgets.pro
# - brand-focused: techhubpro.com, reviewgenie.io

# After purchase, note down:
DOMAIN: ______________________
REGISTRAR: ___________________
EXPIRY DATE: _________________
```

#### 2. Vercel Setup (Next.js Hosting)
```bash
# 1. Sign up at vercel.com with GitHub
# 2. Import repository (we'll create this next)
# 3. Configure:
#    - Framework: Next.js
#    - Build command: npm run build
#    - Output directory: .next
#    - Install command: npm install

# Note credentials:
VERCEL_PROJECT_ID: ______________________
VERCEL_ORG_ID: __________________________
```

#### 3. Supabase Setup (Database)
```bash
# 1. Sign up at supabase.com
# 2. Create new project:
#    Name: nexus-affiliate-prod
#    Region: Choose closest to target audience
#    Database Password: Generate strong password

# Save credentials (from Settings > API):
SUPABASE_URL: https://________.supabase.co
SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL: postgresql://postgres:[PASSWORD]@db.________.supabase.co:5432/postgres
```

#### 4. n8n Setup (Automation Engine)
```bash
# Option A: n8n Cloud (Recommended for Phase 0)
# 1. Sign up at n8n.io/cloud
# 2. Choose Starter plan ($20/month)
# 3. Create workspace: nexus-affiliate

# Save credentials:
N8N_URL: https://________.n8n.app
N8N_API_KEY: n8n_api_______________________

# Option B: Self-Hosted (Advanced, save $10/month later)
# See SELF_HOSTED_N8N.md for VPS setup
```

### Day 3-4: API Keys Setup

#### 5. AI APIs
```bash
# Gemini Pro (Primary AI)
# 1. Go to ai.google.dev
# 2. Get API key
# 3. Enable billing (pay-as-you-go)
GEMINI_API_KEY: AIzaSy_______________________

# Claude 3.5 Sonnet (Backup AI)
# 1. Go to console.anthropic.com
# 2. Get API key
# 3. Add $20 credit
CLAUDE_API_KEY: sk-ant-_______________________

# GPT-4o (Fallback)
# 1. Go to platform.openai.com
# 2. Get API key (optional for Phase 0)
OPENAI_API_KEY: sk-_______________________
```

#### 6. Web Scraping
```bash
# Firecrawl (Competitor Research)
# 1. Sign up at firecrawl.dev
# 2. Choose Starter plan ($30/month, 500 pages)
FIRECRAWL_API_KEY: fc-_______________________
```

#### 7. Image Generation
```bash
# Replicate (Flux.1 for images)
# 1. Sign up at replicate.com
# 2. Add $10 credit
REPLICATE_API_TOKEN: r8-_______________________
```

#### 8. Social Media Automation
```bash
# Ayrshare (Social Publishing)
# 1. Sign up at ayrshare.com
# 2. Choose Basic plan ($29/month)
# 3. Connect social accounts:
#    - Twitter/X
#    - LinkedIn
#    - Facebook (optional)
#    - Instagram (optional)

AYRSHARE_API_KEY: ________-____-____-____-____________
```

### Day 5: Monitoring & Analytics

#### 9. Monitoring Setup
```bash
# BetterUptime (Free tier: 10 monitors)
# 1. Sign up at betteruptime.com
# 2. Add monitor for your domain
# 3. Setup alert email/Slack

# Plausible Analytics (Self-hosted or $9/mo)
# Option A: Self-host on Vercel
# Option B: Use plausible.io ($9/month for 10K pageviews)

PLAUSIBLE_DOMAIN: yourdomain.com
```

#### 10. Email Service
```bash
# MailerLite (Free: 1000 subscribers)
# 1. Sign up at mailerlite.com
# 2. Verify domain for sending
# 3. Create signup form

MAILERLITE_API_KEY: ___________________________
```

### Day 6-7: Repository Setup

#### 11. Initialize Next.js Project
```bash
# Create new Next.js 15 app
npx create-next-app@latest nexus-affiliate \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*"

cd nexus-affiliate

# Install dependencies
npm install @supabase/supabase-js
npm install @supabase/auth-helpers-nextjs
npm install react-markdown
npm install react-syntax-highlighter
npm install lucide-react
npm install date-fns
npm install next-themes

# Install dev dependencies
npm install -D @types/react-syntax-highlighter
```

#### 12. Project Structure
```bash
# Create folder structure
mkdir -p src/app/api
mkdir -p src/app/admin/topics
mkdir -p src/app/admin/articles
mkdir -p src/components/admin
mkdir -p src/components/ui
mkdir -p src/lib
mkdir -p src/hooks
mkdir -p supabase/migrations
mkdir -p n8n-workflows

# Create essential files
touch .env.local
touch supabase/migrations/001_initial_schema.sql
touch src/lib/supabase.ts
touch src/lib/types.ts
```

#### 13. Environment Variables
```bash
# Create .env.local file
cat > .env.local << EOF
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://________.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# n8n Webhooks
N8N_WEBHOOK_URL=https://________.n8n.app/webhook
N8N_API_KEY=n8n_api_______________________

# AI APIs
GEMINI_API_KEY=AIzaSy_______________________
CLAUDE_API_KEY=sk-ant-_______________________

# Other Services
FIRECRAWL_API_KEY=fc-_______________________
REPLICATE_API_TOKEN=r8-_______________________
AYRSHARE_API_KEY=________-____-____-____-____________

# Site Config
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_SITE_NAME="Your Affiliate Site"
EOF

# Add to .gitignore
echo ".env.local" >> .gitignore
```

#### 14. Push to GitHub
```bash
git init
git add .
git commit -m "Initial setup: Next.js 15 + Supabase"
git branch -M main
git remote add origin https://github.com/yourusername/nexus-affiliate.git
git push -u origin main
```

#### 15. Deploy to Vercel
```bash
# 1. Go to vercel.com/new
# 2. Import your GitHub repository
# 3. Add all environment variables from .env.local
# 4. Deploy
# 5. Add custom domain in Vercel settings

# Verify deployment:
# Visit: https://your-project.vercel.app
```

---

## Week 2: Database & Core Workflows (15-20 hours)

### Day 1: Database Setup

#### 1. Run Migrations
```bash
# Copy schema from SUPABASE_SCHEMA.sql (separate file)
# Then in Supabase SQL Editor:
# 1. Go to SQL Editor
# 2. Paste migration
# 3. Run

# Verify tables created:
# - content_topics
# - articles
# - products
# - affiliate_clicks
# - workflow_logs
```

#### 2. Row Level Security
```bash
# Enable RLS on all tables
# Add policies for:
# - Public read for published articles
# - Admin full access
# - Anonymous article view tracking
```

### Day 2-3: Build WF1 - Trend Discovery

#### n8n Workflow Setup
```
1. Open n8n: https://________.n8n.app
2. Create new workflow: "WF1 - Trend Discovery"
3. Add nodes as per WF1_TREND_DISCOVERY.json
4. Configure schedule: Daily 6am
5. Test manually first
6. Activate workflow
```

**Key Nodes:**
- Schedule Trigger (6am daily)
- HTTP: Google Trends
- HTTP: Product Hunt API
- HTTP: Reddit API
- Gemini Pro (scoring)
- Supabase Insert

**Testing:**
```bash
# Manual test run
# 1. Click "Execute Workflow"
# 2. Check Supabase: content_topics table
# 3. Verify 10 topics inserted with status='pending_approval'
# 4. Check email notification received
```

### Day 4-5: Build WF2 - Topic Approval Dashboard

#### Create Admin Pages
```bash
# File: src/app/admin/topics/page.tsx
# See APPROVAL_DASHBOARD.tsx for full code

# Key features:
# - List pending topics
# - Show AI analysis
# - Approve/Reject buttons
# - Trigger WF3 on approval
```

#### API Route for Approval
```bash
# File: src/app/api/topics/approve/route.ts
# Handles topic approval
# Triggers n8n webhook for WF3
```

### Day 6-7: Build WF3 - Content Generator

#### n8n Workflow
```
1. Create new workflow: "WF3 - Content Generator"
2. Webhook trigger (from WF2)
3. Firecrawl scraping (3 competitors)
4. Gemini Pro (outline + content)
5. Quality checks
6. Claude fallback if quality < 70
7. Supabase insert article
8. Email notification
```

**Testing:**
```bash
# 1. Approve a topic in dashboard
# 2. Wait 8-12 minutes
# 3. Check email for "Article ready for review"
# 4. Verify article in Supabase with status='pending_review'
```

---

## Week 3: Assets & Publishing (15-20 hours)

### Day 1-2: Build WF4 - Review Interface

#### Article Review Page
```bash
# File: src/app/admin/articles/[id]/page.tsx
# See REVIEW_INTERFACE.tsx for full code

# Features:
# - Markdown preview
# - Inline editing
# - Quality report
# - Approval buttons
```

### Day 3: Build WF5 - Asset Creator

#### n8n Workflow
```
1. Create: "WF5 - Asset Creator"
2. Webhook from WF4 (approval)
3. Gemini: Image prompts
4. Replicate: Generate 4 images
5. Optimize & upload to Supabase Storage
6. Gemini Vision: Alt text
7. Update article
```

### Day 4: Build WF6 - SEO Optimizer

#### n8n Workflow
```
1. Create: "WF6 - SEO Optimizer"
2. Triggered after WF5
3. Gemini: Schema.org markup
4. Generate slug
5. Internal links
6. Update article
```

### Day 5: Build WF7 - Publisher

#### n8n Workflow
```
1. Create: "WF7 - Publisher"
2. Update article status
3. Trigger Vercel deploy webhook
4. Wait 90 seconds
5. Verify URL live
6. Submit to Google/Bing indexing
```

### Day 6-7: Build WF8 - Social Distributor

#### n8n Workflow
```
1. Create: "WF8 - Social Distributor"
2. Wait 60 min after WF7
3. Gemini: Platform-specific posts
4. Ayrshare: Schedule posts
5. Log to database
```

---

## Week 4: Testing & Launch (10-15 hours)

### Day 1-3: End-to-End Testing

#### Test Full Pipeline
```bash
# Test 1: Trend Discovery
1. Manually trigger WF1
2. Verify 10 topics in dashboard
3. Approve 1 topic
4. Verify WF3 triggered

# Test 2: Content Generation
5. Wait for article generation (8-12 min)
6. Check email notification
7. Open review interface
8. Make minor edits
9. Approve article
10. Verify WF5-8 triggered

# Test 3: Publishing
11. Wait for publish (15-20 min total)
12. Visit article URL
13. Verify on social media (check Ayrshare)
14. Check analytics tracking
```

#### Bug Fixes & Optimization
```bash
# Common issues:
# - API rate limits (add delays)
# - Webhook timeouts (increase timeout in n8n)
# - Image generation failures (add retry logic)
# - Quality score too low (refine prompts)
```

### Day 4: Legal Setup

#### Required Pages
```bash
# Create legal pages:
# - /privacy-policy
# - /terms-of-service
# - /affiliate-disclosure
# - /about

# Use templates from LEGAL_TEMPLATES.md
# Customize with lawyer review ($300-500)
```

#### Compliance Implementation
```bash
# Add to every article:
# 1. Affiliate disclosure component
# 2. Cookie consent banner (use react-cookie-consent)
# 3. Privacy policy link in footer
```

### Day 5-6: Affiliate Program Applications

#### Apply to Programs
```bash
# Priority programs:
1. Amazon Associates (requires 10+ articles, 1000+ visitors/month)
2. ShareASale (easier approval)
3. Impact.com (merchant-specific)
4. CJ Affiliate (higher barriers)
5. Direct programs (SaaS companies)

# Application checklist:
- [ ] 10+ published articles
- [ ] About page with team info
- [ ] Privacy policy live
- [ ] Contact information visible
- [ ] Professional design
- [ ] No broken links
```

#### Add Affiliate Links
```bash
# Once approved:
# 1. Get affiliate links
# 2. Add to products table in Supabase
# 3. Insert links into articles
# 4. Test click tracking
```

### Day 7: Launch

#### Pre-Launch Checklist
```bash
# Technical
- [ ] All 8 workflows tested and active
- [ ] Database backups configured (Supabase auto)
- [ ] Monitoring alerts setup (BetterUptime)
- [ ] SSL certificate active (Vercel auto)
- [ ] Custom domain configured
- [ ] Analytics tracking verified

# Legal
- [ ] All legal pages live
- [ ] Cookie consent banner working
- [ ] Affiliate disclosures on all articles
- [ ] Lawyer reviewed ($300-500 spent)

# Content
- [ ] 10-15 articles published
- [ ] All images optimized
- [ ] Social posts scheduled
- [ ] Email signup form working

# Affiliate
- [ ] 3+ programs approved
- [ ] Links inserted in articles
- [ ] Click tracking working
- [ ] Commission tracking setup
```

#### Launch Day
```bash
# 1. Final smoke test (approve & publish 1 article)
# 2. Announce on social media
# 3. Submit to Google Search Console
# 4. Share in relevant communities (Reddit, forums)
# 5. Email friends/network
# 6. Monitor for errors (first 24 hours)
```

---

## Phase 0 Deliverables

At the end of Week 4, you should have:

✅ **Infrastructure:**
- Next.js site deployed on Vercel
- Supabase database with 8 tables
- n8n with 8 working workflows
- All API integrations tested

✅ **Content:**
- 10-15 published articles (automated + approved)
- Social media posts scheduled/published
- Email signup form collecting subscribers

✅ **Legal:**
- All compliance pages live
- Cookie consent implemented
- Affiliate disclosures on articles
- Lawyer consultation completed

✅ **Workflows:**
- WF1: Trend Discovery (running daily)
- WF2: Approval Dashboard (functional)
- WF3: Content Generator (tested)
- WF4: Review Interface (functional)
- WF5: Asset Creator (tested)
- WF6: SEO Optimizer (tested)
- WF7: Publisher (tested)
- WF8: Social Distributor (tested)

✅ **Affiliate:**
- 3-5 programs approved
- Affiliate links in articles
- Click tracking working

---

## Success Metrics (End of Week 4)

Track these to validate Phase 0 success:

- [ ] **Articles:** 10-15 published
- [ ] **Approval Time:** <30 min per article
- [ ] **Quality Score:** Average 75+
- [ ] **Workflow Uptime:** 95%+
- [ ] **First Affiliate Click:** At least 1
- [ ] **Email Subscribers:** 10-20
- [ ] **Total Visitors:** 100-200
- [ ] **Budget:** <$1,500 total spent

---

## Common Issues & Solutions

### Issue 1: Gemini API Rate Limits
**Symptom:** "Quota exceeded" error  
**Solution:** Add 1-second delay between API calls in n8n

### Issue 2: Workflow Timeout
**Symptom:** n8n workflow stops mid-execution  
**Solution:** Increase timeout in n8n settings (Settings > Executions > Timeout)

### Issue 3: Low Quality Scores
**Symptom:** Articles consistently scoring <70  
**Solution:** Refine Gemini prompts, add more examples, increase temperature

### Issue 4: Image Generation Failures
**Symptom:** Replicate returns errors  
**Solution:** Add retry logic (3 attempts), fallback to stock images

### Issue 5: Vercel Deployment Issues
**Symptom:** Article not appearing after publish  
**Solution:** Check Vercel logs, verify ISR configuration, clear CDN cache

---

## Next: Phase 1 (Weeks 5-12)

Once Phase 0 is complete and validated:

1. **Move to production approvals:** Approve 2-3 topics daily
2. **Publish 5-7 articles per week**
3. **Refine prompts based on quality feedback**
4. **Monitor costs and optimize**
5. **Start building email list**
6. **Apply to more affiliate programs**

See `PHASE_1_OPERATIONS.md` for daily operations guide.

---

## Support Resources

- **Supabase Docs:** https://supabase.com/docs
- **n8n Docs:** https://docs.n8n.io
- **Next.js Docs:** https://nextjs.org/docs
- **Gemini API:** https://ai.google.dev/docs
- **Firecrawl API:** https://firecrawl.dev/docs

**Estimated Time to Complete Phase 0:** 60-80 hours over 4 weeks  
**Budget:** $170/month + $500 one-time = **~$1,200 total**

**Ready to build? Start with Day 1 infrastructure setup!** 🚀
