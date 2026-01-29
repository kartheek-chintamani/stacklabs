-- Migration: Add Link Shortening, Analytics, Landing Pages, API/Webhooks
-- Date: 2026-01-26

-- ============================================================================
-- 1. SHORT LINKS TABLE
-- ============================================================================
CREATE TABLE public.short_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Link details
  short_code TEXT UNIQUE NOT NULL,
  original_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  
  -- Branding
  custom_domain TEXT,
  qr_code_url TEXT,
  
  -- Settings
  is_active BOOLEAN DEFAULT true,
  password TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Targeting
  geo_targeting JSONB, -- {allow: ['IN', 'US'], block: []}
  device_targeting JSONB, -- {mobile: url1, desktop: url2}
  
  -- Analytics
  click_count INTEGER DEFAULT 0,
  last_clicked_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  tags TEXT[],
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- ============================================================================
-- 2. ENHANCED CLICK EVENTS TABLE
-- ============================================================================
CREATE TABLE public.click_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Link reference
  short_link_id UUID REFERENCES public.short_links(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
  
  -- Event details
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  
  -- User info
  ip_address INET,
  user_agent TEXT,
  
  -- Location
  country TEXT,
  city TEXT,
  region TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Device info
  device_type TEXT, -- mobile, desktop, tablet
  browser TEXT,
  os TEXT,
  
  -- Referrer
  referrer TEXT,
  referrer_domain TEXT,
  
  -- Conversion tracking
  is_conversion BOOLEAN DEFAULT false,
  conversion_value DECIMAL(10, 2),
  conversion_currency TEXT DEFAULT 'INR',
  
  -- UTM parameters
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  
  -- Metadata
  metadata JSONB
);

-- ============================================================================
-- 3. CONVERSIONS TABLE
-- ============================================================================
CREATE TABLE public.conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- References
  click_event_id UUID REFERENCES public.click_events(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
  
  -- Conversion details
  converted_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  order_id TEXT,
  
  -- Financial
  revenue DECIMAL(10, 2) NOT NULL,
  commission DECIMAL(10, 2),
  commission_rate DECIMAL(5, 2),
  currency TEXT DEFAULT 'INR',
  
  -- Status
  status TEXT DEFAULT 'pending', -- pending, approved, rejected, paid
  
  -- Metadata
  product_name TEXT,
  category TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- ============================================================================
-- 4. LANDING PAGES TABLE
-- ============================================================================
CREATE TABLE public.landing_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Page details
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  
  -- Content
  content JSONB NOT NULL, -- Page builder JSON
  html_content TEXT, -- Rendered HTML
  css_content TEXT, -- Custom CSS
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[],
  og_image TEXT,
  
  -- Settings
  is_published BOOLEAN DEFAULT false,
  template TEXT DEFAULT 'blank',
  custom_domain TEXT,
  
  -- Analytics
  view_count INTEGER DEFAULT 0,
  conversion_count INTEGER DEFAULT 0,
  
  -- A/B Testing
  variant_of UUID REFERENCES public.landing_pages(id) ON DELETE SET NULL,
  
  -- Metadata
  tags TEXT[],
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- 5. API KEYS TABLE
-- ============================================================================
CREATE TABLE public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Key details
  name TEXT NOT NULL,
  key_hash TEXT UNIQUE NOT NULL, -- SHA-256 hash of the key
  key_prefix TEXT NOT NULL, -- First 8 chars for display
  
  -- Permissions
  scopes TEXT[] NOT NULL DEFAULT ARRAY['read'], -- read, write, admin
  
  -- Rate limiting
  rate_limit INTEGER DEFAULT 1000, -- requests per hour
  requests_count INTEGER DEFAULT 0,
  last_request_at TIMESTAMP WITH TIME ZONE,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  last_used_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- ============================================================================
-- 6. WEBHOOKS TABLE
-- ============================================================================
CREATE TABLE public.webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Webhook details
  url TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Events to listen for
  events TEXT[] NOT NULL, -- ['click.created', 'conversion.created', etc.]
  
  -- Authentication
  secret_key TEXT,
  headers JSONB, -- Custom headers to send
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Stats
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  last_success_at TIMESTAMP WITH TIME ZONE,
  last_failure_at TIMESTAMP WITH TIME ZONE,
  
  -- Retry settings
  retry_count INTEGER DEFAULT 3,
  retry_delay INTEGER DEFAULT 60, -- seconds
  
  -- Metadata
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- ============================================================================
-- 7. WEBHOOK LOGS TABLE
-- ============================================================================
CREATE TABLE public.webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID NOT NULL REFERENCES public.webhooks(id) ON DELETE CASCADE,
  
  -- Request details
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  
  -- Response
  status_code INTEGER,
  response_body TEXT,
  response_time_ms INTEGER,
  
  -- Status
  success BOOLEAN NOT NULL,
  error_message TEXT,
  
  -- Timing
  triggered_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  retry_attempt INTEGER DEFAULT 0
);

-- ============================================================================
-- 8. PRICE HISTORY TABLE  
-- ============================================================================
CREATE TABLE public.price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  
  -- Price data
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  currency TEXT DEFAULT 'INR',
  
  -- Availability
  in_stock BOOLEAN DEFAULT true,
  
  -- Timestamp
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- ============================================================================
-- 9. TELEGRAM BOTS TABLE
-- ============================================================================
CREATE TABLE public.telegram_bots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Bot details
  bot_token TEXT NOT NULL,
  bot_username TEXT NOT NULL,
  bot_name TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  
  -- Stats
  message_count INTEGER DEFAULT 0,
  subscriber_count INTEGER DEFAULT 0,
  
  -- Settings
  default_parse_mode TEXT DEFAULT 'HTML', -- HTML, Markdown, MarkdownV2
  disable_web_page_preview BOOLEAN DEFAULT false,
  
  -- Metadata
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- ============================================================================
-- 10. TELEGRAM MESSAGES TABLE
-- ============================================================================
CREATE TABLE public.telegram_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bot_id UUID REFERENCES public.telegram_bots(id) ON DELETE CASCADE,
  
  -- Message details
  chat_id TEXT NOT NULL,
  message_id TEXT,
  
  -- Content
  text TEXT,
  media_url TEXT,
  media_type TEXT, -- photo, video, document
  
  -- Formatting
  parse_mode TEXT DEFAULT 'HTML',
  reply_markup JSONB, -- Inline keyboard
  
  -- Status
  status TEXT DEFAULT 'pending', -- pending, sent, failed
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  
  -- Scheduling
  scheduled_for TIMESTAMP WITH TIME ZONE,
  
  -- Reference
  deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
  
  -- Metadata
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Short links
CREATE INDEX idx_short_links_user_id ON public.short_links(user_id);
CREATE INDEX idx_short_links_short_code ON public.short_links(short_code);
CREATE INDEX idx_short_links_created_at ON public.short_links(created_at DESC);

-- Click events
CREATE INDEX idx_click_events_user_id ON public.click_events(user_id);
CREATE INDEX idx_click_events_short_link_id ON public.click_events(short_link_id);
CREATE INDEX idx_click_events_deal_id ON public.click_events(deal_id);
CREATE INDEX idx_click_events_clicked_at ON public.click_events(clicked_at DESC);
CREATE INDEX idx_click_events_country ON public.click_events(country);

-- Conversions
CREATE INDEX idx_conversions_user_id ON public.conversions(user_id);
CREATE INDEX idx_conversions_deal_id ON public.conversions(deal_id);
CREATE INDEX idx_conversions_converted_at ON public.conversions(converted_at DESC);
CREATE INDEX idx_conversions_status ON public.conversions(status);

-- Landing pages
CREATE INDEX idx_landing_pages_user_id ON public.landing_pages(user_id);
CREATE INDEX idx_landing_pages_slug ON public.landing_pages(slug);
CREATE INDEX idx_landing_pages_is_published ON public.landing_pages(is_published);

-- API keys
CREATE INDEX idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX idx_api_keys_key_hash ON public.api_keys(key_hash);

-- Price history
CREATE INDEX idx_price_history_deal_id ON public.price_history(deal_id);
CREATE INDEX idx_price_history_recorded_at ON public.price_history(recorded_at DESC);

-- Telegram
CREATE INDEX idx_telegram_bots_user_id ON public.telegram_bots(user_id);
CREATE INDEX idx_telegram_messages_user_id ON public.telegram_messages(user_id);
CREATE INDEX idx_telegram_messages_bot_id ON public.telegram_messages(bot_id);
CREATE INDEX idx_telegram_messages_status ON public.telegram_messages(status);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE public.short_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.click_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_bots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_messages ENABLE ROW LEVEL SECURITY;

-- Short links policies
CREATE POLICY "Users can view their own short links" ON public.short_links FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own short links" ON public.short_links FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own short links" ON public.short_links FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own short links" ON public.short_links FOR DELETE USING (auth.uid() = user_id);

-- Click events policies
CREATE POLICY "Users can view their own click events" ON public.click_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create click events" ON public.click_events FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Conversions policies
CREATE POLICY "Users can view their own conversions" ON public.conversions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create conversions" ON public.conversions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own conversions" ON public.conversions FOR UPDATE USING (auth.uid() = user_id);

-- Landing pages policies
CREATE POLICY "Users can view their own landing pages" ON public.landing_pages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Public can view published landing pages" ON public.landing_pages FOR SELECT USING (is_published = true);
CREATE POLICY "Users can create their own landing pages" ON public.landing_pages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own landing pages" ON public.landing_pages FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own landing pages" ON public.landing_pages FOR DELETE USING (auth.uid() = user_id);

-- API keys policies
CREATE POLICY "Users can view their own API keys" ON public.api_keys FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own API keys" ON public.api_keys FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own API keys" ON public.api_keys FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own API keys" ON public.api_keys FOR DELETE USING (auth.uid() = user_id);

-- Webhooks policies
CREATE POLICY "Users can view their own webhooks" ON public.webhooks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own webhooks" ON public.webhooks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own webhooks" ON public.webhooks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own webhooks" ON public.webhooks FOR DELETE USING (auth.uid() = user_id);

-- Webhook logs policies
CREATE POLICY "Users can view logs for their webhooks" ON public.webhook_logs FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.webhooks WHERE webhooks.id = webhook_logs.webhook_id AND webhooks.user_id = auth.uid()));

-- Price history policies  
CREATE POLICY "Users can view price history for their deals" ON public.price_history FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.deals WHERE deals.id = price_history.deal_id AND deals.user_id = auth.uid()));

-- Telegram bots policies
CREATE POLICY "Users can view their own bots" ON public.telegram_bots FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own bots" ON public.telegram_bots FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own bots" ON public.telegram_bots FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own bots" ON public.telegram_bots FOR DELETE USING (auth.uid() = user_id);

-- Telegram messages policies
CREATE POLICY "Users can view their own messages" ON public.telegram_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own messages" ON public.telegram_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own messages" ON public.telegram_messages FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at timestamps
CREATE TRIGGER update_short_links_updated_at BEFORE UPDATE ON public.short_links FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_conversions_updated_at BEFORE UPDATE ON public.conversions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_landing_pages_updated_at BEFORE UPDATE ON public.landing_pages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON public.api_keys FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON public.webhooks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_telegram_bots_updated_at BEFORE UPDATE ON public.telegram_bots FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_telegram_messages_updated_at BEFORE UPDATE ON public.telegram_messages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
