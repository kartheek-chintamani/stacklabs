-- =================================================
-- LinkGenieKR Database Schema
-- Supabase PostgreSQL Migration
-- Phase 0: Automation-With-Approval Architecture
-- =================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =================================================
-- 1. CONTENT TOPICS TABLE
-- Purpose: AI-discovered topics pending human approval
-- =================================================
CREATE TABLE content_topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_title TEXT NOT NULL,
  topic_description TEXT NOT NULL,
  niche_category TEXT NOT NULL,
  
  -- AI Analysis
  ai_analysis JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Schema: {
  --   "search_volume": 5000,
  --   "trend_direction": "rising",
  --   "competition_level": "medium",
  --   "reasoning": "...",
  --   "potential_keywords": ["keyword1", "keyword2"]
  -- }
  
  quality_score INTEGER CHECK (quality_score >= 0 AND quality_score <= 100),
  estimated_monthly_searches INTEGER,
  competition_level TEXT CHECK (competition_level IN ('low', 'medium', 'high')),
  
  -- Source tracking
  discovered_via TEXT NOT NULL, -- 'google_trends', 'product_hunt', 'reddit'
  source_url TEXT,
  
  -- Approval workflow
  status TEXT NOT NULL DEFAULT 'pending_approval' 
    CHECK (status IN ('pending_approval', 'approved', 'rejected', 'in_progress', 'published')),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_topics_status ON content_topics(status);
CREATE INDEX idx_topics_created ON content_topics(created_at DESC);
CREATE INDEX idx_topics_quality ON content_topics(quality_score DESC);
CREATE INDEX idx_topics_niche ON content_topics(niche_category);

-- Updated timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_topics_updated_at 
  BEFORE UPDATE ON content_topics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =================================================
-- 2. ARTICLES TABLE
-- Purpose: AI-generated articles with review workflow
-- =================================================
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID REFERENCES content_topics(id) ON DELETE SET NULL,
  
  -- Content
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  meta_description TEXT,
  
  -- Markdown content
  content TEXT NOT NULL,
  word_count INTEGER,
  reading_time_minutes INTEGER,
  
  -- AI Generation metadata
  generation_metadata JSONB DEFAULT '{}'::jsonb,
  -- Schema: {
  --   "model_used": "gemini-pro",
  --   "tokens_used": 5000,
  --   "generation_time_seconds": 45,
  --   "competitor_sources": ["url1", "url2"],
  --   "outline": {...},
  --   "fallback_used": false
  -- }
  
  quality_report JSONB DEFAULT '{}'::jsonb,
  -- Schema: {
  --   "overall_score": 78,
  --   "originality": 85,
  --   "depth": 75,
  --   "readability": 80,
  --   "seo_score": 70,
  --   "issues": [],
  --   "suggestions": []
  -- }
  
  -- Review workflow
  status TEXT NOT NULL DEFAULT 'pending_review'
    CHECK (status IN ('pending_review', 'approved', 'needs_revision', 'published', 'archived')),
  reviewer_notes TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  -- SEO
  focus_keyword TEXT,
  keywords TEXT[], -- Array of target keywords
  internal_links JSONB DEFAULT '[]'::jsonb, -- [{slug: "/article", anchor: "text"}]
  
  -- Schema.org markup
  schema_markup JSONB,
  
  -- Publishing
  published_at TIMESTAMP WITH TIME ZONE,
  updated_at_published TIMESTAMP WITH TIME ZONE,
  
  -- Analytics (updated periodically)
  total_views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  avg_time_on_page INTEGER, -- seconds
  bounce_rate DECIMAL(5,2), -- percentage
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_published ON articles(published_at DESC NULLS LAST);
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_topic ON articles(topic_id);
CREATE INDEX idx_articles_quality ON articles(((quality_report->>'overall_score')::int) DESC);

-- Full-text search
CREATE INDEX idx_articles_fts ON articles USING gin(to_tsvector('english', title || ' ' || content));

-- Updated timestamp trigger
CREATE TRIGGER update_articles_updated_at 
  BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =================================================
-- 3. PRODUCTS TABLE
-- Purpose: Affiliate products mentioned in articles
-- =================================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Product info
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  
  -- Pricing
  price_amount DECIMAL(10,2),
  price_currency TEXT DEFAULT 'USD',
  is_free_tier BOOLEAN DEFAULT false,
  pricing_model TEXT, -- 'one-time', 'monthly', 'yearly', 'freemium'
  
  -- Links
  product_url TEXT NOT NULL, -- Official product URL
  affiliate_link TEXT, -- Your affiliate URL
  affiliate_program TEXT, -- 'amazon', 'shareasale', 'impact', 'direct'
  
  -- Media
  image_url TEXT,
  logo_url TEXT,
  
  -- Metrics
  rating DECIMAL(3,2) CHECK (rating >= 0 AND rating <= 5),
  review_count INTEGER DEFAULT 0,
  
  -- Tracking
  total_clicks INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  total_earnings DECIMAL(10,2) DEFAULT 0.00,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  last_verified_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = true;
CREATE INDEX idx_products_clicks ON products(total_clicks DESC);

-- Updated timestamp trigger
CREATE TRIGGER update_products_updated_at 
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =================================================
-- 4. ARTICLE_PRODUCTS (Junction Table)
-- Purpose: Link articles to products they mention
-- =================================================
CREATE TABLE article_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  
  -- Context in article
  mention_type TEXT CHECK (mention_type IN ('review', 'comparison', 'mention', 'featured')),
  position_in_article INTEGER, -- 1 = top recommendation
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(article_id, product_id)
);

CREATE INDEX idx_article_products_article ON article_products(article_id);
CREATE INDEX idx_article_products_product ON article_products(product_id);

-- =================================================
-- 5. AFFILIATE_CLICKS TABLE
-- Purpose: Track all affiliate link clicks
-- =================================================
CREATE TABLE affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- References
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  article_id UUID REFERENCES articles(id) ON DELETE SET NULL,
  
  -- Click metadata
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- User info (anonymized)
  visitor_id TEXT, -- Anonymous tracking ID
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  
  -- Geo data
  country_code TEXT,
  city TEXT,
  
  -- Conversion tracking
  converted BOOLEAN DEFAULT false,
  conversion_date TIMESTAMP WITH TIME ZONE,
  commission_amount DECIMAL(10,2),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_clicks_product ON affiliate_clicks(product_id);
CREATE INDEX idx_clicks_article ON affiliate_clicks(article_id);
CREATE INDEX idx_clicks_date ON affiliate_clicks(clicked_at DESC);
CREATE INDEX idx_clicks_converted ON affiliate_clicks(converted) WHERE converted = true;

-- =================================================
-- 6. ASSETS TABLE
-- Purpose: Images and media generated by workflows
-- =================================================
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  
  -- File info
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL, -- Supabase Storage path
  public_url TEXT NOT NULL,
  
  -- Type
  asset_type TEXT NOT NULL CHECK (asset_type IN ('hero', 'social_share', 'thumbnail', 'inline')),
  mime_type TEXT NOT NULL,
  file_size_bytes INTEGER,
  
  -- Dimensions
  width INTEGER,
  height INTEGER,
  
  -- Generation metadata
  generation_metadata JSONB DEFAULT '{}'::jsonb,
  -- Schema: {
  --   "model": "flux-1-schnell",
  --   "prompt": "...",
  --   "negative_prompt": "...",
  --   "generation_time": 8.5,
  --   "cost": 0.05
  -- }
  
  -- SEO
  alt_text TEXT NOT NULL,
  caption TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_assets_article ON assets(article_id);
CREATE INDEX idx_assets_type ON assets(asset_type);

-- =================================================
-- 7. WORKFLOW_LOGS TABLE
-- Purpose: Track all n8n workflow executions
-- =================================================
CREATE TABLE workflow_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Workflow identification
  workflow_name TEXT NOT NULL,
  workflow_id TEXT, -- n8n workflow ID
  execution_id TEXT, -- n8n execution ID
  
  -- References
  topic_id UUID REFERENCES content_topics(id) ON DELETE SET NULL,
  article_id UUID REFERENCES articles(id) ON DELETE SET NULL,
  
  -- Execution details
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  
  status TEXT NOT NULL DEFAULT 'running'
    CHECK (status IN ('running', 'success', 'error', 'timeout', 'cancelled')),
  
  -- Error tracking
  error_message TEXT,
  error_node TEXT, -- Which n8n node failed
  
  -- Resource usage
  tokens_used INTEGER,
  api_calls_made INTEGER,
  cost_usd DECIMAL(10,4),
  
  -- Data
  input_data JSONB,
  output_data JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_logs_workflow ON workflow_logs(workflow_name);
CREATE INDEX idx_logs_status ON workflow_logs(status);
CREATE INDEX idx_logs_started ON workflow_logs(started_at DESC);
CREATE INDEX idx_logs_topic ON workflow_logs(topic_id);
CREATE INDEX idx_logs_article ON workflow_logs(article_id);

-- =================================================
-- 8. SCHEDULED_POSTS TABLE
-- Purpose: Social media posts scheduled by WF8
-- =================================================
CREATE TABLE scheduled_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  
  -- Platform
  platform TEXT NOT NULL CHECK (platform IN ('twitter', 'linkedin', 'facebook', 'instagram')),
  
  -- Content
  post_content TEXT NOT NULL,
  media_urls TEXT[], -- Array of image URLs
  
  -- Scheduling
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE,
  
  status TEXT NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'published', 'failed', 'cancelled')),
  
  -- External tracking
  platform_post_id TEXT, -- ID from social platform
  platform_url TEXT, -- Direct link to post
  
  -- Engagement (updated periodically)
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  clicks_count INTEGER DEFAULT 0,
  
  -- Error tracking
  error_message TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_posts_article ON scheduled_posts(article_id);
CREATE INDEX idx_posts_platform ON scheduled_posts(platform);
CREATE INDEX idx_posts_scheduled ON scheduled_posts(scheduled_for);
CREATE INDEX idx_posts_status ON scheduled_posts(status);

-- Updated timestamp trigger
CREATE TRIGGER update_posts_updated_at 
  BEFORE UPDATE ON scheduled_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =================================================
-- 9. USER SETTINGS TABLE
-- Purpose: Admin configuration and preferences
-- =================================================
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL, -- From Supabase auth.users
  
  -- Workflow preferences
  auto_approve_topics BOOLEAN DEFAULT false,
  auto_approve_articles BOOLEAN DEFAULT false,
  quality_threshold INTEGER DEFAULT 75, -- Min score for auto-approval
  
  -- Notification preferences
  email_on_topic_ready BOOLEAN DEFAULT true,
  email_on_article_ready BOOLEAN DEFAULT true,
  email_on_publish_success BOOLEAN DEFAULT true,
  email_on_errors BOOLEAN DEFAULT true,
  
  notification_email TEXT NOT NULL,
  
  -- Content preferences
  preferred_tone TEXT DEFAULT 'professional',
  preferred_length TEXT DEFAULT 'medium', -- 'short', 'medium', 'long'
  include_competitors BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Updated timestamp trigger
CREATE TRIGGER update_settings_updated_at 
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =================================================

-- Enable RLS on all tables
ALTER TABLE content_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ POLICIES (for published content)

-- Anyone can read published articles
CREATE POLICY "Public articles are viewable by anyone" 
  ON articles FOR SELECT
  USING (status = 'published');

-- Anyone can read active products
CREATE POLICY "Public products are viewable by anyone"
  ON products FOR SELECT
  USING (is_active = true);

-- Anyone can read article-product relationships
CREATE POLICY "Public article-products are viewable"
  ON article_products FOR SELECT
  USING (true);

-- Anyone can read active assets
CREATE POLICY "Public assets are viewable"
  ON assets FOR SELECT
  USING (is_active = true);

-- ADMIN FULL ACCESS POLICIES

-- Create admin role check function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admins can do everything
CREATE POLICY "Admins have full access to topics"
  ON content_topics FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins have full access to articles"
  ON articles FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins have full access to products"
  ON products FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins have full access to article_products"
  ON article_products FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can read affiliate_clicks"
  ON affiliate_clicks FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins have full access to assets"
  ON assets FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can read workflow_logs"
  ON workflow_logs FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins have full access to scheduled_posts"
  ON scheduled_posts FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins have full access to user_settings"
  ON user_settings FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ANONYMOUS INSERT POLICY (for click tracking)
CREATE POLICY "Anyone can insert affiliate_clicks"
  ON affiliate_clicks FOR INSERT
  WITH CHECK (true);

-- =================================================
-- UTILITY FUNCTIONS
-- =================================================

-- Function: Get article with all related data
CREATE OR REPLACE FUNCTION get_article_full(article_slug TEXT)
RETURNS JSON AS $$
  SELECT json_build_object(
    'article', row_to_json(a.*),
    'products', (
      SELECT json_agg(row_to_json(p.*))
      FROM products p
      INNER JOIN article_products ap ON ap.product_id = p.id
      WHERE ap.article_id = a.id AND p.is_active = true
    ),
    'assets', (
      SELECT json_agg(row_to_json(ast.*))
      FROM assets ast
      WHERE ast.article_id = a.id AND ast.is_active = true
    )
  )
  FROM articles a
  WHERE a.slug = article_slug AND a.status = 'published';
$$ LANGUAGE sql;

-- Function: Get dashboard stats
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
  SELECT json_build_object(
    'pending_topics', (SELECT COUNT(*) FROM content_topics WHERE status = 'pending_approval'),
    'pending_articles', (SELECT COUNT(*) FROM articles WHERE status = 'pending_review'),
    'published_articles', (SELECT COUNT(*) FROM articles WHERE status = 'published'),
    'total_clicks', (SELECT COUNT(*) FROM affiliate_clicks),
    'total_conversions', (SELECT COUNT(*) FROM affiliate_clicks WHERE converted = true),
    'total_earnings', (SELECT COALESCE(SUM(commission_amount), 0) FROM affiliate_clicks WHERE converted = true),
    'avg_quality_score', (SELECT ROUND(AVG((quality_report->>'overall_score')::int)) FROM articles WHERE status = 'published')
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Function: Log workflow execution
CREATE OR REPLACE FUNCTION log_workflow_execution(
  p_workflow_name TEXT,
  p_workflow_id TEXT,
  p_execution_id TEXT,
  p_status TEXT,
  p_topic_id UUID DEFAULT NULL,
  p_article_id UUID DEFAULT NULL,
  p_duration_seconds INTEGER DEFAULT NULL,
  p_tokens_used INTEGER DEFAULT NULL,
  p_cost_usd DECIMAL DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO workflow_logs (
    workflow_name,
    workflow_id,
    execution_id,
    status,
    topic_id,
    article_id,
    duration_seconds,
    tokens_used,
    cost_usd,
    error_message,
    completed_at
  ) VALUES (
    p_workflow_name,
    p_workflow_id,
    p_execution_id,
    p_status,
    p_topic_id,
    p_article_id,
    p_duration_seconds,
    p_tokens_used,
    p_cost_usd,
    p_error_message,
    CASE WHEN p_status IN ('success', 'error', 'timeout') THEN NOW() ELSE NULL END
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =================================================
-- INITIAL DATA SEEDS
-- =================================================

-- Create admin user settings (run after creating first admin user)
-- INSERT INTO user_settings (user_id, notification_email)
-- VALUES ('YOUR-ADMIN-USER-ID', 'admin@yourdomain.com');

-- =================================================
-- BACKUP & MAINTENANCE
-- =================================================

-- View for daily stats
CREATE OR REPLACE VIEW daily_stats AS
SELECT
  DATE(created_at) as date,
  COUNT(*) FILTER (WHERE status = 'published') as articles_published,
  COUNT(*) FILTER (WHERE status = 'pending_review') as articles_pending,
  AVG((quality_report->>'overall_score')::int) as avg_quality_score
FROM articles
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- View for affiliate performance
CREATE OR REPLACE VIEW affiliate_performance AS
SELECT
  p.name as product_name,
  p.category,
  COUNT(ac.id) as total_clicks,
  COUNT(ac.id) FILTER (WHERE ac.converted = true) as conversions,
  CASE 
    WHEN COUNT(ac.id) > 0 
    THEN ROUND((COUNT(ac.id) FILTER (WHERE ac.converted = true)::decimal / COUNT(ac.id) * 100), 2)
    ELSE 0 
  END as conversion_rate,
  COALESCE(SUM(ac.commission_amount), 0) as total_earnings
FROM products p
LEFT JOIN affiliate_clicks ac ON ac.product_id = p.id
WHERE p.is_active = true
GROUP BY p.id, p.name, p.category
ORDER BY total_earnings DESC;

-- =================================================
-- SCHEMA VERSION
-- =================================================
CREATE TABLE schema_version (
  version TEXT PRIMARY KEY,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO schema_version (version) VALUES ('1.0.0_phase_0_automation');

-- =================================================
-- MIGRATION COMPLETE
-- =================================================
-- Run this entire file in Supabase SQL Editor
-- Then verify tables created:
--   SELECT table_name FROM information_schema.tables 
--   WHERE table_schema = 'public' ORDER BY table_name;
-- =================================================
