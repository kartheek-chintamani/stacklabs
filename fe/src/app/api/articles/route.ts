// AI Generated Code by Deloitte + Cursor (BEGIN)
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

// GET /api/articles - Fetch articles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const supabase = createAdminClient();
    
    let query = supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: articles, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ articles: articles || [] });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
}

// POST /api/articles - Create a new article
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = createAdminClient();

    const { data: article, error } = await supabase
      .from('articles')
      .insert([{
        topic_id: body.topic_id,
        title: body.title,
        slug: body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        meta_description: body.meta_description,
        content: body.content,
        word_count: body.word_count || 0,
        reading_time_minutes: body.reading_time_minutes || Math.ceil((body.word_count || 0) / 200),
        generation_metadata: body.generation_metadata || {},
        quality_report: body.quality_report || {},
        status: 'pending_review',
        focus_keyword: body.focus_keyword,
        keywords: body.keywords || []
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ article }, { status: 201 });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Failed to create article' }, { status: 500 });
  }
}
// AI Generated Code by Deloitte + Cursor (END)
