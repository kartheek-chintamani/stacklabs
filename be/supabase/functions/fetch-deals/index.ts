
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { convertToAffiliateLink, AffiliateProgram } from '../_shared/affiliate-utils.ts'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

        // 1. Fetch user programs (Assuming single user or system-wide config for now)
        // In a multi-tenant app, we'd need to know AS WHO we are fetching.
        // For this automation, let's assume we are acting for a specific admin user or processing for all users? 
        // The prompt implies a single platform owner ("build A platform").
        // Let's pick the first user with programs or just fetching for all is risky. 
        // For MVP, we'll fetch programs for a specific user ID if passed, or just the first user found.
        // Ideally, this function receives a user_id or iterates through all active users with automation enabled.

        // For now, let's just cheat and fetch ALL affiliate programs and assume they belong to the admin.
        const { data: programsData, error: progError } = await supabase
            .from('affiliate_programs')
            .select('*')
            .eq('is_active', true)

        if (progError) throw progError
        const programs = programsData as AffiliateProgram[]

        // 2. Fetch Deals (Mock Data for now)
        console.log('Fetching deals from external sources...')
        const fetchedDeals = [
            {
                title: 'Apple iPhone 15 (128 GB) - Black',
                original_url: 'https://www.amazon.in/dp/B0CHX1W1XY',
                image_url: 'https://m.media-amazon.com/images/I/71d7rfSl0wL._SL1500_.jpg',
                category: 'electronics',
                original_price: 79900,
                discounted_price: 71290,
                discount_percent: 11,
                merchant_name: 'Amazon',
                description: 'Dynamic Island, A16 Bionic chip, 48MP Main Camera',
                expires_at: new Date(Date.now() + 86400000).toISOString() // Tomorrow
            },
            {
                title: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
                original_url: 'https://www.amazon.in/Sony-WH-1000XM5-Wireless-Cancelling-Headphones/dp/B09XS7JWHH',
                image_url: 'https://m.media-amazon.com/images/I/61+eCL1DoXL._SL1500_.jpg',
                category: 'electronics',
                original_price: 34990,
                discounted_price: 26990,
                discount_percent: 23,
                merchant_name: 'Amazon',
                description: 'Best noise cancellation, 30 hours battery life',
                expires_at: new Date(Date.now() + 86400000 * 2).toISOString()
            },
            {
                title: 'Levis Men Jeans',
                original_url: 'https://www.myntra.com/jeans/levis/levis-men-blue-512-slim-tapered-fit-light-fade-stretchable-jeans/123456/buy',
                image_url: 'https://assets.myntassets.com/h_1440,q_90,w_1080/v1/assets/images/130123456/2021/1/1/123.jpg',
                category: 'fashion',
                original_price: 3999,
                discounted_price: 1999,
                discount_percent: 50,
                merchant_name: 'Myntra',
                description: 'Stylish tapered fit jeans',
                expires_at: new Date(Date.now() + 86400000 * 3).toISOString()
            }
        ]

        const processedDeals = []

        // 3. Process and Insert
        for (const deal of fetchedDeals) {
            const { affiliateUrl, program } = convertToAffiliateLink(deal.original_url, programs)

            // Calculate Commission (Estimated)
            const commission_rate = program?.commission_rate || 0

            processedDeals.push({
                ...deal,
                affiliate_url: affiliateUrl,
                commission_rate,
                is_favorite: false,
                // user_id: ??? We need a user_id. 
                // We will grab the user_id from the program found, or default to the first program owner found.
                user_id: program?.user_id || programs[0]?.user_id
                // NOTE: If no programs exist, this will fail to have a user_id.
            })
        }

        // Filter out deals without user_id
        const validDeals = processedDeals.filter(d => d.user_id)

        if (validDeals.length > 0) {
            // Upsert by original_url to avoid duplicates
            const { error: insertError } = await supabase
                .from('deals')
                .upsert(validDeals, { onConflict: 'original_url' })

            if (insertError) {
                console.error("Error inserting deals:", insertError)
                throw insertError
            }
        }

        return new Response(
            JSON.stringify({ message: `Processed ${validDeals.length} deals`, deals: validDeals }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
    }
})
