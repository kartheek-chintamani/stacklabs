import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LogWorkflowRequest {
    workflow_name: string;
    workflow_id?: string;
    status: "running" | "success" | "partial" | "failed";
    deals_found?: number;
    deals_processed?: number;
    deals_posted?: number;
    deals_rejected?: number;
    error_log?: any;
    metadata?: any;
}

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const payload: LogWorkflowRequest = await req.json();

        if (!payload.workflow_name || !payload.status) {
            throw new Error("workflow_name and status are required");
        }

        // Connect to Supabase
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Calculate execution time if it's a completion status
        const executionData: any = {
            workflow_name: payload.workflow_name,
            workflow_id: payload.workflow_id,
            status: payload.status,
            deals_found: payload.deals_found || 0,
            deals_processed: payload.deals_processed || 0,
            deals_posted: payload.deals_posted || 0,
            deals_rejected: payload.deals_rejected || 0,
            error_log: payload.error_log ? JSON.stringify(payload.error_log) : null,
            metadata: payload.metadata ? JSON.stringify(payload.metadata) : null,
        };

        if (payload.status !== "running") {
            executionData.completed_at = new Date().toISOString();
        }

        // Insert log
        const { data, error } = await supabase
            .from("automation_logs")
            .insert(executionData)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return new Response(
            JSON.stringify({
                success: true,
                log_id: data.id,
                data: data,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("log-workflow error:", error);
        return new Response(
            JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
