// AI Generated Code by Deloitte + Cursor (BEGIN)
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

// GET /api/articles/[id] - Get a single article
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createAdminClient();
    const { id: articleId } = await params;

    const { data: article, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', articleId)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ article });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 });
  }
}

// PATCH /api/articles/[id] - Update article (approve/publish/edit)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const supabase = createAdminClient();
    const { id: articleId } = await params;

    const updateData: any = {
      ...body,
      updated_at: new Date().toISOString()
    };

    if (body.status === 'published' && !body.published_at) {
      updateData.published_at = new Date().toISOString();
    }

    const { data: article, error } = await supabase
      .from('articles')
      .update(updateData)
      .eq('id', articleId)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If published, trigger n8n workflow for post-publish actions
    if (body.status === 'published') {
      try {
        const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
        if (n8nWebhookUrl) {
          console.log('Triggering n8n article-published webhook:', `${n8nWebhookUrl}/article-published`);
          const webhookResponse = await fetch(`${n8nWebhookUrl}/article-published`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(article)
          });
          console.log('n8n webhook response:', webhookResponse.status);
        }
      } catch (webhookError) {
        console.error('n8n webhook error:', webhookError);
      }
    }

    return NextResponse.json({ article });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 });
  }
}

// DELETE /api/articles/[id] - Delete an article
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createAdminClient();
    const { id: articleId } = await params;

    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', articleId);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Article deleted successfully' });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 });
  }
}
// AI Generated Code by Deloitte + Cursor (END)
