const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function inspect() {
    // Load env
    const envPath = path.resolve(__dirname, '../.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const env = {};
    envContent.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) env[parts[0].trim()] = parts.slice(1).join('=').trim().replace(/"/g, '');
    });

    const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

    console.log('--- Fetching 1 Article with Topics ---');
    const { data: articles, error } = await supabase
        .from('articles')
        .select(`
            id, 
            title, 
            status,
            topic_id,
            content_topics (
                id,
                niche_category
            )
        `)
        .limit(1);

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Result:', JSON.stringify(articles, null, 2));
    }
}

inspect();
