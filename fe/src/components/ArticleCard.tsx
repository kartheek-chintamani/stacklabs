'use client';

import Link from 'next/link';
import { Clock, Star } from 'lucide-react';


export interface Article {
    id: string;
    slug: string;
    title: string;
    excerpt?: string;
    meta_description?: string;
    reading_time_minutes?: number;
    author_name?: string;
    author_avatar?: string;
    created_at: string;
    generation_metadata?: {
        cover_image?: string;
    };
    content_topics?: {
        niche_category?: string;
    } | null;
    quality_report?: {
        overall_score?: number;
    };
}

export default function ArticleCard({ article, className = "" }: { article: Article, className?: string }) {
    const category = article.content_topics?.niche_category || 'Article';
    const score = article.quality_report?.overall_score ? (article.quality_report.overall_score / 20).toFixed(1) : '4.5';

    return (
        <Link href={`/articles/${article.slug}`} className={`group ${className}`}>
            <article className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all h-full flex flex-col border border-gray-100">
                <div className="relative h-48 overflow-hidden bg-gray-100">
                    {article.generation_metadata?.cover_image ? (
                        <img
                            src={article.generation_metadata.cover_image}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex'; }}
                        />
                    ) : null}

                    {/* Fallback Gradient if no image or error */}
                    <div className={`absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center ${article.generation_metadata?.cover_image ? 'hidden' : 'flex'}`}>
                        <div className="text-white/20">
                            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                        </div>
                    </div>
                    <div className="absolute top-4 left-4">
                        <span className="bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                            {category}
                        </span>
                    </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-3 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        {article.reading_time_minutes ? `${article.reading_time_minutes} min` : '5 min'}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
                        {article.title}
                    </h3>

                    <p className="text-gray-600 mb-4 line-clamp-3 flex-1 text-sm leading-relaxed">
                        {article.meta_description || article.excerpt}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                        <div className="flex items-center gap-3">
                            <img
                                src={article.author_avatar || "/avatars/ai-team.jpg"}
                                alt={article.author_name || "Author"}
                                className="w-8 h-8 rounded-full border border-gray-200"
                                onError={(e) => { (e.target as HTMLImageElement).src = "/avatars/ai-team.jpg" }}
                            />
                            <span className="text-sm text-gray-700 font-medium">
                                {article.author_name || 'AI Team'}
                            </span>
                        </div>
                        <div className="flex items-center gap-1 text-sm font-medium text-gray-900 bg-yellow-50 px-2 py-1 rounded-md border border-yellow-100">
                            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                            {score}
                        </div>
                    </div>
                </div>
            </article>
        </Link>
    );
}
