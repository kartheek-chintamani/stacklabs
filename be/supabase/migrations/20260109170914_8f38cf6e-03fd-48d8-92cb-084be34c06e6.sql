-- Create enum types for status and platform
CREATE TYPE public.link_status AS ENUM ('draft', 'scheduled', 'posted', 'expired', 'archived');
CREATE TYPE public.platform_type AS ENUM ('telegram', 'whatsapp', 'twitter', 'discord', 'email');
CREATE TYPE public.deal_category AS ENUM ('electronics', 'fashion', 'home', 'travel', 'food', 'gaming', 'beauty', 'other');

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create affiliate_links table
CREATE TABLE public.affiliate_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  original_url TEXT NOT NULL,
  affiliate_url TEXT NOT NULL,
  short_code TEXT UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  category deal_category DEFAULT 'other',
  commission_rate DECIMAL(5,2),
  status link_status DEFAULT 'draft' NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  click_count INTEGER DEFAULT 0,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create deals table for discovered deals
CREATE TABLE public.deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  external_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  original_url TEXT NOT NULL,
  affiliate_url TEXT,
  image_url TEXT,
  category deal_category DEFAULT 'other',
  commission_rate DECIMAL(5,2),
  original_price DECIMAL(10,2),
  discounted_price DECIMAL(10,2),
  discount_percent INTEGER,
  merchant_name TEXT,
  is_favorite BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create price_alerts table
CREATE TABLE public.price_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE,
  target_price DECIMAL(10,2) NOT NULL,
  current_price DECIMAL(10,2),
  is_triggered BOOLEAN DEFAULT false,
  auto_share BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create scheduled_posts table
CREATE TABLE public.scheduled_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  link_id UUID REFERENCES public.affiliate_links(id) ON DELETE CASCADE,
  platforms platform_type[] NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  posted_at TIMESTAMP WITH TIME ZONE,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT,
  status link_status DEFAULT 'scheduled' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create click_analytics table
CREATE TABLE public.click_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID REFERENCES public.affiliate_links(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  platform platform_type,
  country TEXT,
  city TEXT,
  device_type TEXT,
  browser TEXT,
  referrer TEXT,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create earnings table
CREATE TABLE public.earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  link_id UUID REFERENCES public.affiliate_links(id) ON DELETE SET NULL,
  network_name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  transaction_id TEXT,
  status TEXT DEFAULT 'pending',
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create platform_connections table
CREATE TABLE public.platform_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  platform platform_type NOT NULL,
  connection_name TEXT,
  credentials JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, platform, connection_name)
);

-- Create post_templates table
CREATE TABLE public.post_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  category deal_category,
  content TEXT NOT NULL,
  platforms platform_type[],
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create user settings table
CREATE TABLE public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  cuelinks_api_key TEXT,
  default_affiliate_code TEXT,
  notification_preferences JSONB DEFAULT '{"email": true, "push": true}'::jsonb,
  timezone TEXT DEFAULT 'Asia/Kolkata',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.click_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for affiliate_links
CREATE POLICY "Users can view their own links" ON public.affiliate_links FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own links" ON public.affiliate_links FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own links" ON public.affiliate_links FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own links" ON public.affiliate_links FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for deals
CREATE POLICY "Users can view their own deals" ON public.deals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own deals" ON public.deals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own deals" ON public.deals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own deals" ON public.deals FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for price_alerts
CREATE POLICY "Users can view their own alerts" ON public.price_alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own alerts" ON public.price_alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own alerts" ON public.price_alerts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own alerts" ON public.price_alerts FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for scheduled_posts
CREATE POLICY "Users can view their own posts" ON public.scheduled_posts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own posts" ON public.scheduled_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own posts" ON public.scheduled_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own posts" ON public.scheduled_posts FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for click_analytics
CREATE POLICY "Users can view their own analytics" ON public.click_analytics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create analytics for their links" ON public.click_analytics FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for earnings
CREATE POLICY "Users can view their own earnings" ON public.earnings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own earnings" ON public.earnings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own earnings" ON public.earnings FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for platform_connections
CREATE POLICY "Users can view their own connections" ON public.platform_connections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own connections" ON public.platform_connections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own connections" ON public.platform_connections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own connections" ON public.platform_connections FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for post_templates
CREATE POLICY "Users can view their own templates" ON public.post_templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own templates" ON public.post_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own templates" ON public.post_templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own templates" ON public.post_templates FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for user_settings
CREATE POLICY "Users can view their own settings" ON public.user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own settings" ON public.user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own settings" ON public.user_settings FOR UPDATE USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_affiliate_links_updated_at BEFORE UPDATE ON public.affiliate_links FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON public.deals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_price_alerts_updated_at BEFORE UPDATE ON public.price_alerts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_scheduled_posts_updated_at BEFORE UPDATE ON public.scheduled_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_platform_connections_updated_at BEFORE UPDATE ON public.platform_connections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_post_templates_updated_at BEFORE UPDATE ON public.post_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for performance
CREATE INDEX idx_affiliate_links_user_id ON public.affiliate_links(user_id);
CREATE INDEX idx_affiliate_links_status ON public.affiliate_links(status);
CREATE INDEX idx_affiliate_links_category ON public.affiliate_links(category);
CREATE INDEX idx_deals_user_id ON public.deals(user_id);
CREATE INDEX idx_deals_category ON public.deals(category);
CREATE INDEX idx_scheduled_posts_user_id ON public.scheduled_posts(user_id);
CREATE INDEX idx_scheduled_posts_scheduled_at ON public.scheduled_posts(scheduled_at);
CREATE INDEX idx_click_analytics_link_id ON public.click_analytics(link_id);
CREATE INDEX idx_click_analytics_clicked_at ON public.click_analytics(clicked_at);
CREATE INDEX idx_earnings_user_id ON public.earnings(user_id);
CREATE INDEX idx_earnings_earned_at ON public.earnings(earned_at);