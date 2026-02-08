import Link from 'next/link';
import { Tag } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase';

// Disable caching for fresh categories
export const revalidate = 0;

function slugify(text: string) {
  return text.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');
}

export default async function CategoriesPage() {
  const supabase = createAdminClient();

  // Fetch all articles with their categories
  const { data: articles } = await supabase
    .from('articles')
    .select('content_topics(niche_category)')
    .eq('status', 'published');

  // Extract unique categories
  const categoriesMap = new Map<string, number>();

  articles?.forEach((article: any) => {
    const category = article.content_topics?.niche_category;
    if (category) {
      categoriesMap.set(category, (categoriesMap.get(category) || 0) + 1);
    }
  });

  const categories = Array.from(categoriesMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count); // Sort by popularity

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Browse Topics
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Explore our collection of expert developer guides organized by topic.
        </p>
      </div>

      {categories.length > 0 ? (
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={`/categories/${slugify(category.name)}`}
              className="group block"
            >
              <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-center h-full flex flex-col items-center justify-center">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Tag className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {category.name}
                </h3>
                <span className="text-gray-500 text-sm font-medium bg-gray-100 px-3 py-1 rounded-full">
                  {category.count} {category.count === 1 ? 'Article' : 'Articles'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-xl">
          <p className="text-gray-500">No categories found.</p>
        </div>
      )}
    </div>
  );
}
