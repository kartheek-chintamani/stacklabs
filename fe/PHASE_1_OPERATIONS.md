# Phase 1 Operations Guide
## Daily Workflow & Optimization
**Weeks 5-12 | After Phase 0 Launch**

Now that your automation infrastructure is live, this guide covers your daily operations, optimization strategies, and scaling tactics for the first 8 weeks post-launch.

---

## Daily Routine (30-45 minutes)

### Morning (15-20 minutes) - 8:00 AM

#### 1. Check Email Notifications
You'll receive automated emails from WF1:

```
Subject: ✨ 8 New Topics Ready for Review
```

Open your admin dashboard:
```
https://yourdomain.com/admin/topics
```

#### 2. Review & Approve Topics (10-15 min)

**Approval Criteria:**
- Quality Score: ≥75 (prioritize 80+)
- Competition Level: Low or Medium preferred
- Monetization Potential: ≥70
- Keyword Alignment: Check if keywords match your niche
- Affiliate Products: Verify suggested products are available

**Action:**
- ✅ Approve: 2-3 best topics daily
- ❌ Reject: Low quality or off-topic
- 💡 Tip: Start with highest quality scores

**Expected Time:**
- Phase 1: 100% review = 15 min
- Phase 2: 20% review = 5 min  
- Phase 3: 5% review = 2 min

### Mid-Day (10-15 minutes) - 1:00 PM

#### 3. Check Article Queue

After 8-12 hours, you'll receive:
```
Subject: 📝 Article Ready for Review - [Title]
```

Open review interface:
```
https://yourdomain.com/admin/articles/pending
```

#### 4. Review Generated Articles (10-15 min)

**Review Checklist:**
- [ ] **Quality Report:** Overall score ≥75
- [ ] **Originality:** No obvious plagiarism (check 2-3 sentences in Google)
- [ ] **Accuracy:** Facts are correct (spot-check statistics)
- [ ] **Tone:** Matches your brand voice
- [ ] **Affiliate Products:** Correct products featured
- [ ] **Links:** All links working (test 2-3)
- [ ] **Images:** Alt text appropriate
- [ ] **SEO:** Title, meta description, keywords present

**Common Edits (5 min per article):**
- Adjust intro paragraph for stronger hook
- Add personal insight or opinion
- Tweak product recommendations order
- Strengthen call-to-action
- Fix any awkward phrasing

**Action:**
- ✅ Approve: Triggers WF5-8 (assets, SEO, publish, social)
- 🔄 Request Revision: Send back to AI (rare in Phase 1)

### Evening (5-10 minutes) - 7:00 PM

#### 5. Monitor Published Articles

Check Vercel deployment:
```
https://vercel.com/your-project/deployments
```

Verify latest articles are live:
```
https://yourdomain.com/articles/[slug]
```

#### 6. Check Social Media

Verify WF8 scheduled posts in Ayrshare:
```
https://app.ayrshare.com/scheduled
```

Engage with any comments/responses (5 min).

---

## Weekly Tasks (1-2 hours)

### Monday: Performance Review

#### Analytics Dashboard
```sql
-- Run in Supabase SQL Editor
SELECT 
  DATE_TRUNC('week', published_at) as week,
  COUNT(*) as articles_published,
  AVG((quality_report->>'overall_score')::int) as avg_quality,
  SUM(total_views) as total_views,
  AVG(avg_time_on_page) as avg_time
FROM articles
WHERE status = 'published'
GROUP BY week
ORDER BY week DESC
LIMIT 4;
```

**Track:**
- Articles published last week: _____
- Avg quality score: _____
- Total pageviews: _____
- Avg time on page: _____ seconds
- Bounce rate: _____%

#### Affiliate Performance
```sql
-- Check affiliate clicks & conversions
SELECT * FROM affiliate_performance
ORDER BY total_earnings DESC
LIMIT 10;
```

**Key Metrics:**
- Total clicks: _____
- Conversions: _____
- Earnings: $_____
- Top product: _________________

### Tuesday: Content Optimization

Review bottom 20% performers:
```sql
SELECT title, slug, total_views, bounce_rate
FROM articles
WHERE status = 'published'
ORDER BY total_views ASC
LIMIT 5;
```

**Optimization Actions:**
1. Update title for better CTR
2. Improve meta description
3. Add internal links from high-traffic articles
4. Refresh content if >30 days old
5. Add more affiliate links

### Wednesday: Competitor Analysis

Use Firecrawl to check competitors:
```javascript
// Run in n8n or manually
const competitors = [
  'competitor1.com',
  'competitor2.com',
  'competitor3.com'
];

// Check what topics they covered this week
// Identify gaps in your content
```

**Find Opportunities:**
- New products they're reviewing
- Trending topics you missed
- Better content angles
- Affiliate programs they use

### Thursday: SEO Improvements

#### Google Search Console
Check performance:
- Impressions trend
- Click-through rate
- Top queries
- Coverage issues

**Actions:**
- Submit new articles for indexing
- Fix any crawl errors
- Add internal links to new pages
- Create content for top impressions/low CTR queries

### Friday: Workflow Optimization

#### Review Workflow Logs
```sql
SELECT 
  workflow_name,
  AVG(duration_seconds) as avg_duration,
  COUNT(*) FILTER (WHERE status = 'error') as errors,
  SUM(cost_usd) as total_cost
FROM workflow_logs
WHERE started_at > NOW() - INTERVAL '7 days'
GROUP BY workflow_name;
```

**Optimize:**
- WF3 taking >15 min? Add caching
- High error rate? Check API limits
- Costs too high? Reduce API calls

#### Refine AI Prompts

Based on quality scores, improve prompts:
- **Score <70:** Add more examples
- **Low originality:** Adjust temperature
- **Wrong tone:** Update system prompt
- **Weak conclusions:** Add CTA instructions

---

## Monthly Review (2-3 hours)

### Key Metrics Dashboard

Create a spreadsheet tracking:

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Articles Published | 20-30 | ____ | ☐ |
| Avg Quality Score | ≥75 | ____ | ☐ |
| Total Pageviews | Growing | ____ | ☐ |
| Email Subscribers | +50/mo | ____ | ☐ |
| Affiliate Clicks | +100/mo | ____ | ☐ |
| Conversions | ≥3 | ____ | ☐ |
| Revenue | $50-200 | $____ | ☐ |
| Operating Costs | <$200 | $____ | ☐ |

### Month 1 (Week 5-8): Foundation

**Goals:**
- Publish 20-25 articles
- Generate 500-1000 pageviews
- Get first 20-50 email subscribers
- Earn first affiliate commission

**Focus:**
- Consistency over perfection
- Learn what content performs best
- Build topical authority
- Establish publishing rhythm

**Budget:** $170-200/month

### Month 2 (Week 9-12): Acceleration

**Goals:**
- Publish 25-30 articles
- Double traffic to 1000-2000 pageviews
- Grow email list to 100+ subscribers
- Earn $50-150 in commissions

**Focus:**
- Content quality improvements
- SEO optimization
- Build internal linking structure
- Email nurture sequence

**Optimizations:**
- Reduce approval time to 20 min/day
- Trust AI for 80% of topics
- Batch review articles (2-3 at once)

**Budget:** $200-250/month

---

## Cost Optimization Strategies

### Phase 1 (Months 1-3): Stay Lean

#### Immediate Savings:
1. **Move n8n to Self-Hosted** (save $10/month)
   - Deploy to $5/mo VPS (Hetzner, DigitalOcean)
   - Follow SELF_HOSTED_N8N.md guide

2. **Optimize Image Generation** (save $10-15/month)
   - Reduce to 3 images per article
   - Use Flux.1-schnell (faster, cheaper)
   - Cache prompts for similar articles

3. **Gemini Pro Usage** (save $10/month)
   - Increase temperature to reduce tokens
   - Cache system prompts
   - Batch API calls

4. **Firecrawl Optimization** (save $10/month)
   - Scrape only top 2 competitors
   - Cache results for 7 days
   - Use manual research for complex topics

**Potential Phase 1 Budget: $130-150/month** (down from $170-200)

### Phase 2 (Months 4-6): Selective Upgrades

#### Invest in Growth:
1. **Upgrade Ayrshare** ($49/mo → $99/mo)
   - Add Pinterest, TikTok
   - More posting slots
   - Better analytics

2. **Premium Email Tool** ($0 → $20/mo)
   - MailerLite paid tier OR Resend
   - Better deliverability
   - Automation sequences

3. **Supabase Pro** ($0 → $25/mo)
   - More storage
   - Daily backups
   - Better performance

**Phase 2 Budget: $200-250/month** (justified by revenue growth)

---

## Scaling Playbook

### When to Scale Up?

**Trigger: $500/mo Revenue** (typically Month 4-6)

1. **Increase Publishing Frequency**
   - Approve 3-4 topics daily (vs 2-3)
   - Publish 40-50 articles/month

2. **Upgrade AI Usage**
   - Switch to Claude Opus for top articles
   - Use GPT-4o for product comparisons
   - Better quality → higher conversions

3. **Hire VA for Reviews** ($200-400/month)
   - Outsource article review (30 min/day)
   - You focus on strategy
   - Document review process thoroughly

4. **Paid Traffic Experiments** ($100-200/month)
   - Facebook ads to top articles
   - Pinterest promoted pins
   - Google Performance Max

### Automation Milestones

**Phase 1 (Months 1-3): 100% Review**
- Approve all topics manually
- Review all articles
- Time: 45 min/day

**Phase 2 (Months 4-6): 20% Review**
- Auto-approve topics with score ≥85
- Review only flagged articles
- Time: 15 min/day

**Phase 3 (Months 7-12): 5% Review**
- Full automation with spot checks
- Review 1-2 articles/week
- Time: 5 min/day

**Phase 4 (Month 12+): Autonomous**
- AI runs end-to-end
- Weekly performance reviews
- Time: 2-3 hours/week

---

## Troubleshooting Common Issues

### Issue: Low Traffic

**Diagnosis:**
- Check Google Search Console coverage
- Verify articles are indexed
- Check for technical SEO issues

**Solutions:**
1. Improve internal linking
2. Build backlinks (guest posts, HARO)
3. Share on niche communities
4. Email your list more frequently

### Issue: Low Conversion Rate

**Diagnosis:**
- Track clicks but no conversions
- Check affiliate link placement
- Review product recommendations

**Solutions:**
1. Add more "buy now" CTAs
2. Feature products higher in content
3. Add comparison tables
4. Create dedicated review articles

### Issue: High Costs

**Diagnosis:**
- Review workflow_logs cost data
- Identify expensive workflows
- Check for API waste

**Solutions:**
1. Implement caching
2. Reduce API calls
3. Switch to cheaper models
4. Move to self-hosted services

### Issue: Quality Declining

**Diagnosis:**
- Quality scores dropping
- User engagement decreasing
- Bounce rate increasing

**Solutions:**
1. Refine AI prompts with examples
2. Manual review more articles
3. Update competitor data sources
4. Switch AI models (Gemini → Claude)

---

## When to Stop or Pivot?

Use the decision tree from ENHANCED_PRD.md:

### Red Flags (Consider Stopping):
- $0 revenue after 4 months
- Costs >$300/month with no ROI path
- Traffic declining month-over-month
- Cannot get approved for affiliate programs
- Content quality consistently <70

### Yellow Flags (Optimize/Pivot):
- Slow growth but positive trend
- High costs but clear optimization paths
- Low conversions but decent traffic
- Single revenue source underperforming

**Pivot Options:**
1. **Change Niche:** Different audience, better monetization
2. **Change Model:** Display ads vs affiliate
3. **Change Format:** Video reviews vs articles
4. **Double Down:** 2x publishing, 2x promotion

---

## Success Indicators

### Month 3 Benchmarks:
- ✅ 60-90 articles published
- ✅ 2000-5000 monthly pageviews
- ✅ 100-200 email subscribers
- ✅ $100-500 affiliate revenue
- ✅ <$600 total operating costs
- ✅ Workflow uptime >95%

### Month 6 Benchmarks:
- ✅ 150-200 articles published
- ✅ 5000-10000 monthly pageviews
- ✅ 300-500 email subscribers
- ✅ $500-1500 affiliate revenue
- ✅ Net positive cash flow
- ✅ Daily operations <15 min

### Month 12 Goals:
- ✅ 300-400 articles published
- ✅ 15000-25000 monthly pageviews
- ✅ 1000+ email subscribers
- ✅ $2000-4000 affiliate revenue
- ✅ 5-10x ROI on costs
- ✅ Mostly autonomous operation

---

## Next Steps

You're now operating your automated affiliate platform! Focus on:

1. **Consistency:** Daily 30-45 min commitment
2. **Quality:** Maintain standards, refine prompts
3. **Learning:** Track what works, double down
4. **Patience:** Growth compounds over time

**Remember:** First 90 days are about building foundations. Revenue follows content and traffic.

**Questions?** Review:
- ENHANCED_PRD.md for strategy
- PHASE_0_IMPLEMENTATION.md for technical setup
- IMPLEMENTATION_CHECKLIST.md for tracking progress

**Keep building! 🚀**
