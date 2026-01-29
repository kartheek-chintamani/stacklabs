import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { DOMParser } from 'https://deno.land/x/deno_dom/deno-dom-wasm.ts';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProductData {
    title: string;
    image: string;
    currentPrice: string;
    originalPrice: string;
    merchant: string;
    currency: string;
    inStock: boolean;
    asin?: string;
    productId?: string;
}

// Fetch HTML via proxy to avoid CORS/some blocking
async function fetchHtml(url: string): Promise<string> {
    // Rotate proxies or use a simple CORS proxy if direct fetch fails
    // For strict sites like Amazon, a specialized scraping API is best.
    // Here we try direct fetch first (might work on server-side), then proxy.

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5'
            }
        });
        if (response.ok) return await response.text();
    } catch (e) {
        console.log('Direct fetch failed, trying proxy...');
    }

    // Fallback to proxy
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    if (!response.ok) throw new Error('Failed to fetch page');
    return await response.text();
}

// Helper to extract JSON-LD structured data
function extractJsonLd(doc: any) {
    const scripts = doc.querySelectorAll('script[type="application/ld+json"]');
    for (const script of scripts) {
        try {
            const content = script.textContent;
            if (!content) continue;
            const json = JSON.parse(content);

            // Direct Product
            if (json['@type'] === 'Product') return json;

            // Array of items
            if (Array.isArray(json)) {
                const product = json.find((item: any) => item['@type'] === 'Product');
                if (product) return product;
            }

            // Graph structure
            if (json['@graph']) {
                const product = json['@graph'].find((item: any) => item['@type'] === 'Product');
                if (product) return product;
            }
        } catch (e) {
            // ignore
        }
    }
    return null;
}

async function scrapeAmazon(url: string, html: string): Promise<ProductData | null> {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    if (!doc) return null;

    let title = doc.querySelector('#productTitle')?.textContent.trim() || '';

    // JSON-LD Fallback/Primary
    const jsonLd = extractJsonLd(doc);
    if (jsonLd) {
        if (!title) title = jsonLd.name;
    }

    // Prices often hidden in different structures
    let currentPrice = doc.querySelector('.a-price .a-offscreen')?.textContent.trim() ||
        doc.querySelector('#priceblock_ourprice')?.textContent.trim() ||
        doc.querySelector('#priceblock_dealprice')?.textContent.trim() || '';

    // JSON-LD Price
    if ((!currentPrice || currentPrice === '') && jsonLd?.offers?.price) {
        currentPrice = jsonLd.offers.price;
    }

    // Clean price
    currentPrice = currentPrice.replace(/[^0-9.]/g, '');

    // Original Price
    let originalPrice = doc.querySelector('.a-text-price .a-offscreen')?.textContent.trim() || '';
    originalPrice = originalPrice.replace(/[^0-9.]/g, '');

    // Image
    let image = doc.querySelector('#landingImage')?.getAttribute('src') ||
        doc.querySelector('#imgBlkFront')?.getAttribute('src') || '';

    if (!image && jsonLd?.image) {
        image = Array.isArray(jsonLd.image) ? jsonLd.image[0] : jsonLd.image;
    }

    // ASIN
    const asinMatch = url.match(/\/dp\/([A-Z0-9]{10})/);
    const asin = asinMatch ? asinMatch[1] : '';

    return {
        title,
        image,
        currentPrice: currentPrice ? `₹${currentPrice}` : '₹0',
        originalPrice: originalPrice ? `₹${originalPrice}` : (currentPrice ? `₹${currentPrice}` : '₹0'),
        merchant: 'Amazon',
        currency: 'INR',
        inStock: !doc.textContent.includes('Currently unavailable'),
        asin
    };
}

async function scrapeFlipkart(url: string, html: string): Promise<ProductData | null> {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    if (!doc) return null;

    let title = doc.querySelector('.B_NuCI')?.textContent.trim() ||
        doc.querySelector('h1')?.textContent.trim() || '';

    const jsonLd = extractJsonLd(doc);
    if (jsonLd && !title) title = jsonLd.name;

    let currentPrice = doc.querySelector('._30jeq3')?.textContent.trim() || '';

    if (!currentPrice && jsonLd?.offers?.price) {
        currentPrice = jsonLd.offers.price;
    }

    currentPrice = currentPrice.replace(/[^0-9.]/g, '');

    let originalPrice = doc.querySelector('._3I9_wc')?.textContent.trim() || '';
    originalPrice = originalPrice.replace(/[^0-9.]/g, '');

    let image = doc.querySelector('._396cs4')?.getAttribute('src') || '';
    if (!image && jsonLd?.image) {
        image = Array.isArray(jsonLd.image) ? jsonLd.image[0] : jsonLd.image;
    }

    // PID
    const pidMatch = url.match(/pid=([A-Z0-9]+)/);
    const productId = pidMatch ? pidMatch[1] : '';

    return {
        title,
        image,
        currentPrice: currentPrice ? `₹${currentPrice}` : '₹0',
        originalPrice: originalPrice ? `₹${originalPrice}` : (currentPrice ? `₹${currentPrice}` : '₹0'),
        merchant: 'Flipkart',
        currency: 'INR',
        inStock: !html.includes('Sold Out'),
        productId
    };
}

async function scrapeMyntra(url: string, html: string): Promise<ProductData | null> {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    if (!doc) return null;

    // Myntra is heavily React/Script based. Data is often in a script tag.
    let title = doc.querySelector('.pdp-title')?.textContent.trim() || '';
    const name = doc.querySelector('.pdp-name')?.textContent.trim() || '';
    if (name) title = `${title} ${name}`;

    let currentPrice = doc.querySelector('.pdp-price')?.textContent.trim() || '';
    currentPrice = currentPrice.replace(/[^0-9.]/g, '');

    let originalPrice = doc.querySelector('.pdp-mrp')?.textContent.trim() || '';
    originalPrice = originalPrice.replace(/[^0-9.]/g, '');

    // Myntra images are usually in div background or api, but maybe meta tags work best
    // Fallback to meta tags which are reliable
    return null; // Let the meta fallback handle Myntra as it's hard to parse dynamic DOM
}

async function extractMeta(html: string): Promise<ProductData> {
    const doc = new DOMParser().parseFromString(html, 'text/html');

    const getMeta = (name: string) =>
        doc?.querySelector(`meta[property="${name}"]`)?.getAttribute('content') ||
        doc?.querySelector(`meta[name="${name}"]`)?.getAttribute('content') || '';

    const title = getMeta('og:title') || doc?.querySelector('title')?.textContent || 'Product';
    const image = getMeta('og:image') || '';
    const priceAmount = getMeta('product:price:amount') || '';
    const priceCurrency = getMeta('product:price:currency') || 'INR';

    return {
        title,
        image,
        currentPrice: priceAmount ? `₹${priceAmount}` : '₹0',
        originalPrice: priceAmount ? `₹${priceAmount}` : '₹0',
        merchant: 'Online Store',
        currency: priceCurrency,
        inStock: true
    };
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { url } = await req.json();
        if (!url) throw new Error('URL is required');

        console.log(`Scraping ${url}...`);
        const html = await fetchHtml(url);

        let data: ProductData | null = null;

        if (url.includes('amazon')) {
            data = await scrapeAmazon(url, html);
        } else if (url.includes('flipkart')) {
            data = await scrapeFlipkart(url, html);
        } else if (url.includes('myntra')) {
            // Myntra specific parsing if possible, else meta
            data = await scrapeMyntra(url, html);
        }

        if (!data || !data.title) {
            console.log('Falling back to Meta tags');
            const meta = await extractMeta(html);
            data = { ...meta, ...data }; // Merge
        }

        // Final cleanup
        if (data) {
            const urlObj = new URL(url);
            const host = urlObj.hostname.replace('www.', '').split('.')[0];
            data.merchant = host.charAt(0).toUpperCase() + host.slice(1);
        }

        return new Response(
            JSON.stringify({ success: true, data }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error: any) {
        console.error(error);
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
