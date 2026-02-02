'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Article {
    id: string;
    title: string;
    slug: string;
    status: string;
    created_at: string;
    generation_metadata?: {
        cover_image?: string;
    };
    quality_report?: {
        overall_score?: number;
    };
}

export default function ArticlesAdminPage() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'pending' | 'published'>('pending');

    const fetchArticles = async () => {
        setLoading(true);
        try {
            const statusParam = activeTab === 'pending' ? 'pending_review' : 'published';
            const res = await fetch(`/api/articles?status=${statusParam}`);
            const data = await res.json();
            if (data.articles) {
                setArticles(data.articles);
            }
        } catch (error) {
            console.error('Failed to load articles', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArticles();
    }, [activeTab]);

    const handlePublish = async (id: string) => {
        if (!confirm('Are you sure you want to publish this article? This will trigger social media distribution.')) return;

        try {
            const res = await fetch('/api/articles', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: 'published' })
            });

            if (res.ok) {
                // Trigger social media workflow manually via webhook if needed, 
                // OR rely on the DB trigger/webhook if configured. 
                // Our Workflow #3 listens to 'article-published' webhook. 
                // We might need to manually call that webhook here if the APP doesn't do it automatically upon DB update.
                // For now, let's assume we just update status.

                // BETTER: Invoke the webhook directly to be sure.
                fetch('http://localhost:5678/webhook/article-published', {
                    method: 'POST',
                    body: JSON.stringify({ body: { id } }) // workflow creates nested body usually?
                }).catch(e => console.warn('Webhook trigger failed', e));

                alert('Article Published!');
                fetchArticles();
            } else {
                alert('Failed to publish');
            }
        } catch (e) {
            alert('Error publishing');
        }
    };

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                        Content Studio
                    </h1>
                    <p className="text-gray-500 mt-1">Manage and publish AI-generated articles</p>
                </div>
                <Link
                    href="/admin/topics"
                    className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors font-medium border border-indigo-200"
                >
                    ← Back to Topics
                </Link>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'pending'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Drafts (Review)
                </button>
                <button
                    onClick={() => setActiveTab('published')}
                    className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'published'
                            ? 'bg-white text-green-700 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Published
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {articles.length === 0 ? (
                        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                            <p className="text-gray-500">No articles found in this section.</p>
                        </div>
                    ) : (
                        articles.map((article) => (
                            <div
                                key={article.id}
                                className="group bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all flex items-start gap-5"
                            >
                                {/* Thumbnail */}
                                <div className="w-32 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                                    {article.generation_metadata?.cover_image ? (
                                        <img
                                            src={article.generation_metadata.cover_image}
                                            alt={article.title}
                                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <span className="text-xs">No Image</span>
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 leading-tight group-hover:text-indigo-600 transition-colors">
                                        {article.title}
                                    </h3>
                                    <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${article.quality_report?.overall_score && article.quality_report.overall_score > 80
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            Score: {article.quality_report?.overall_score || 'N/A'}
                                        </span>
                                        <span>•</span>
                                        <span>{new Date(article.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-3">
                                    <a
                                        href={`/articles/${article.slug}`}
                                        target="_blank"
                                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                                    >
                                        Preview
                                    </a>
                                    {article.status === 'pending_review' && (
                                        <button
                                            onClick={() => handlePublish(article.id)}
                                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-200 transition-all hover:-translate-y-0.5"
                                        >
                                            Publish Now
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
