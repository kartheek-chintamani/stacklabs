const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function fix() {
    // Load env
    const envPath = path.resolve(__dirname, '../.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const env = {};
    envContent.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) env[parts[0].trim()] = parts.slice(1).join('=').trim().replace(/"/g, '');
    });

    const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

    console.log('--- Fetching Topics ---');
    let { data: topics } = await supabase.from('content_topics').select('*');

    if (!topics || topics.length === 0) {
        console.log('No topics found. Creating defaults...');
        const defaults = [
            { niche_category: 'AI Tools', topic_name: 'AI Productivity', status: 'approved' },
            { niche_category: 'Web Development', topic_name: 'Next.js & React', status: 'approved' },
            { niche_category: 'DevOps', topic_name: 'CI/CD & Docker', status: 'approved' }
        ];
        const { data: newTopics } = await supabase.from('content_topics').insert(defaults).select();
        topics = newTopics;
    }

    console.log(`Found ${topics.length} topics.`);

    console.log('--- Fetching Orphaned Articles ---');
    const { data: articles } = await supabase
        .from('articles')
        .select('id, title, content')
        .is('topic_id', null);

    console.log(`Found ${articles?.length || 0} orphaned articles.`);

    if (articles && articles.length > 0) {
        for (const article of articles) {
            // Find best topic match
            let bestTopic = topics[0];
            const content = (article.title + ' ' + (article.content || '')).toLowerCase();

            if (content.includes('ai') || content.includes('gpt') || content.includes('model')) {
                bestTopic = topics.find(t => t.niche_category === 'AI Tools') || bestTopic;
            } else if (content.includes('react') || content.includes('web') || content.includes('css')) {
                bestTopic = topics.find(t => t.niche_category === 'Web Development') || bestTopic;
            } else if (content.includes('deploy') || content.includes('docker')) {
                bestTopic = topics.find(t => t.niche_category === 'DevOps') || bestTopic;
            }

            console.log(`Assigning article "${article.title}" to topic "${bestTopic.niche_category}"`);

            await supabase
                .from('articles')
                .update({ topic_id: bestTopic.id })
                .eq('id', article.id);
        }
        console.log('✅ Fixed all orphaned articles.');
    } else {
        console.log('✅ No articles need fixing.');
    }
}

fix();
