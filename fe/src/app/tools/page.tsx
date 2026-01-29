// AI Generated Code by Deloitte + Cursor (BEGIN)
import { Star, ExternalLink } from 'lucide-react';
import { MOCK_TOOLS } from '@/lib/mockData';

export default function ToolsPage() {
  const categories = Array.from(new Set(MOCK_TOOLS.map(tool => tool.category)));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          AI Tools for Developers
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl">
          Curated collection of the best AI-powered tools to supercharge your development workflow. All tools are tested and reviewed by our experts.
        </p>
      </div>

      {/* Category Filters */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-3">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors">
            All Tools
          </button>
          {categories.map((category, index) => (
            <button 
              key={index}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-colors"
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {MOCK_TOOLS.map((tool) => (
          <div 
            key={tool.id}
            className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all border border-gray-200 hover:border-blue-300 flex flex-col"
          >
            <div className="p-6 flex-1">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="text-5xl">{tool.logo}</div>
                <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-semibold text-gray-900">{tool.rating}</span>
                  <span className="text-xs text-gray-500">({tool.reviews.toLocaleString()})</span>
                </div>
              </div>

              {/* Tool Info */}
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {tool.name}
              </h3>
              <p className="text-gray-600 mb-4">
                {tool.description}
              </p>

              {/* Category and Pricing */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  {tool.category}
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {tool.pricing}
                </span>
              </div>

              {/* Features */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase">Key Features</h4>
                <div className="space-y-2">
                  {tool.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="p-6 bg-gray-50 border-t border-gray-100">
              <a
                href={tool.affiliateLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Visit Website
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Info Section */}
      <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-blue-100 mb-6">
            We're constantly adding new AI tools to our collection. Have a suggestion? Let us know!
          </p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors font-semibold">
            Suggest a Tool
          </button>
        </div>
      </div>

      {/* Affiliate Disclaimer */}
      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
        <p className="text-sm text-gray-700 text-center">
          <strong>Transparency Notice:</strong> Some links on this page are affiliate links. We may earn a commission when you make a purchase through these links, at no additional cost to you. This helps us continue providing quality content and reviews.
        </p>
      </div>
    </div>
  );
}
// AI Generated Code by Deloitte + Cursor (END)
