// AI Generated Code by Deloitte + Cursor (BEGIN)
import Link from 'next/link';
import { Clock, Eye, Star } from 'lucide-react';
import { MOCK_ARTICLES } from '@/lib/mockData';

export default function ArticlesPage() {
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
      {MOCK_ARTICLES.length > 0 && (
        <Link href={`/articles/${MOCK_ARTICLES[0].slug}`} className="block mb-16 group">
          <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="relative h-64 md:h-auto">
                <img 
                  src={MOCK_ARTICLES[0].featuredImage}
                  alt={MOCK_ARTICLES[0].title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Featured
                  </span>
                </div>
              </div>
              <div className="p-8 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm font-medium text-blue-600">
                    {MOCK_ARTICLES[0].category}
                  </span>
                  <span className="text-gray-300">•</span>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    {MOCK_ARTICLES[0].readTime}
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                  {MOCK_ARTICLES[0].title}
                </h2>
                <p className="text-gray-600 mb-6 line-clamp-3">
                  {MOCK_ARTICLES[0].excerpt}
                </p>
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {MOCK_ARTICLES[0].views.toLocaleString()} views
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    {MOCK_ARTICLES[0].rating}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Articles Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {MOCK_ARTICLES.slice(1).map((article) => (
          <Link 
            key={article.id} 
            href={`/articles/${article.slug}`}
            className="group"
          >
            <article className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all h-full flex flex-col">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={article.featuredImage}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-xs font-medium">
                    {article.category}
                  </span>
                </div>
              </div>
              
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-3 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  {article.readTime}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {article.title}
                </h3>
                
                <p className="text-gray-600 mb-4 line-clamp-3 flex-1">
                  {article.excerpt}
                </p>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <img 
                      src={article.authorImage}
                      alt={article.author}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="text-sm text-gray-700 font-medium">
                      {article.author}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    {article.rating}
                  </div>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>

      {/* Stats Section */}
      <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold mb-2">{MOCK_ARTICLES.length}+</div>
            <div className="text-blue-100">Expert Articles</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">50K+</div>
            <div className="text-blue-100">Monthly Readers</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">4.8★</div>
            <div className="text-blue-100">Average Rating</div>
          </div>
        </div>
      </div>
    </div>
  );
}
// AI Generated Code by Deloitte + Cursor (END)
