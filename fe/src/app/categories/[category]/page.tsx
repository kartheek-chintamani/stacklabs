import { createAdminClient } from '@/lib/supabase';
import ArticleCard, { Article } from '@/components/ArticleCard';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const revalidate = 0;

function unslugify(slug: string) {
    return decodeURIComponent(slug)
        .replace(/-/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase()); // Title Case
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
    const { category } = await params;
    const title = unslugify(category);
    return {
        title: `${title} Articles | DevTools Nexus`,
        description: `Latest developer guides and tools about ${title}.`,
    };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
    const { category } = await params;
    const supabase = createAdminClient();
    const formattedCategory = decodeURIComponent(category).replace(/-/g, ' ');

    // Use ilike for partial/case-insensitive match on the joined column
    const { data: articles } = await supabase
        .from('articles')
        .select('*, content_topics!inner(niche_category)')
        .eq('status', 'published')
        .ilike('content_topics.niche_category', formattedCategory)
        .order('created_at', { ascending: false });

    const title = unslugify(category);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-8">
                <Link href="/categories" className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-6 transition-colors font-medium">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Categories
                </Link>

                <h1 className="text-4xl font-bold text-gray-900 mb-4 capitalize">
                    {title}
                </h1>
                <p className="text-xl text-gray-600">
                    {articles?.length || 0} {(articles?.length === 1) ? 'guide' : 'guides'} available in this topic.
                </p>
            </div>

            {articles && articles.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {articles.map((article: any) => (
                        <ArticleCard key={article.id} article={article as Article} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-24 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-gray-500 text-lg">No articles found in this category.</p>
                    <Link href="/articles" className="text-blue-600 font-medium mt-4 inline-block hover:underline">
                        Browse all articles
                    </Link>
                </div>
            )}
        </div>
    );
}
