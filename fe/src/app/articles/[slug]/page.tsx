import Link from 'next/link';
import { Clock, Eye, Star, ArrowLeft, Share2 } from 'lucide-react';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { createAdminClient } from '@/lib/supabase';
import ReadingProgress from '@/components/ui/ReadingProgress';
import ArticleCard, { Article } from '@/components/ArticleCard';

// Generate params for static generation
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
    .select('*, content_topics(niche_category)')
    .eq('slug', slug)
    .single();
  return article;
}

async function getRelatedArticles(category: string, currentSlug: string) {
  const supabase = createAdminClient();

  // 1. Try to find articles in the same category
  let { data } = await supabase
    .from('articles')
    .select(`
            *,
            content_topics!inner(niche_category)
        `)
    .eq('status', 'published')
    .neq('slug', currentSlug)
    .ilike('content_topics.niche_category', `%${category}%`) // Partial match
    .limit(3);

  // 2. Fallback: If less than 3, fetch latest articles to fill the gap
  if (!data || data.length < 3) {
    const { data: latest } = await supabase
      .from('articles')
      .select(`
                *,
                content_topics(niche_category)
            `)
      .eq('status', 'published')
      .neq('slug', currentSlug)
      .order('created_at', { ascending: false })
      .limit(3 - (data?.length || 0));

    if (latest) {
      // De-duplicate (though unlikely with small set)
      const existingIds = new Set(data?.map(a => a.id));
      const uniqueLatest = latest.filter(a => !existingIds.has(a.id));
      data = [...(data || []), ...uniqueLatest];
    }
  }

  return data || [];
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  const category = article.content_topics?.niche_category;
  const relatedArticles = category ? await getRelatedArticles(category, slug) : [];

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
      <ReadingProgress />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link href="/articles" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
          <ArrowLeft className="w-4 h-4" />
          Back to Articles
        </Link>
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Link href={`/categories/${category ? category.toLowerCase().replace(/ /g, '-') : 'all'}`}>
              <span className="bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors">
                {category || 'Article'}
              </span>
            </Link>
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

          <div className="flex items-center justify-between pb-8 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <img
                src={authorAvatar}
                alt={authorName}
                className="w-12 h-12 rounded-full border border-gray-200"
              />
              <div>
                <div className="font-semibold text-gray-900">{authorName}</div>
                <div className="text-sm text-gray-500">Published on {new Date(publishedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
              </div>
            </div>
          </div>
        </div>

        {coverImage && (
          <div className="mb-12 rounded-2xl overflow-hidden bg-gray-100 shadow-sm">
            <img
              src={coverImage}
              alt={article.title}
              className="w-full h-auto"
            />
          </div>
        )}

        <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 hover:prose-a:text-blue-700 prose-img:rounded-xl">
          <ReactMarkdown
            components={{
              h2: ({ node, ...props }) => <h2 className="text-3xl font-bold mt-12 mb-6 text-gray-900 border-b pb-2" {...props} />,
              h3: ({ node, ...props }) => <h3 className="text-2xl font-bold mt-8 mb-4 text-gray-900" {...props} />,
              p: ({ node, ...props }) => <p className="leading-8 mb-6" {...props} />,
              li: ({ node, ...props }) => <li className="mb-2" {...props} />,
              code: ({ node, ...props }) => <code className="bg-gray-100 text-pink-600 px-1.5 py-0.5 rounded text-sm font-mono" {...props} />,
              pre: ({ node, ...props }) => <pre className="bg-gray-900 text-gray-100 p-6 rounded-xl overflow-x-auto mb-8" {...props} />,
            }}
          >
            {article.content}
          </ReactMarkdown>
        </div>

        {tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider">Related Topics</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </article>

      {/* Related Articles Section */}
      {relatedArticles.length > 0 && (
        <div className="bg-gray-50 py-16 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Guides</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {relatedArticles.map((related: any) => (
                <ArticleCard key={related.id} article={related as Article} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
