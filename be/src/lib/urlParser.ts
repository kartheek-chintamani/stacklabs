export type Store = 'amazon' | 'flipkart' | 'myntra' | 'ajio' | 'other';

export const STORE_PATTERNS: Record<Store, RegExp> = {
    amazon: /(amazon\.|amzn\.)/i,
    flipkart: /(flipkart\.)/i,
    myntra: /(myntra\.)/i,
    ajio: /(ajio\.)/i,
    other: /.*/,
};

export const STORE_COLORS: Record<Store, string> = {
    amazon: '#FF9900',
    flipkart: '#2874F0',
    myntra: '#E11B55',
    ajio: '#2C4152',
    other: '#64748B', // muted slate
};

export function detectStore(url: string): Store {
    try {
        const urlObj = new URL(url);
        if (STORE_PATTERNS.amazon.test(urlObj.hostname)) return 'amazon';
        if (STORE_PATTERNS.flipkart.test(urlObj.hostname)) return 'flipkart';
        if (STORE_PATTERNS.myntra.test(urlObj.hostname)) return 'myntra';
        if (STORE_PATTERNS.ajio.test(urlObj.hostname)) return 'ajio';
        return 'other';
    } catch (e) {
        return 'other';
    }
}

export function cleanUrl(url: string): string {
    try {
        if (!url) return '';
        const urlObj = new URL(url);

        // Common affiliate parameters to strip
        const paramsToStrip = [
            'tag', 'linkCode', 'ref', 'ref_', 'pf_rd_r', 'pf_rd_p', 'pf_rd_m', 'pf_rd_s', 'pf_rd_t', 'pf_rd_i',
            'affid', 'affiliate', 'campaign', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
            'fbclid', 'gclid', 'ascsubtag'
        ];

        paramsToStrip.forEach(param => urlObj.searchParams.delete(param));

        // For Amazon, we often want to shorten the URL to /dp/ASIN
        if (STORE_PATTERNS.amazon.test(urlObj.hostname)) {
            const match = url.match(/\/dp\/([A-Z0-9]{10})/);
            if (match) {
                return `https://${urlObj.hostname}/dp/${match[1]}`;
            }
        }

        return urlObj.toString();
    } catch (e) {
        return url;
    }
}

export function generateAffiliateUrl(url: string, store: Store, affiliateId?: string): string {
    if (!affiliateId) return url;

    try {
        const clean = cleanUrl(url);
        const urlObj = new URL(clean);

        switch (store) {
            case 'amazon':
                urlObj.searchParams.set('tag', affiliateId);
                break;
            case 'flipkart':
                urlObj.searchParams.set('affid', affiliateId);
                break;
            // Add other stores as needed
        }

        return urlObj.toString();
    } catch (e) {
        return url;
    }
}
