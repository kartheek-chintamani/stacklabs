import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { url, hours = 24 } = await req.json();

        if (!url) {
            throw new Error("URL is required");
        }

        // Normalize URL (remove query params, trailing slash)
        const normalizedUrl = url.replace(/\?.*$/, '').replace(/\/$/, '');

        // Calculate SHA-256 hash (MD5 not supported in Deno)
        const encoder = new TextEncoder();
        const data = encoder.encode(normalizedUrl);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const urlHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // Connect to Supabase
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Check if URL exists in recent timeframe
        const cutoffTime = new Date(Date.now() - (hours * 60 * 60 * 1000)).toISOString();

        const { data: existingRecord, error } = await supabase
            .from("discovered_links")
            .select("*")
            .eq("url_hash", urlHash)
            .gte("first_seen", cutoffTime)
            .in("status", ["posted", "processing"])
            .limit(1)
            .single();

        if (error && error.code !== "PGRST116") {
            // PGRST116 is "no rows returned" which is expected
            throw error;
        }

        const isDuplicate = !!existingRecord;

        return new Response(
            JSON.stringify({
                success: true,
                is_duplicate: isDuplicate,
                url_hash: urlHash,
                existing_record: isDuplicate ? {
                    id: existingRecord.id,
                    first_seen: existingRecord.first_seen,
                    status: existingRecord.status,
                } : null,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("check-duplicate error:", error);
        return new Response(
            JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
