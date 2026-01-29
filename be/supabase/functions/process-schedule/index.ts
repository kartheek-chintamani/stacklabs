
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ScheduledPost {
    id: string;
    content: string;
    platforms: string[];
    scheduled_at: string;
    status: string;
    link_id?: string;
    user_id: string;
}

// Helper to post to Telegram
async function postToTelegram(content: string, botToken: string, chatId: string) {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            text: content,
            parse_mode: 'Markdown'
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Telegram API Error: ${error}`);
    }

    return await response.json();
}

// Helper to post to Twitter (Stub)
async function postToTwitter(content: string) {
    // Real implementation requires OAuth 1.0a signatures or OAuth 2.0 flow
    // For this MVP, we will simulate success
    console.log("Posting to Twitter:", content);
    return { id: "mock_twitter_id_" + Date.now() };
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders })
    }

    try {
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 1. Get Scheduled Posts that are due
        const now = new Date().toISOString();
        const { data: posts, error: fetchError } = await supabase
            .from('scheduled_posts')
            .select('*, links(*)')
            .eq('status', 'scheduled')
            .lte('scheduled_at', now)

        if (fetchError) throw fetchError

        const results = []

        // 2. Process each post
        for (const post of (posts as any[]) || []) {
            console.log(`Processing post ${post.id}`)
            const errors = [];
            const platformResults = {};

            // Prepare Content
            let finalContent = post.content;
            // If there is a linked deal/link, append it if not present
            if (post.links && post.links.affiliate_url) {
                if (!finalContent.includes(post.links.affiliate_url)) {
                    finalContent += `\n\n${post.links.affiliate_url}`;
                }
            }

            // Check for Environment Variables
            const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
            const TELEGRAM_CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID');

            // Post to Platforms
            if (post.platforms.includes('telegram')) {
                if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
                    try {
                        await postToTelegram(finalContent, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID);
                        platformResults['telegram'] = 'success';
                    } catch (err) {
                        console.error('Telegram failed:', err);
                        errors.push(`Telegram: ${err.message}`);
                        platformResults['telegram'] = 'failed';
                    }
                } else {
                    errors.push('Telegram: Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID');
                }
            }

            if (post.platforms.includes('twitter')) {
                try {
                    await postToTwitter(finalContent);
                    platformResults['twitter'] = 'success';
                } catch (err) {
                    errors.push(`Twitter: ${err.message}`);
                    platformResults['twitter'] = 'failed';
                }
            }

            // Determine final status
            // If at least one platform succeeded, we verify it as published (or partial)
            // For simplicity, if any error, we might log it but still mark as published to avoid retry loop unless we implement retry counts.
            // Let's mark as 'published' but save errors in a log column if we had one.

            const newStatus = errors.length < post.platforms.length ? 'published' : 'failed';

            // Update DB
            const { error: updateError } = await supabase
                .from('scheduled_posts')
                .update({
                    status: newStatus,
                    updated_at: new Date().toISOString(),
                    // Store metadata/errors if we had a column. For now just console log.
                })
                .eq('id', post.id)

            if (updateError) {
                console.error(`Failed to update post ${post.id}:`, updateError)
                results.push({ id: post.id, status: 'db_update_failed', error: updateError })
            } else {
                results.push({ id: post.id, status: newStatus, errors })
            }
        }

        return new Response(
            JSON.stringify({ message: `Processed ${posts?.length} posts`, results }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
    }
})
