import Link from 'next/link';
import { Clock, Eye, Star, ArrowLeft, Share2 } from 'lucide-react';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { createAdminClient } from '@/lib/supabase';

// Generate params for static generation (optional, can be fully dynamic)
export async function generateStaticParams() {
  const supabase = createAdminClient();
  const { data: articles } = await supabase.from('articles').select('slug').eq('status', 'published');
  return (articles || []).map((article) => ({
    slug: article.slug,
  }));
}

async function getArticle(slug: string) {
  const supabase = createAdminClient();
  const { data: article } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .single(); // Removed status check to allow previewing drafts if needed, or strictly published?
  // Let's allow drafts but maybe show a warning? 
  // For now, simple fetch.
  return article;
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  // Map DB fields to UI
  const coverImage = article.generation_metadata?.cover_image;
  const authorName = article.author_name || 'AI Content Team';
  const authorAvatar = article.author_avatar || '/avatars/ai-team.jpg';
  const publishedDate = article.published_at || article.created_at;
  const rating = article.quality_report?.overall_score ? (article.quality_report.overall_score / 20).toFixed(1) : '4.5';
  const views = article.total_views || 0;
  const readTime = article.reading_time_minutes ? `${article.reading_time_minutes} min` : '5 min';
  const tags = article.tags || [];

  return (
    <div className="bg-white">
      {/* Back Button */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link href="/articles" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
          <ArrowLeft className="w-4 h-4" />
          Back to Articles
        </Link>
      </div>

      {/* Article Header */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-sm font-medium">
              {article.niche_category || 'Article'}
            </span>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              {readTime}
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Eye className="w-4 h-4" />
              {views.toLocaleString()} views
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              {rating} rating
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {article.title}
          </h1>

          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            {article.meta_description || article.excerpt}
          </p>

          {/* Author Info */}
          <div className="flex items-center justify-between pb-8 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <img
                src={authorAvatar}
                alt={authorName}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <div className="font-semibold text-gray-900">{authorName}</div>
                <div className="text-sm text-gray-500">Published on {new Date(publishedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>

        {/* Featured Image */}
        {coverImage && (
          <div className="mb-12 rounded-2xl overflow-hidden bg-gray-100">
            <img
              src={coverImage}
              alt={article.title}
              className="w-full h-auto"
            />
          </div>
        )}

        {/* Article Content */}
        <div className="prose prose-lg max-w-none">
          <ReactMarkdown
            components={{
              h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mt-8 mb-4 text-gray-900" {...props} />,
              h2: ({ node, ...props }) => <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-900" {...props} />,
              h3: ({ node, ...props }) => <h3 className="text-xl font-bold mt-6 mb-3 text-gray-900" {...props} />,
              p: ({ node, ...props }) => <p className="mb-4 text-gray-700 leading-relaxed" {...props} />,
              ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-4 space-y-2 text-gray-700" {...props} />,
              ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-700" {...props} />,
              strong: ({ node, ...props }) => <strong className="font-bold text-gray-900" {...props} />,
              code: ({ node, ...props }) => <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800" {...props} />,
            }}
          >
            {article.content}
          </ReactMarkdown>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag: string, index: number) => (
                <Link
                  key={index}
                  href={`/tags/${tag.toLowerCase().replace(/\s+/g, '-')}`}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
