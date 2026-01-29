# Implementation Checklist
## LinkGenieKR - Phase 0 Setup

Use this checklist to track your progress through the 4-week implementation.

---

## 📋 Week 1: Infrastructure (15-20 hours)

### Day 1-2: Core Services
- [ ] Register domain name
  - Domain: ____________________
  - Registrar: ____________________
  - Cost: $8-12
- [ ] Sign up for Vercel
  - Account created: ☐
  - Project ID: ____________________
- [ ] Create Supabase project
  - Project name: nexus-affiliate-prod
  - Region: ____________________
  - Save URL & API keys: ☐
- [ ] Sign up for n8n Cloud
  - Workspace: nexus-affiliate
  - Plan: Starter ($20/mo)
  - Account created: ☐

### Day 3-4: API Keys
- [ ] Google AI (Gemini Pro)
  - API key saved: ☐
  - Billing enabled: ☐
  - Test call successful: ☐
- [ ] Anthropic (Claude)
  - API key saved: ☐
  - $20 credit added: ☐
- [ ] Firecrawl
  - Account created: ☐
  - API key saved: ☐
- [ ] Replicate
  - Account created: ☐
  - $10 credit added: ☐
- [ ] Ayrshare
  - Account created: ☐
  - Social accounts connected: ☐

### Day 5: Monitoring & Email
- [ ] BetterUptime
  - Monitor created: ☐
  - Alerts configured: ☐
- [ ] MailerLite
  - Account created: ☐
  - Domain verified: ☐
  - Signup form created: ☐

### Day 6-7: Repository Setup
- [ ] Create Next.js project
  - Project initialized: ☐
  - Dependencies installed: ☐
- [ ] Project structure created
  - All folders created: ☐
  - Essential files created: ☐
- [ ] Environment variables configured
  - .env.local created: ☐
  - All variables set: ☐
  - Added to .gitignore: ☐
- [ ] Push to GitHub
  - Repository created: ☐
  - Initial commit pushed: ☐
- [ ] Deploy to Vercel
  - Deployment successful: ☐
  - Environment variables added: ☐
  - Custom domain configured: ☐

**Week 1 Cost:** ~$50-70 + domain

---

## 📋 Week 2: Database & Core Workflows (15-20 hours)

### Day 1: Database
- [ ] Run Supabase migration
  - Schema copied: ☐
  - Migration executed: ☐
  - All 9 tables created: ☐
  - RLS policies enabled: ☐
- [ ] Test database connection
  - Next.js → Supabase working: ☐

### Day 2-3: WF1 - Trend Discovery
- [ ] Create n8n workflow
  - Workflow created: ☐
  - All nodes added: ☐
  - Schedule configured (6am daily): ☐
- [ ] Configure API connections
  - Google Trends: ☐
  - Product Hunt: ☐
  - Reddit: ☐
  - Gemini Pro: ☐
  - Supabase: ☐
- [ ] Test workflow
  - Manual execution successful: ☐
  - Topics inserted in database: ☐
  - Email notification received: ☐
- [ ] Activate workflow
  - Workflow activated: ☐

### Day 4-5: WF2 - Topic Approval
- [ ] Create admin pages
  - /admin/topics page created: ☐
  - UI components working: ☐
- [ ] Create API route
  - /api/topics/approve created: ☐
  - Webhook trigger tested: ☐
- [ ] Test approval flow
  - Approve button works: ☐
  - Status updates in database: ☐
  - WF3 triggered successfully: ☐

### Day 6-7: WF3 - Content Generator
- [ ] Create n8n workflow
  - Workflow created: ☐
  - Webhook trigger configured: ☐
  - Firecrawl node added: ☐
  - Gemini Pro content node: ☐
  - Claude fallback configured: ☐
  - Quality check logic: ☐
- [ ] Test workflow
  - Article generated successfully: ☐
  - Quality score calculated: ☐
  - Inserted in database: ☐
  - Email sent: ☐

**Week 2 Cost:** $50 (API usage)

---

## 📋 Week 3: Assets & Publishing (15-20 hours)

### Day 1-2: WF4 - Review Interface
- [ ] Create article review page
  - /admin/articles/[id] created: ☐
  - Markdown preview working: ☐
  - Inline editor functional: ☐
  - Quality report displayed: ☐
- [ ] Test review flow
  - Edit article: ☐
  - Approve article: ☐
  - WF5 triggered: ☐

### Day 3: WF5 - Asset Creator
- [ ] Create n8n workflow
  - Workflow created: ☐
  - Image prompt generation: ☐
  - Replicate integration: ☐
  - 4 images generated: ☐
  - Upload to Supabase Storage: ☐
  - Alt text generation: ☐
- [ ] Test workflow
  - Images generated: ☐
  - Alt text added: ☐
  - Article updated: ☐

### Day 4: WF6 - SEO Optimizer
- [ ] Create n8n workflow
  - Workflow created: ☐
  - Schema.org generation: ☐
  - Slug creation: ☐
  - Internal linking: ☐
- [ ] Test workflow
  - SEO data added: ☐
  - Schema valid: ☐

### Day 5: WF7 - Publisher
- [ ] Create n8n workflow
  - Workflow created: ☐
  - Vercel webhook trigger: ☐
  - URL verification: ☐
  - Google/Bing submission: ☐
- [ ] Test workflow
  - Article published: ☐
  - URL live: ☐
  - Indexed: ☐

### Day 6-7: WF8 - Social Distributor
- [ ] Create n8n workflow
  - Workflow created: ☐
  - Platform-specific posts: ☐
  - Ayrshare integration: ☐
  - Scheduling logic: ☐
- [ ] Test workflow
  - Posts created: ☐
  - Scheduled successfully: ☐

**Week 3 Cost:** $80-100 (image generation, API usage)

---

## 📋 Week 4: Testing & Launch (10-15 hours)

### Day 1-3: End-to-End Testing
- [ ] Test full pipeline
  - WF1 discovers topics: ☐
  - Approve topic: ☐
  - WF3 generates article: ☐
  - Review article: ☐
  - Approve article: ☐
  - WF5-8 complete: ☐
  - Article published: ☐
  - Social posts live: ☐
- [ ] Run 3 complete tests
  - Test 1 complete: ☐
  - Test 2 complete: ☐
  - Test 3 complete: ☐
- [ ] Fix any bugs
  - Bug list created: ☐
  - All bugs fixed: ☐

### Day 4: Legal Pages
- [ ] Create legal pages
  - Privacy Policy: ☐
  - Terms of Service: ☐
  - Affiliate Disclosure: ☐
  - About page: ☐
- [ ] Lawyer review
  - Documents sent for review: ☐
  - Feedback incorporated: ☐
  - Final approval: ☐
  - Cost: $300-500
- [ ] Implement compliance
  - Affiliate disclosures in templates: ☐
  - Cookie consent banner: ☐
  - Privacy policy linked in footer: ☐

### Day 5-6: Affiliate Programs
- [ ] Prepare applications
  - 10+ articles published: ☐
  - About page complete: ☐
  - Contact info visible: ☐
- [ ] Apply to programs
  - Amazon Associates: ☐
  - ShareASale: ☐
  - Impact.com: ☐
  - CJ Affiliate: ☐
  - Direct programs (list): ____________________
- [ ] Add affiliate links
  - Products added to database: ☐
  - Links inserted in articles: ☐
  - Click tracking tested: ☐

### Day 7: Launch
- [ ] Pre-launch checklist
  - All workflows active: ☐
  - Database backups configured: ☐
  - Monitoring alerts setup: ☐
  - SSL certificate active: ☐
  - Custom domain working: ☐
  - Analytics tracking: ☐
- [ ] Legal compliance
  - All pages live: ☐
  - Cookie consent working: ☐
  - Disclosures on all articles: ☐
- [ ] Content ready
  - 10-15 articles published: ☐
  - Images optimized: ☐
  - Social posts scheduled: ☐
  - Email signup working: ☐
- [ ] Affiliate programs
  - 3+ programs approved: ☐
  - Links in articles: ☐
  - Tracking working: ☐
- [ ] Launch activities
  - Final smoke test: ☐
  - Social media announcement: ☐
  - Google Search Console submission: ☐
  - Community shares: ☐
  - Network email sent: ☐
  - 24-hour monitoring: ☐

**Week 4 Cost:** $500-700 (lawyer + affiliate setup)

---

## 🎯 Phase 0 Deliverables

### Infrastructure ✅
- [ ] Next.js site on Vercel
- [ ] Supabase database (9 tables)
- [ ] n8n (8 workflows)
- [ ] All API integrations

### Content ✅
- [ ] 10-15 published articles
- [ ] Social posts published
- [ ] Email signup form

### Legal ✅
- [ ] All compliance pages
- [ ] Cookie consent
- [ ] Affiliate disclosures
- [ ] Lawyer consultation

### Workflows ✅
- [ ] WF1: Trend Discovery
- [ ] WF2: Approval Dashboard
- [ ] WF3: Content Generator
- [ ] WF4: Review Interface
- [ ] WF5: Asset Creator
- [ ] WF6: SEO Optimizer
- [ ] WF7: Publisher
- [ ] WF8: Social Distributor

### Affiliate ✅
- [ ] 3-5 programs approved
- [ ] Links in articles
- [ ] Click tracking

---

## 📊 Success Metrics

Track these at the end of Week 4:

- [ ] **Articles:** 10-15 published
- [ ] **Approval Time:** <30 min per article
- [ ] **Quality Score:** Average 75+
- [ ] **Workflow Uptime:** 95%+
- [ ] **First Affiliate Click:** At least 1
- [ ] **Email Subscribers:** 10-20
- [ ] **Total Visitors:** 100-200
- [ ] **Budget:** <$1,500 total

**Actual Results:**
- Articles: _____
- Avg Approval Time: _____ min
- Avg Quality: _____
- Workflow Uptime: _____%
- Affiliate Clicks: _____
- Email Subscribers: _____
- Total Visitors: _____
- Total Spent: $_____

---

## 💰 Budget Tracking

| Category | Budgeted | Actual | Notes |
|----------|----------|--------|-------|
| Domain | $10 | | |
| Vercel | $0 | | Free tier |
| Supabase | $0 | | Free tier |
| n8n Cloud | $80 | | $20/mo × 4 weeks |
| Gemini Pro | $40 | | API usage |
| Claude | $20 | | API usage |
| Firecrawl | $120 | | $30/mo × 4 weeks |
| Replicate | $80 | | Images |
| Ayrshare | $116 | | $29/mo × 4 weeks |
| MailerLite | $0 | | Free tier |
| BetterUptime | $0 | | Free tier |
| Lawyer | $500 | | One-time |
| **Total** | **$966** | | |

**Final Total:** $_________

---

## 🚀 Ready for Phase 1?

Before moving to Phase 1 operations:

- [ ] All checkboxes above completed
- [ ] Success metrics validated
- [ ] Budget tracking complete
- [ ] Team trained (if applicable)
- [ ] Backup & recovery tested
- [ ] Documentation reviewed

**Phase 1 Start Date:** _______________

---

## 🆘 Support

Stuck on something? Resources:

- **Supabase:** https://supabase.com/docs
- **n8n:** https://docs.n8n.io
- **Next.js:** https://nextjs.org/docs
- **Gemini:** https://ai.google.dev/docs

**Need help?** Check PHASE_0_IMPLEMENTATION.md for detailed instructions on each step.
