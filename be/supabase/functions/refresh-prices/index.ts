import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        console.log('🔄 Starting price refresh job...');

        // Get all active deals that need price updates
        // (updated more than 1 hour ago or never updated)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

        const { data: deals, error: dealsError } = await supabaseClient
            .from('deals')
            .select('id, original_url, discounted_price, updated_at')
            .or(`updated_at.lt.${oneHourAgo},updated_at.is.null`)
            .limit(50); // Process 50 deals at a time

        if (dealsError) throw dealsError;

        console.log(`📊 Found ${deals?.length || 0} deals to update`);

        let successCount = 0;
        let errorCount = 0;

        for (const deal of deals || []) {
            try {
                // Scrape current product data
                const scrapeResponse = await fetch(
                    `${Deno.env.get('SUPABASE_URL')}/functions/v1/scrape-product`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
                        },
                        body: JSON.stringify({ url: deal.original_url }),
                    }
                );

                const scrapeResult = await scrapeResponse.json();

                if (scrapeResult.success && scrapeResult.data) {
                    const newPrice = parseFloat(scrapeResult.data.currentPrice.replace(/[^\d.]/g, ''));
                    const newOriginalPrice = parseFloat(scrapeResult.data.originalPrice.replace(/[^\d.]/g, ''));

                    // Add price history point
                    await supabaseClient
                        .from('price_history')
                        .insert({
                            deal_id: deal.id,
                            price: newPrice,
                            original_price: newOriginalPrice,
                            currency: 'INR',
                            in_stock: scrapeResult.data.inStock !== false,
                        });

                    // Update deal if price changed
                    if (newPrice !== deal.discounted_price) {
                        await supabaseClient
                            .from('deals')
                            .update({
                                discounted_price: newPrice,
                                original_price: newOriginalPrice,
                                updated_at: new Date().toISOString(),
                            })
                            .eq('id', deal.id);

                        console.log(`✅ Updated deal ${deal.id}: ₹${deal.discounted_price} → ₹${newPrice}`);
                    }

                    successCount++;
                } else {
                    errorCount++;
                }
            } catch (error) {
                console.error(`❌ Error updating deal ${deal.id}:`, error);
                errorCount++;
            }

            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        console.log(`✨ Price refresh complete: ${successCount} success, ${errorCount} errors`);

        return new Response(
            JSON.stringify({
                success: true,
                updated: successCount,
                errors: errorCount,
                total: deals?.length || 0
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error: any) {
        console.error('❌ Price refresh error:', error);
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
