// AI Generated Code by Deloitte + Cursor (BEGIN)
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

// PATCH /api/topics/[id] - Update topic status (approve/reject)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const supabase = createAdminClient();
    const { id: topicId } = await params;

    const updateData: any = {
      status: body.status,
      updated_at: new Date().toISOString()
    };

    if (body.status === 'approved') {
      updateData.approved_at = new Date().toISOString();
    }

    if (body.status === 'rejected' && body.rejected_reason) {
      updateData.rejected_reason = body.rejected_reason;
    }

    const { data: topic, error } = await supabase
      .from('content_topics')
      .update(updateData)
      .eq('id', topicId)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If approved, trigger n8n workflow for content generation
    if (body.status === 'approved') {
      try {
        const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
        if (n8nWebhookUrl) {
          console.log('Triggering n8n webhook:', `${n8nWebhookUrl}/topic-approved`);
          const webhookResponse = await fetch(`${n8nWebhookUrl}/topic-approved`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(topic)
          });
          console.log('n8n webhook response:', webhookResponse.status);
        }
      } catch (webhookError) {
        console.error('n8n webhook error:', webhookError);
      }
    }

    return NextResponse.json({ topic });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Failed to update topic' }, { status: 500 });
  }
}

// DELETE /api/topics/[id] - Delete a topic
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createAdminClient();
    const { id: topicId } = await params;

    const { error } = await supabase
      .from('content_topics')
      .delete()
      .eq('id', topicId);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Topic deleted successfully' });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Failed to delete topic' }, { status: 500 });
  }
}
// AI Generated Code by Deloitte + Cursor (END)
