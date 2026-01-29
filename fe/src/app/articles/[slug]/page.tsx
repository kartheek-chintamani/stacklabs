// AI Generated Code by Deloitte + Cursor (BEGIN)
import Link from 'next/link';
import { Clock, Eye, Star, ArrowLeft, Share2 } from 'lucide-react';
import { MOCK_ARTICLES } from '@/lib/mockData';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';

export async function generateStaticParams() {
  return MOCK_ARTICLES.map((article) => ({
    slug: article.slug,
  }));
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = MOCK_ARTICLES.find(a => a.slug === slug);

  if (!article) {
    notFound();
  }

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
              {article.category}
            </span>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              {article.readTime}
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Eye className="w-4 h-4" />
              {article.views.toLocaleString()} views
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              {article.rating} rating
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {article.title}
          </h1>

          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            {article.excerpt}
          </p>

          {/* Author Info */}
          <div className="flex items-center justify-between pb-8 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <img 
                src={article.authorImage}
                alt={article.author}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <div className="font-semibold text-gray-900">{article.author}</div>
                <div className="text-sm text-gray-500">Published on {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>

        {/* Featured Image */}
        <div className="mb-12 rounded-2xl overflow-hidden">
          <img 
            src={article.featuredImage}
            alt={article.title}
            className="w-full h-auto"
          />
        </div>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none">
          <ReactMarkdown
            components={{
              h1: ({node, ...props}) => <h1 className="text-3xl font-bold mt-8 mb-4 text-gray-900" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-900" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-xl font-bold mt-6 mb-3 text-gray-900" {...props} />,
              p: ({node, ...props}) => <p className="mb-4 text-gray-700 leading-relaxed" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 space-y-2 text-gray-700" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-700" {...props} />,
              strong: ({node, ...props}) => <strong className="font-bold text-gray-900" {...props} />,
              code: ({node, ...props}) => <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800" {...props} />,
            }}
          >
            {article.content}
          </ReactMarkdown>
        </div>

        {/* Tags */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag, index) => (
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
      </article>

      {/* Related Articles */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">More Articles</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {MOCK_ARTICLES.filter(a => a.id !== article.id).slice(0, 3).map((relatedArticle) => (
              <Link 
                key={relatedArticle.id}
                href={`/articles/${relatedArticle.slug}`}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="relative h-48">
                  <img 
                    src={relatedArticle.featuredImage}
                    alt={relatedArticle.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                    {relatedArticle.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {relatedArticle.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
// AI Generated Code by Deloitte + Cursor (END)
