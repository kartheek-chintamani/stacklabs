import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate random short code
function generateShortCode(length = 6): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            {
                global: {
                    headers: { Authorization: req.headers.get('Authorization')! },
                },
            }
        );

        // Get user
        const {
            data: { user },
        } = await supabaseClient.auth.getUser();

        if (!user) {
            throw new Error('Unauthorized');
        }

        const { action, ...body } = await req.json();

        // CREATE short link
        if (action === 'create') {
            const { original_url, custom_code, title, description, expires_at, password, device_targeting, geo_targeting } = body;

            // Generate short code
            let shortCode = custom_code;
            if (!shortCode) {
                let attempts = 0;
                while (attempts < 10) {
                    shortCode = generateShortCode(6);
                    const { data: existing } = await supabaseClient
                        .from('short_links')
                        .select('id')
                        .eq('short_code', shortCode)
                        .single();

                    if (!existing) break;
                    attempts++;
                }
            } else {
                // Check if custom code is available
                const { data: existing } = await supabaseClient
                    .from('short_links')
                    .select('id')
                    .eq('short_code', custom_code)
                    .single();

                if (existing) {
                    throw new Error('Custom short code already taken');
                }
            }

            // Create short link
            const { data, error } = await supabaseClient
                .from('short_links')
                .insert({
                    user_id: user.id,
                    short_code: shortCode,
                    original_url,
                    title: title || '',
                    description: description || '',
                    expires_at: expires_at || null,
                    password: password || null,
                    is_active: true,
                    device_targeting: device_targeting || null,
                    geo_targeting: geo_targeting || null,
                })
                .select()
                .single();

            if (error) throw error;

            return new Response(
                JSON.stringify({ success: true, data }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // UPDATE short link
        if (action === 'update') {
            const { id, ...updates } = body;

            const { data, error } = await supabaseClient
                .from('short_links')
                .update(updates)
                .eq('id', id)
                .eq('user_id', user.id)
                .select()
                .single();

            if (error) throw error;

            return new Response(
                JSON.stringify({ success: true, data }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // DELETE short link
        if (action === 'delete') {
            const { id } = body;

            const { error } = await supabaseClient
                .from('short_links')
                .delete()
                .eq('id', id)
                .eq('user_id', user.id);

            if (error) throw error;

            return new Response(
                JSON.stringify({ success: true }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // LIST short links
        if (action === 'list') {
            const { data, error } = await supabaseClient
                .from('short_links')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return new Response(
                JSON.stringify({ success: true, data }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        throw new Error('Invalid action');

    } catch (error: any) {
        console.error('Error:', error);
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
