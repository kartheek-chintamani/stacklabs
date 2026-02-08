import Link from 'next/link';
import { Clock, Star, TrendingUp } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase';
import ArticleCard, { Article } from '@/components/ArticleCard';

// Fetch real articles and categories
async function getData() {
  const supabase = createAdminClient();
  const { data: articles } = await supabase
    .from('articles')
    .select('*, content_topics(niche_category)')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  // Extract unique categories for filter
  const categories = Array.from(new Set(articles?.map((a: any) => a.content_topics?.niche_category).filter(Boolean)));

  return {
    articles: (articles || []) as unknown as Article[],
    categories: categories as string[]
  };
}

function slugify(text: string) {
  return text.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');
}

// Disable caching
export const revalidate = 0;

export default async function ArticlesPage() {
  const { articles, categories } = await getData();
  const featuredArticle = articles.length > 0 ? articles[0] : null;
  const gridArticles = articles.length > 1 ? articles.slice(1) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Latest Articles
        </h1>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Link
            href="/articles"
            className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium transition-colors"
          >
            All
          </Link>
          {categories.slice(0, 10).map((cat) => (
            <Link
              key={cat}
              href={`/categories/${slugify(cat)}`}
              className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-blue-600 rounded-full text-sm font-medium transition-colors"
            >
              {cat}
            </Link>
          ))}
          <Link href="/categories" className="px-4 py-2 text-gray-500 hover:text-blue-600 text-sm font-medium">
            More...
          </Link>
        </div>
      </div>

      {/* Featured Article */}
      {featuredArticle && (
        <Link href={`/articles/${featuredArticle.slug}`} className="block mb-16 group">
          <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-gray-100 flex flex-col md:flex-row">
            <div className="relative md:w-2/3 h-64 md:h-auto overflow-hidden">
              {featuredArticle.generation_metadata?.cover_image ? (
                <img
                  src={featuredArticle.generation_metadata.cover_image}
                  alt={featuredArticle.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">No Image</div>
              )}
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                  Featured
                </span>
                <span className="bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                  {featuredArticle.content_topics?.niche_category || 'Article'}
                </span>
              </div>
            </div>

            <div className="p-8 md:p-10 md:w-1/3 flex flex-col justify-center bg-gradient-to-br from-white to-gray-50">
              <div className="flex items-center gap-3 mb-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {featuredArticle.reading_time_minutes ? `${featuredArticle.reading_time_minutes} min read` : '5 min read'}
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  Trending
                </div>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors leading-tight">
                {featuredArticle.title}
              </h2>

              <p className="text-gray-600 mb-6 line-clamp-4 leading-relaxed">
                {featuredArticle.meta_description || featuredArticle.excerpt}
              </p>

              <div className="mt-auto flex items-center gap-3 pt-6 border-t border-gray-100">
                <img
                  src={featuredArticle.author_avatar || "/avatars/ai-team.jpg"}
                  className="w-10 h-10 rounded-full border border-gray-200"
                  alt="author"
                />
                <div>
                  <div className="text-sm font-semibold text-gray-900">{featuredArticle.author_name || 'AI Team'}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(featuredArticle.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded text-sm font-medium text-gray-900 border border-yellow-100">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  {featuredArticle.quality_report?.overall_score ? (featuredArticle.quality_report.overall_score / 20).toFixed(1) : '4.5'}
                </div>
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Articles Grid */}
      {gridArticles.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {gridArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <p className="text-gray-500 text-lg">No articles published yet.</p>
        </div>
      ) : null}
    </div>
  );
}
