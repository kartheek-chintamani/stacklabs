import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { topicId } = await request.json();

    if (!topicId) {
      return NextResponse.json(
        { error: 'Topic ID is required' },
        { status: 400 }
      );
    }

    // Verify topic exists and is approved
    const supabase = createClient();
    const { data: topic, error: fetchError } = await supabase
      .from('content_topics')
      .select('*')
      .eq('id', topicId)
      .single();

    if (fetchError || !topic) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      );
    }

    // Trigger n8n webhook for WF3 (Content Generator)
    const n8nWebhookUrl = `${process.env.N8N_WEBHOOK_URL}/wf3-content-generator`;
    
    const webhookResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.N8N_API_KEY}`
      },
      body: JSON.stringify({
        topic_id: topic.id,
        topic_title: topic.topic_title,
        topic_description: topic.topic_description,
        niche_category: topic.niche_category,
        ai_analysis: topic.ai_analysis,
        approved_at: new Date().toISOString()
      })
    });

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.error('n8n webhook error:', errorText);
      return NextResponse.json(
        { error: 'Failed to trigger content generation workflow' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Content generation started',
      topic_id: topicId
    });

  } catch (error) {
    console.error('Error in approve API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
