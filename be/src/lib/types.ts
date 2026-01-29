// =================================================
// Database Types - Auto-generated from Supabase
// =================================================

export interface ContentTopic {
  id: string;
  topic_title: string;
  topic_description: string;
  niche_category: string;
  ai_analysis: {
    is_relevant: boolean;
    quality_score: number;
    reasoning: string;
    estimated_searches: number;
    competition_level: 'low' | 'medium' | 'high';
    content_angle: string;
    potential_keywords: string[];
    monetization_potential: number;
    affiliate_products: string[];
  };
  quality_score: number;
  estimated_monthly_searches: number;
  competition_level: 'low' | 'medium' | 'high';
  discovered_via: 'google_trends' | 'product_hunt' | 'reddit';
  source_url: string | null;
  status: 'pending_approval' | 'approved' | 'rejected' | 'in_progress' | 'published';
  approved_at: string | null;
  rejected_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: string;
  topic_id: string | null;
  title: string;
  slug: string;
  meta_description: string | null;
  content: string;
  word_count: number | null;
  reading_time_minutes: number | null;
  generation_metadata: {
    model_used: string;
    tokens_used: number;
    generation_time_seconds: number;
    competitor_sources: string[];
    outline: Record<string, unknown>;
    fallback_used: boolean;
  };
  quality_report: {
    overall_score: number;
    originality: number;
    depth: number;
    readability: number;
    seo_score: number;
    issues: string[];
    suggestions: string[];
  };
  status: 'pending_review' | 'approved' | 'needs_revision' | 'published' | 'archived';
  reviewer_notes: string | null;
  reviewed_at: string | null;
  focus_keyword: string | null;
  keywords: string[] | null;
  internal_links: Array<{ slug: string; anchor: string }>;
  schema_markup: Record<string, unknown> | null;
  published_at: string | null;
  updated_at_published: string | null;
  total_views: number;
  unique_visitors: number;
  avg_time_on_page: number | null;
  bounce_rate: number | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  price_amount: number | null;
  price_currency: string;
  is_free_tier: boolean;
  pricing_model: 'one-time' | 'monthly' | 'yearly' | 'freemium' | null;
  product_url: string;
  affiliate_link: string | null;
  affiliate_program: 'amazon' | 'shareasale' | 'impact' | 'direct' | null;
  image_url: string | null;
  logo_url: string | null;
  rating: number | null;
  review_count: number;
  total_clicks: number;
  total_conversions: number;
  total_earnings: number;
  is_active: boolean;
  last_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AffiliateClick {
  id: string;
  product_id: string;
  article_id: string | null;
  clicked_at: string;
  visitor_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  referrer: string | null;
  country_code: string | null;
  city: string | null;
  converted: boolean;
  conversion_date: string | null;
  commission_amount: number | null;
  created_at: string;
}

export interface Asset {
  id: string;
  article_id: string | null;
  filename: string;
  storage_path: string;
  public_url: string;
  asset_type: 'hero' | 'social_share' | 'thumbnail' | 'inline';
  mime_type: string;
  file_size_bytes: number | null;
  width: number | null;
  height: number | null;
  generation_metadata: {
    model: string;
    prompt: string;
    negative_prompt: string;
    generation_time: number;
    cost: number;
  };
  alt_text: string;
  caption: string | null;
  is_active: boolean;
  created_at: string;
}

export interface WorkflowLog {
  id: string;
  workflow_name: string;
  workflow_id: string | null;
  execution_id: string | null;
  topic_id: string | null;
  article_id: string | null;
  started_at: string;
  completed_at: string | null;
  duration_seconds: number | null;
  status: 'running' | 'success' | 'error' | 'timeout' | 'cancelled';
  error_message: string | null;
  error_node: string | null;
  tokens_used: number | null;
  api_calls_made: number | null;
  cost_usd: number | null;
  input_data: Record<string, unknown> | null;
  output_data: Record<string, unknown> | null;
  created_at: string;
}

export interface ScheduledPost {
  id: string;
  article_id: string;
  platform: 'twitter' | 'linkedin' | 'facebook' | 'instagram';
  post_content: string;
  media_urls: string[] | null;
  scheduled_for: string;
  published_at: string | null;
  status: 'scheduled' | 'published' | 'failed' | 'cancelled';
  platform_post_id: string | null;
  platform_url: string | null;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  clicks_count: number;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  auto_approve_topics: boolean;
  auto_approve_articles: boolean;
  quality_threshold: number;
  email_on_topic_ready: boolean;
  email_on_article_ready: boolean;
  email_on_publish_success: boolean;
  email_on_errors: boolean;
  notification_email: string;
  preferred_tone: string;
  preferred_length: 'short' | 'medium' | 'long';
  include_competitors: boolean;
  created_at: string;
  updated_at: string;
}

// =================================================
// API Response Types
// =================================================

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

export interface DashboardStats {
  pending_topics: number;
  pending_articles: number;
  published_articles: number;
  total_clicks: number;
  total_conversions: number;
  total_earnings: number;
  avg_quality_score: number;
}

export interface AffiliatePerformance {
  product_name: string;
  category: string;
  total_clicks: number;
  conversions: number;
  conversion_rate: number;
  total_earnings: number;
}

// =================================================
// Form Types
// =================================================

export interface TopicApprovalForm {
  topicId: string;
  action: 'approve' | 'reject';
  rejectionReason?: string;
}

export interface ArticleReviewForm {
  articleId: string;
  action: 'approve' | 'needs_revision';
  reviewerNotes?: string;
  updatedContent?: string;
}

// =================================================
// Workflow Types
// =================================================

export interface WorkflowTrigger {
  workflow_name: string;
  trigger_data: Record<string, unknown>;
  webhook_url: string;
}

export interface N8nWebhookPayload {
  topic_id?: string;
  article_id?: string;
  action: string;
  timestamp: string;
  [key: string]: unknown;
}
