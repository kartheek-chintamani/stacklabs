// AI Generated Code by Deloitte + Cursor (BEGIN)
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

// GET /api/topics - Fetch all pending topics
export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    
    const { data: topics, error } = await supabase
      .from('content_topics')
      .select('*')
      .eq('status', 'pending_approval')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ topics: topics || [] });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Failed to fetch topics' }, { status: 500 });
  }
}

// POST /api/topics - Create a new topic
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = createAdminClient();

    const { data: topic, error } = await supabase
      .from('content_topics')
      .insert([{
        topic_title: body.topic_title,
        topic_description: body.topic_description,
        niche_category: body.niche_category || 'AI productivity tools for developers',
        ai_analysis: body.ai_analysis || {},
        quality_score: body.quality_score || 0,
        estimated_monthly_searches: body.estimated_monthly_searches || 0,
        competition_level: body.competition_level || 'medium',
        discovered_via: body.discovered_via || 'manual',
        source_url: body.source_url || null,
        status: 'pending_approval'
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ topic }, { status: 201 });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Failed to create topic' }, { status: 500 });
  }
}
// AI Generated Code by Deloitte + Cursor (END)
