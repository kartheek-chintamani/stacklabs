import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase';
import { ArrowLeft, Clock, Eye, Star } from 'lucide-react';

async function getCategoryArticles(slug: string) {
    const supabase = createAdminClient();
    const { data: articles } = await supabase
        .from('articles')
        .select('*, content_topics(niche_category)')
        .eq('status', 'published');

    if (!articles) return null;

    // Filter by slug matching
    const categoryArticles = articles.filter((article: any) => {
        const cat = article.content_topics?.niche_category || 'General';
        const catSlug = cat.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        return catSlug === slug;
    });

    if (categoryArticles.length === 0) return null;

    return {
        name: categoryArticles[0].content_topics?.niche_category || 'Category',
        articles: categoryArticles
    };
}

export default async function CategoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const data = await getCategoryArticles(slug);

    if (!data) {
        notFound();
        // Or return empty state? strictly notFound is better for invalid slugs.
        // But if valid slug has 0 articles, it shouldn't happen based on my logic (derived from articles).
    }

    const { name, articles } = data;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-8">
                <Link href="/categories" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-6">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Categories
                </Link>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    {name}
                </h1>
                <p className="text-xl text-gray-600">
                    {articles.length} {articles.length === 1 ? 'Article' : 'Articles'} in this category
                </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {articles.map((article: any) => (
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
                                        {name}
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
        </div>
    );
}
