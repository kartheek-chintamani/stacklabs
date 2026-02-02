import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

// GET /api/social-posts - List pending/scheduled posts
export async function GET(request: NextRequest) {
    try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from('scheduled_posts')
            .select('*, articles(title, slug)')
            .order('scheduled_for', { ascending: true });

        if (error) throw error;
        return NextResponse.json({ posts: data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/social-posts - Create a new social post
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const supabase = createAdminClient();

        // Validate required fields
        if (!body.article_id || !body.platform || !body.post_content) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { data: post, error } = await supabase
            .from('scheduled_posts')
            .insert([{
                article_id: body.article_id,
                platform: body.platform, // 'twitter', 'linkedin', 'facebook', 'instagram'
                post_content: body.post_content,
                // Schedule for tomorrow 9am if not specified
                scheduled_for: body.scheduled_for || new Date(Date.now() + 86400000).toISOString(),
                status: 'scheduled'
            }])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ post }, { status: 201 });
    } catch (error: any) {
        console.error('Social Post Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
