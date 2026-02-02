import Link from 'next/link';
import { ArrowRight, Star, TrendingUp, Zap, Shield, Sparkles } from 'lucide-react';
import { MOCK_TOOLS } from '@/lib/mockData';
import { createAdminClient } from '@/lib/supabase';

// Fetch real articles from Supabase
async function getLatestArticles() {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(3);
    return data || [];
  } catch (e) {
    console.error('Failed to fetch articles', e);
    return [];
  }
}

export default async function Home() {
  const articles = await getLatestArticles();

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">AI-Powered Developer Tools</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Discover the Best AI Tools for Developers
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
              Expert reviews, in-depth comparisons, and practical guides to supercharge your development workflow with AI
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/articles"
                className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl text-lg"
              >
                Explore Articles
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/tools"
                className="inline-flex items-center justify-center gap-2 bg-blue-500/20 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-500/30 transition-all border-2 border-white/20 text-lg"
              >
                Browse Tools
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 max-w-4xl mx-auto">
            {[
              { value: '50+', label: 'Expert Reviews' },
              { value: '100K+', label: 'Monthly Readers' },
              { value: '4.8★', label: 'Avg Rating' },
              { value: '25+', label: 'AI Tools Covered' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-blue-200 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Articles - NOW DYNAMIC */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">
                Latest Articles
              </h2>
              <p className="text-gray-600">
                Expert insights on AI developer tools
              </p>
            </div>
            <Link
              href="/articles"
              className="hidden md:inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
            >
              View All Articles
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {articles.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article: any) => (
                <Link
                  key={article.id}
                  href={`/articles/${article.slug}`} // Corrected path
                  className="group"
                >
                  <article className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all h-full flex flex-col">
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
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                          {article.niche_category || 'AI Tool'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {article.reading_time_minutes ? `${article.reading_time_minutes} min read` : '5 min read'}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-1">
                        {article.meta_description || article.excerpt || ''}
                      </p>
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-2">
                          <img
                            src={article.author_avatar || "/avatars/ai-team.jpg"} // Fallback
                            alt="Author"
                            className="w-6 h-6 rounded-full"
                          />
                          <span className="text-sm text-gray-600">{article.author_name || 'AI Team'}</span>
                        </div>
                        {article.quality_report?.overall_score && (
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            {article.quality_report.overall_score / 20}
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-xl">
              <p className="text-gray-500 text-lg">No articles published yet. Check back soon!</p>
            </div>
          )}

          <div className="text-center mt-12 md:hidden">
            <Link
              href="/articles"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
            >
              View All Articles
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Tools (Static for now) */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Top AI Tools for Developers
            </h2>
            <p className="text-gray-600 text-xl">
              Curated selection of the best productivity tools
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_TOOLS.slice(0, 6).map((tool) => (
              <div
                key={tool.id}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all border border-gray-200 hover:border-blue-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{tool.logo}</div>
                  <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold">{tool.rating}</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {tool.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {tool.description}
                </p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {tool.category}
                  </span>
                  <span className="text-sm font-semibold text-blue-600">
                    {tool.pricing}
                  </span>
                </div>
                <a
                  href={tool.affiliateLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                >
                  Learn More
                </a>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              Explore All Tools
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
