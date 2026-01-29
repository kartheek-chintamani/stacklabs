-- =====================================================
-- Migration: Automation Infrastructure for Phase 2
-- Purpose: Create tables for automated deal discovery
-- Date: 2026-01-26
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- =====================================================
-- Table: discovered_links
-- Purpose: Track all URLs found by the Scout to prevent duplicates
-- =====================================================
CREATE TABLE IF NOT EXISTS discovered_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- URL information
  url TEXT NOT NULL,
  url_hash TEXT UNIQUE NOT NULL, -- MD5 hash of normalized URL for fast lookups
  source TEXT NOT NULL CHECK (source IN ('amazon_rss', 'flipkart_rss', 'myntra_scrape', 'manual', 'webhook')),
  
  -- Timestamps
  first_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_processed TIMESTAMP WITH TIME ZONE,
  
  -- Processing status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'posted', 'rejected', 'failed')),
  rejection_reason TEXT,
  
  -- Generated content (stored as JSON)
  generated_content JSONB,
  
  -- Monetization
  affiliate_url TEXT,
  subid TEXT, -- Tracking parameter for analytics
  
  -- Distribution tracking
  posted_to_channels TEXT[], -- Array of channel identifiers where this was posted
  
  -- Metadata
  product_data JSONB, -- Raw scraped data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_discovered_url_hash ON discovered_links(url_hash);
CREATE INDEX IF NOT EXISTS idx_discovered_status ON discovered_links(status);
CREATE INDEX IF NOT EXISTS idx_discovered_first_seen ON discovered_links(first_seen DESC);
CREATE INDEX IF NOT EXISTS idx_discovered_source ON discovered_links(source);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_discovered_links_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER discovered_links_updated_at_trigger
  BEFORE UPDATE ON discovered_links
  FOR EACH ROW
  EXECUTE FUNCTION update_discovered_links_updated_at();

-- =====================================================
-- Table: automation_logs
-- Purpose: Track execution of automation workflows
-- =====================================================
CREATE TABLE IF NOT EXISTS automation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Workflow identification
  workflow_name TEXT NOT NULL,
  workflow_id TEXT, -- n8n workflow execution ID
  
  -- Execution timing
  run_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  execution_time_ms INTEGER,
  
  -- Status
  status TEXT NOT NULL CHECK (status IN ('running', 'success', 'partial', 'failed')),
  
  -- Metrics
  deals_found INTEGER DEFAULT 0,
  deals_processed INTEGER DEFAULT 0,
  deals_posted INTEGER DEFAULT 0,
  deals_rejected INTEGER DEFAULT 0,
  
  -- Error tracking
  error_log JSONB,
  error_count INTEGER DEFAULT 0,
  
  -- Additional context
  metadata JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for monitoring queries
CREATE INDEX IF NOT EXISTS idx_automation_logs_workflow ON automation_logs(workflow_name);
CREATE INDEX IF NOT EXISTS idx_automation_logs_run_at ON automation_logs(run_at DESC);
CREATE INDEX IF NOT EXISTS idx_automation_logs_status ON automation_logs(status);

-- =====================================================
-- Table: automation_config
-- Purpose: Store configuration for automation workflows
-- =====================================================
CREATE TABLE IF NOT EXISTS automation_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- General settings
  is_enabled BOOLEAN DEFAULT false,
  
  -- Discovery settings
  discovery_interval_minutes INTEGER DEFAULT 30,
  discovery_sources TEXT[] DEFAULT ARRAY['amazon_rss', 'flipkart_rss'],
  max_deals_per_run INTEGER DEFAULT 5,
  
  -- Quality filters
  min_discount_percent INTEGER DEFAULT 10,
  require_in_stock BOOLEAN DEFAULT true,
  
  -- Distribution settings
  auto_post_to_telegram BOOLEAN DEFAULT true,
  auto_post_to_website BOOLEAN DEFAULT true,
  post_delay_seconds INTEGER DEFAULT 2, -- Delay between posts to avoid spam
  
  -- Alert settings
  alert_on_failure BOOLEAN DEFAULT true,
  alert_email TEXT,
  
  -- Advanced
  custom_filters JSONB, -- For future extensibility
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure one config per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_automation_config_user ON automation_config(user_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_automation_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER automation_config_updated_at_trigger
  BEFORE UPDATE ON automation_config
  FOR EACH ROW
  EXECUTE FUNCTION update_automation_config_updated_at();

-- =====================================================
-- Update existing deals table
-- =====================================================
DO $$
BEGIN
  -- Add automation tracking columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'deals' AND column_name = 'is_automated') THEN
    ALTER TABLE deals ADD COLUMN is_automated BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'deals' AND column_name = 'source_workflow') THEN
    ALTER TABLE deals ADD COLUMN source_workflow TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'deals' AND column_name = 'posted_channels') THEN
    ALTER TABLE deals ADD COLUMN posted_channels TEXT[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'deals' AND column_name = 'discovered_link_id') THEN
    ALTER TABLE deals ADD COLUMN discovered_link_id UUID REFERENCES discovered_links(id);
  END IF;
END $$;

-- Index for querying automated deals
CREATE INDEX IF NOT EXISTS idx_deals_automated ON deals(is_automated) WHERE is_automated = true;

-- =====================================================
-- RLS Policies
-- =====================================================

-- discovered_links: Users can only see their own or public automation results
ALTER TABLE discovered_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all discovered links"
  ON discovered_links FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage discovered links"
  ON discovered_links FOR ALL
  TO service_role
  USING (true);

-- automation_logs: Read-only for authenticated users
ALTER TABLE automation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view automation logs"
  ON automation_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage automation logs"
  ON automation_logs FOR ALL
  TO service_role
  USING (true);

-- automation_config: Users can only manage their own config
ALTER TABLE automation_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own automation config"
  ON automation_config FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own automation config"
  ON automation_config FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own automation config"
  ON automation_config FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- Helper Functions
-- =====================================================

-- Function to check if a URL was recently processed (prevents duplicates)
CREATE OR REPLACE FUNCTION is_url_recently_processed(
  url_to_check TEXT,
  hours_threshold INTEGER DEFAULT 24
)
RETURNS BOOLEAN AS $$
DECLARE
  url_normalized TEXT;
  hash_value TEXT;
  found_record RECORD;
BEGIN
  -- Normalize URL (remove query params, trailing slash, etc.)
  url_normalized := TRIM(BOTH '/' FROM REGEXP_REPLACE(url_to_check, '\?.*$', ''));
  
  -- Calculate hash
  hash_value := MD5(url_normalized);
  
  -- Check if exists in recent timeframe
  SELECT * INTO found_record
  FROM discovered_links
  WHERE url_hash = hash_value
    AND first_seen > NOW() - (hours_threshold || ' hours')::INTERVAL
    AND status IN ('posted', 'processing')
  LIMIT 1;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to log automation run
CREATE OR REPLACE FUNCTION log_automation_run(
  p_workflow_name TEXT,
  p_status TEXT,
  p_deals_found INTEGER DEFAULT 0,
  p_deals_processed INTEGER DEFAULT 0,
  p_deals_posted INTEGER DEFAULT 0,
  p_error_log JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO automation_logs (
    workflow_name,
    status,
    deals_found,
    deals_processed,
    deals_posted,
    error_log
  ) VALUES (
    p_workflow_name,
    p_status,
    p_deals_found,
    p_deals_processed,
    p_deals_posted,
    p_error_log
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Sample Data (for testing)
-- =====================================================
COMMENT ON TABLE discovered_links IS 'Tracks URLs discovered by automation to prevent duplicate processing';
COMMENT ON TABLE automation_logs IS 'Logs execution history of automation workflows';
COMMENT ON TABLE automation_config IS 'User-specific automation configuration';
