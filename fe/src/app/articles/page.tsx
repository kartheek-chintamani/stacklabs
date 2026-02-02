import Link from 'next/link';
import { Clock, Eye, Star } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase';

// Fetch real articles from Supabase
async function getArticles() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('articles')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false });
  return data || [];
}

export default async function ArticlesPage() {
  const articles = await getArticles();
  const featuredArticle = articles.length > 0 ? articles[0] : null;
  const gridArticles = articles.length > 1 ? articles.slice(1) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Latest Articles
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl">
          Expert reviews, comparisons, and tutorials on the best AI productivity tools for developers.
        </p>
      </div>

      {/* Featured Article */}
      {featuredArticle && (
        <Link href={`/articles/${featuredArticle.slug}`} className="block mb-16 group">
          <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="relative h-64 md:h-auto bg-gray-100">
                {featuredArticle.generation_metadata?.cover_image ? (
                  <img
                    src={featuredArticle.generation_metadata.cover_image}
                    alt={featuredArticle.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                )}
                <div className="absolute top-4 left-4">
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    New
                  </span>
                </div>
              </div>
              <div className="p-8 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm font-medium text-blue-600">
                    {featuredArticle.niche_category || 'AI Tool'}
                  </span>
                  <span className="text-gray-300">•</span>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    {featuredArticle.reading_time_minutes ? `${featuredArticle.reading_time_minutes} min` : '5 min'}
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                  {featuredArticle.title}
                </h2>
                <p className="text-gray-600 mb-6 line-clamp-3">
                  {featuredArticle.meta_description || featuredArticle.excerpt}
                </p>
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    {featuredArticle.quality_report?.overall_score ? (featuredArticle.quality_report.overall_score / 20).toFixed(1) : '4.5'}
                  </div>
                  <div className="flex items-center gap-2">
                    <img src={featuredArticle.author_avatar || "/avatars/ai-team.jpg"} className="w-6 h-6 rounded-full" alt="author" />
                    <span>{featuredArticle.author_name || 'AI Team'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Articles Grid */}
      {gridArticles.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {gridArticles.map((article: any) => (
            <Link
              key={article.id}
              href={`/articles/${article.slug}`}
              className="group"
            >
              <article className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all h-full flex flex-col border border-gray-100">
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  {article.generation_metadata?.cover_image ? (
                    <img
                      src={article.generation_metadata.cover_image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-xs font-medium">
                      {article.niche_category || 'Article'}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-3 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    {article.reading_time_minutes ? `${article.reading_time_minutes} min` : '5 min'}
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {article.title}
                  </h3>

                  <p className="text-gray-600 mb-4 line-clamp-3 flex-1">
                    {article.meta_description || article.excerpt}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                      <img
                        src={article.author_avatar || "/avatars/ai-team.jpg"}
                        alt={article.author_name}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="text-sm text-gray-700 font-medium">
                        {article.author_name || 'AI Team'}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl">
          <p className="text-gray-500 text-lg">No articles published yet.</p>
        </div>
      ) : null}
    </div>
  );
}
