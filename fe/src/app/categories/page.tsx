import Link from 'next/link';
import { Code, Zap, TestTube, GitBranch, Shield, Sparkles, Tag, Layers, Database, Cloud } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase';

// Helper to get category stats from DB
async function getCategories() {
  const supabase = createAdminClient();
  const { data: articles } = await supabase
    .from('articles')
    .select('title, content_topics(niche_category)')
    .eq('status', 'published');

  const categoriesMap: Record<string, any> = {};

  articles?.forEach((article: any) => {
    // Extract category safely
    const categoryName = article.content_topics?.niche_category || 'General';

    if (!categoriesMap[categoryName]) {
      categoriesMap[categoryName] = {
        name: categoryName,
        slug: categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        count: 0,
        examples: []
      };
    }

    categoriesMap[categoryName].count++;
    if (categoriesMap[categoryName].examples.length < 3) {
      categoriesMap[categoryName].examples.push(article.title);
    }
  });

  return Object.values(categoriesMap).sort((a: any, b: any) => b.count - a.count);
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  // Color/Icon Mapping Helpers
  const getColor = (name: string) => {
    const colors = ['blue', 'purple', 'green', 'orange', 'red', 'indigo', 'pink', 'cyan'];
    const index = name.length % colors.length;
    return colors[index];
  };

  const getIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('code') || lower.includes('dev')) return Code;
    if (lower.includes('test') || lower.includes('qa')) return TestTube;
    if (lower.includes('sec')) return Shield;
    if (lower.includes('auto')) return Zap;
    if (lower.includes('data')) return Database;
    if (lower.includes('cloud') || lower.includes('ops')) return Cloud;
    if (lower.includes('design')) return Layers;
    return Sparkles;
  };

  const colorClasses = {
    blue: { bg: 'from-blue-500 to-blue-600', light: 'bg-blue-50', text: 'text-blue-600', icon: 'bg-blue-100', border: 'hover:border-blue-300' },
    purple: { bg: 'from-purple-500 to-purple-600', light: 'bg-purple-50', text: 'text-purple-600', icon: 'bg-purple-100', border: 'hover:border-purple-300' },
    green: { bg: 'from-green-500 to-green-600', light: 'bg-green-50', text: 'text-green-600', icon: 'bg-green-100', border: 'hover:border-green-300' },
    orange: { bg: 'from-orange-500 to-orange-600', light: 'bg-orange-50', text: 'text-orange-600', icon: 'bg-orange-100', border: 'hover:border-orange-300' },
    red: { bg: 'from-red-500 to-red-600', light: 'bg-red-50', text: 'text-red-600', icon: 'bg-red-100', border: 'hover:border-red-300' },
    indigo: { bg: 'from-indigo-500 to-indigo-600', light: 'bg-indigo-50', text: 'text-indigo-600', icon: 'bg-indigo-100', border: 'hover:border-indigo-300' },
    pink: { bg: 'from-pink-500 to-pink-600', light: 'bg-pink-50', text: 'text-pink-600', icon: 'bg-pink-100', border: 'hover:border-pink-300' },
    cyan: { bg: 'from-cyan-500 to-cyan-600', light: 'bg-cyan-50', text: 'text-cyan-600', icon: 'bg-cyan-100', border: 'hover:border-cyan-300' },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Browse by Category
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Explore AI tools organized by functionality.
        </p>
      </div>

      {categories.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {categories.map((category: any) => {
            const Icon = getIcon(category.name);
            const colorKey = getColor(category.name);
            const colors = colorClasses[colorKey as keyof typeof colorClasses] || colorClasses.blue;

            return (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className="group"
              >
                <div className={`bg-white rounded-2xl p-8 border-2 border-gray-200 ${colors.border} hover:shadow-xl transition-all h-full flex flex-col`}>
                  <div className={`w-16 h-16 ${colors.icon} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-8 h-8 ${colors.text}`} />
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </h3>

                  <div className="mb-4">
                    <span className={`${colors.light} ${colors.text} px-4 py-2 rounded-full text-sm font-semibold`}>
                      {category.count} Articles
                    </span>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-gray-500 mb-2 uppercase">Recent:</div>
                    <div className="flex flex-col gap-1">
                      {category.examples.map((title: string, i: number) => (
                        <span key={i} className="text-sm text-gray-600 truncate">
                          • {title}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-xl">
          <p className="text-gray-500 text-lg">No categories found yet. Publish some articles!</p>
        </div>
      )}

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Can't Find What You're Looking For?</h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          We're constantly expanding our tool coverage. Have a specific category or tool you'd like us to review?
        </p>
        <Link href="/contact" className="inline-block bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-colors shadow-lg">
          Request a Review
        </Link>
      </div>
    </div>
  );
}
