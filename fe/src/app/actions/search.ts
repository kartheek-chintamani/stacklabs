'use server';

import { createAdminClient } from '@/lib/supabase';
import { Article } from '@/components/ArticleCard';

export async function searchArticles(query: string): Promise<Article[]> {
    if (!query || query.trim().length === 0) {
        return [];
    }

    try {
        const supabase = createAdminClient();
        const { data } = await supabase
            .from('articles')
            .select(`
        *,
        content_topics (
          niche_category
        )
      `)
            .eq('status', 'published')
            .or(`title.ilike.%${query}%,meta_description.ilike.%${query}%,excerpt.ilike.%${query}%`)
            .order('created_at', { ascending: false })
            .limit(20);

        return (data || []) as unknown as Article[];
    } catch (error) {
        console.error('Search error:', error);
        return [];
    }
}
