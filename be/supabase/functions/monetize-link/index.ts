import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MonetizeLinkRequest {
    url: string;
    subid?: string;
}

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { url, subid } = await req.json() as MonetizeLinkRequest;

        if (!url) {
            throw new Error("URL is required");
        }

        // Check if Cuelinks is configured
        const cuelinksToken = Deno.env.get("CUELINKS_API_TOKEN");
        const cuelinksPublisherId = Deno.env.get("CUELINKS_PUBLISHER_ID");

        // If Cuelinks is configured, use it
        if (cuelinksToken && cuelinksPublisherId) {
            try {
                const cuelinksResponse = await fetch("https://api.cuelinks.com/api/v2/createShortLink", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${cuelinksToken}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        url: url,
                        subId: subid || `auto_${Date.now()}`,
                    }),
                });

                if (!cuelinksResponse.ok) {
                    throw new Error(`Cuelinks API error: ${cuelinksResponse.status}`);
                }

                const cuelinksData = await cuelinksResponse.json();

                return new Response(
                    JSON.stringify({
                        success: true,
                        affiliate_url: cuelinksData.shortUrl || cuelinksData.data?.shortUrl,
                        subid: subid || `auto_${Date.now()}`,
                        provider: "cuelinks",
                    }),
                    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
                );
            } catch (cuelinksError) {
                console.error("Cuelinks failed, falling back to direct tagging:", cuelinksError);
                // Fall through to fallback
            }
        }

        // Fallback: Direct affiliate tagging
        console.log("Using fallback monetization (direct tagging)");

        const urlObj = new URL(url);
        const hostname = urlObj.hostname.toLowerCase();

        let monetizedUrl = url;

        // Amazon India
        if (hostname.includes("amazon.in") || hostname.includes("amazon.co.in")) {
            const amazonTag = Deno.env.get("AMAZON_ASSOCIATE_TAG") || "linkgenie-21";
            urlObj.searchParams.set("tag", amazonTag);
            urlObj.searchParams.set("linkCode", "ur2");
            monetizedUrl = urlObj.toString();
        }
        // Flipkart
        else if (hostname.includes("flipkart.com")) {
            const flipkartAffId = Deno.env.get("FLIPKART_AFFILIATE_ID") || "linkgenie";
            urlObj.searchParams.set("affid", flipkartAffId);
            monetizedUrl = urlObj.toString();
        }
        // For other sites, just append a tracking param
        else {
            urlObj.searchParams.set("ref", "linkgenie");
            monetizedUrl = urlObj.toString();
        }

        // Append subid for tracking
        const finalUrl = new URL(monetizedUrl);
        if (subid) {
            finalUrl.searchParams.set("subid", subid);
        }

        return new Response(
            JSON.stringify({
                success: true,
                affiliate_url: finalUrl.toString(),
                subid: subid || null,
                provider: "direct_fallback",
                note: "Cuelinks not configured. Using direct affiliate tags.",
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("monetize-link error:", error);
        return new Response(
            JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
