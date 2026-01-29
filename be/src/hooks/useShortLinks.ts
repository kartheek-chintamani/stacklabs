import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface ShortLink {
    id: string;
    user_id: string;
    short_code: string;
    original_url: string;
    title: string;
    description: string;
    custom_domain: string | null;
    qr_code_url: string | null;
    is_active: boolean;
    password: string | null;
    expires_at: string | null;
    click_count: number;
    last_clicked_at: string | null;
    tags: string[] | null;
    created_at: string;
    updated_at: string;
    device_targeting: { mobile?: string; desktop?: string; tablet?: string; ios?: string; android?: string; other?: string } | null;
    geo_targeting: { allow?: string[]; block?: string[] } | null;
}

export function useShortLinks() {
    const { user } = useAuth();
    const [shortLinks, setShortLinks] = useState<ShortLink[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchShortLinks = async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('short_links')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setShortLinks((data as unknown as ShortLink[]) || []);
        } catch (error) {
            console.error('Error fetching short links:', error);
            toast.error('Failed to load short links');
        } finally {
            setLoading(false);
        }
    };

    const createShortLink = async (params: {
        original_url: string;
        custom_code?: string;
        title?: string;
        description?: string;
        expires_at?: string | null;
        password?: string | null;
        device_targeting?: { mobile?: string; desktop?: string; tablet?: string };
        geo_targeting?: { allow?: string[]; block?: string[] };
    }) => {
        if (!user) return null;

        try {
            const { data, error } = await supabase
                .from('short_links')
                .insert({
                    user_id: user.id,
                    short_code: params.custom_code || generateShortCode(),
                    original_url: params.original_url,
                    title: params.title || '',
                    description: params.description || '',
                    expires_at: params.expires_at || null,
                    password: params.password || null,
                    is_active: true,
                    device_targeting: params.device_targeting || null,
                    geo_targeting: params.geo_targeting || null,
                })
                .select()
                .single();

            if (error) throw error;

            setShortLinks((prev) => [(data as unknown as ShortLink), ...prev]);
            toast.success('Short link created!');
            return data;
        } catch (error: any) {
            console.error('Error creating short link:', error);
            toast.error(error.message || 'Failed to create short link');
            return null;
        }
    };

    const updateShortLink = async (id: string, updates: Partial<ShortLink>) => {
        try {
            const { data, error } = await supabase
                .from('short_links')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            setShortLinks((prev) => prev.map((link) => (link.id === id ? (data as unknown as ShortLink) : link)));
            toast.success('Short link updated!');
            return data;
        } catch (error) {
            console.error('Error updating short link:', error);
            toast.error('Failed to update short link');
            return null;
        }
    };

    const deleteShortLink = async (id: string) => {
        try {
            const { error } = await supabase
                .from('short_links')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setShortLinks((prev) => prev.filter((link) => link.id !== id));
            toast.success('Short link deleted');
            return true;
        } catch (error) {
            console.error('Error deleting short link:', error);
            toast.error('Failed to delete short link');
            return false;
        }
    };

    const toggleActive = async (id: string) => {
        const link = shortLinks.find((l) => l.id === id);
        if (!link) return;

        await updateShortLink(id, { is_active: !link.is_active });
    };

    const getShortUrl = (shortCode: string, customDomain?: string) => {
        if (customDomain) {
            return `https://${customDomain}/${shortCode}`;
        }
        // Using Supabase edge function URL
        const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID;
        return `https://${projectRef}.supabase.co/functions/v1/redirect/${shortCode}`;
    };

    const generateQRCode = async (shortCode: string) => {
        const shortUrl = getShortUrl(shortCode);
        // Using a free QR code API
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(shortUrl)}`;
        return qrUrl;
    };

    useEffect(() => {
        fetchShortLinks();
    }, [user]);

    return {
        shortLinks,
        loading,
        createShortLink,
        updateShortLink,
        deleteShortLink,
        toggleActive,
        getShortUrl,
        generateQRCode,
        refetch: fetchShortLinks,
    };
}

// Helper function to generate random short code
function generateShortCode(length = 6): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
