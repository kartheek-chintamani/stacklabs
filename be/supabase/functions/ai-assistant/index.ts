import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AIRequest {
  type: 'generate_post' | 'suggest_times' | 'optimize_content' | 'analyze_deal' | 'suggest_tags';
  data: Record<string, any>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data } = await req.json() as AIRequest;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (type) {
      case 'generate_post':
        const isTelegram = data.platform?.toLowerCase() === 'telegram';
        systemPrompt = `You are an expert affiliate marketer who creates engaging, high-converting social media posts. Your posts are concise, use emojis effectively, and include clear calls-to-action. 
${isTelegram ? `IMPORTANT: Format the output using strictly Telegram-supported HTML tags ONLY.
- Use <b>text</b> for bold
- Use <i>text</i> for italic
- Use <s>text</s> for strikethrough (original prices)
- Use <a href="URL">text</a> for links
- Do NOT use Markdown (no **bold**, no [link](url)).
- Do NOT use unsupported tags like <h2>, <p>, <br> (use newlines instead).`
            : 'Format posts appropriately for the target platform. Keep posts under 280 characters for Twitter, and under 1000 characters for other platforms.'}`;

        userPrompt = `Generate an engaging post for the following deal:
Title: ${data.title}
Description: ${data.description || 'N/A'}
Original Price: ₹${data.originalPrice}
Discounted Price: ₹${data.discountedPrice}
Discount: ${data.discountPercent}%
Category: ${data.category}
Platform: ${data.platform}
Affiliate Link: ${data.affiliateLink}

${isTelegram ? `Create a high-converting Telegram post structure:
1. <b>HEADLINE</b> (Catchy & bold)
2. 🏷️ <b>Discount Info</b>: <s>₹${data.originalPrice}</s> → <b>₹${data.discountedPrice}</b> (${data.discountPercent}% OFF)
3. 📝 Short, punchy description (max 2 lines)
4. 👇 <b>Call to Action</b> with hidden link: <a href="${data.affiliateLink}">👉 GRAB DEAL NOW 👈</a>`
            : 'Generate a compelling post that highlights the value and creates urgency.'}`;
        break;

      case 'suggest_times':
        systemPrompt = `You are a social media analytics expert. Based on audience behavior patterns, suggest the best times to post for maximum engagement. Consider the Indian timezone (IST) as the primary audience.`;
        userPrompt = `Based on this engagement data, suggest the 4 best times to post:
Platform: ${data.platform}
Category: ${data.category}
Historical best performing days: ${data.bestDays?.join(', ') || 'Saturday, Sunday'}
Current followers timezone: Primarily IST (India)

Return a JSON array with 4 objects containing: time (in 12-hour format), engagement (High/Very High/Medium), reason (brief explanation).`;
        break;

      case 'optimize_content':
        systemPrompt = `You are a content optimization expert. Your job is to improve social media posts for better engagement and conversions. Maintain the core message while enhancing appeal.`;
        userPrompt = `Optimize this post for better engagement:
Original Post: ${data.content}
Platform: ${data.platform}
Target Audience: Deal seekers in India

Provide an optimized version that's more engaging while keeping the key information. Also suggest 3-5 relevant hashtags.`;
        break;

      case 'analyze_deal':
        systemPrompt = `You are a deal analysis expert. Evaluate deals based on their potential for affiliate success considering factors like discount value, product popularity, commission rate, and market demand.`;
        userPrompt = `Analyze this deal for affiliate potential:
Product: ${data.title}
Category: ${data.category}
Discount: ${data.discountPercent}%
Commission Rate: ${data.commissionRate}%
Merchant: ${data.merchant}

Provide:
1. Deal Score (1-10)
2. Earning Potential (Low/Medium/High)
3. Best platforms to share
4. Recommended posting time
5. Key selling points to highlight`;
        break;

      case 'suggest_tags':
        systemPrompt = `You are a hashtag and tagging expert for affiliate marketing content. Generate relevant, trending tags that improve discoverability.`;
        userPrompt = `Suggest relevant tags for this content:
Title: ${data.title}
Category: ${data.category}
Description: ${data.description || 'N/A'}

Return a JSON array of 5-8 relevant tags (without # symbol).`;
        break;

      default:
        throw new Error(`Unknown AI request type: ${type}`);
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content || "";

    return new Response(
      JSON.stringify({ result: content }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("AI function error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
