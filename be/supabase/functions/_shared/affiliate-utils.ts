
export interface AffiliateProgram {
    id: string;
    user_id: string;
    name: string;
    program_type: string;
    api_key?: string;
    api_secret?: string;
    affiliate_id?: string;
    tracking_param?: string;
    base_url?: string;
    commission_rate?: number;
    is_active: boolean;
    config: Record<string, any>;
}

export const convertToAffiliateLink = (
    originalUrl: string,
    programs: AffiliateProgram[]
): { affiliateUrl: string; program: AffiliateProgram | null } => {
    // Find the matching affiliate program
    let matchedProgram: AffiliateProgram | null = null;
    const urlLower = originalUrl.toLowerCase();

    if (urlLower.includes('amazon')) {
        matchedProgram = programs.find(p => p.program_type === 'amazon' && p.is_active) || null;
    } else if (urlLower.includes('flipkart')) {
        matchedProgram = programs.find(p => p.program_type === 'flipkart' && p.is_active) || null;
    } else if (urlLower.includes('myntra')) {
        matchedProgram = programs.find(p => p.program_type === 'myntra' && p.is_active) || null;
    } else if (urlLower.includes('ajio')) {
        matchedProgram = programs.find(p => p.program_type === 'ajio' && p.is_active) || null;
    } else if (urlLower.includes('meesho')) {
        matchedProgram = programs.find(p => p.program_type === 'meesho' && p.is_active) || null;
    } else if (urlLower.includes('nykaa')) {
        matchedProgram = programs.find(p => p.program_type === 'nykaa' && p.is_active) || null;
    } else if (urlLower.includes('tatacliq')) {
        matchedProgram = programs.find(p => p.program_type === 'tatacliq' && p.is_active) || null;
    }

    if (!matchedProgram || !matchedProgram.affiliate_id) {
        // If no matching program, try Cuelinks as fallback
        const cuelinks = programs.find(p => p.program_type === 'cuelinks' && p.is_active);
        if (cuelinks && cuelinks.api_key) {
            return {
                affiliateUrl: `https://linksredirect.com/?cid=${cuelinks.affiliate_id}&subid=${cuelinks.api_key}&url=${encodeURIComponent(originalUrl)}`,
                program: cuelinks,
            };
        }
        return { affiliateUrl: originalUrl, program: null };
    }

    try {
        const url = new URL(originalUrl);
        const trackingParam = matchedProgram.tracking_param || 'tag';
        url.searchParams.set(trackingParam, matchedProgram.affiliate_id);
        return { affiliateUrl: url.toString(), program: matchedProgram };
    } catch {
        return { affiliateUrl: originalUrl, program: null };
    }
};
