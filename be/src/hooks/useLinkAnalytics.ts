import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface ClickAnalysis {
    total_clicks: number;
    unique_clicks: number;
    top_countries: { country: string; count: number }[];
    top_devices: { device_type: string; count: number }[];
    top_referrers: { referrer: string; count: number }[];
    clicks_over_time: { date: string; count: number }[];
}

export function useLinkAnalytics(linkId: string | null) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<ClickAnalysis | null>(null);

    useEffect(() => {
        if (linkId) {
            fetchAnalytics(linkId);
        }
    }, [linkId, user]);

    const fetchAnalytics = async (id: string) => {
        if (!user) return;
        setLoading(true);

        try {
            // Fetch raw click events
            const { data: events, error } = await supabase
                .from('click_events')
                .select('*')
                .eq('short_link_id', id);

            if (error) throw error;

            if (!events || events.length === 0) {
                setData({
                    total_clicks: 0,
                    unique_clicks: 0,
                    top_countries: [],
                    top_devices: [],
                    top_referrers: [],
                    clicks_over_time: []
                });
                return;
            }

            // Process data client-side for now (ideal: SQL aggregation or Edge Function)

            // Total Clicks
            const total_clicks = events.length;

            // Unique Clicks (by IP) - rudimentary
            const uniqueIPs = new Set(events.map(e => e.ip_address));
            const unique_clicks = uniqueIPs.size;

            // Top Countries
            const countryMap = events.reduce((acc, curr) => {
                const country = curr.country || 'Unknown';
                acc[country] = (acc[country] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            const top_countries = Object.entries(countryMap)
                .map(([country, count]) => ({ country, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);

            // Top Devices
            const deviceMap = events.reduce((acc, curr) => {
                const dev = curr.device_type || 'Unknown';
                acc[dev] = (acc[dev] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            const top_devices = Object.entries(deviceMap)
                .map(([device_type, count]) => ({ device_type, count }))
                .sort((a, b) => b.count - a.count);

            // Top Referrers
            const refMap = events.reduce((acc, curr) => {
                const ref = curr.referrer_domain || 'Direct / Unknown';
                acc[ref] = (acc[ref] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            const top_referrers = Object.entries(refMap)
                .map(([referrer, count]) => ({ referrer, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);

            // Clicks Over Time (Last 30 days) - group by date
            const dateMap: Record<string, number> = {};
            events.forEach(e => {
                const date = new Date(e.clicked_at).toISOString().split('T')[0];
                dateMap[date] = (dateMap[date] || 0) + 1;
            });

            const clicks_over_time = Object.entries(dateMap)
                .map(([date, count]) => ({ date, count }))
                .sort((a, b) => a.date.localeCompare(b.date));

            setData({
                total_clicks,
                unique_clicks,
                top_countries,
                top_devices,
                top_referrers,
                clicks_over_time
            });

        } catch (error) {
            console.error('Error fetching link analytics:', error);
            toast.error('Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    return { data, loading, refetch: () => linkId && fetchAnalytics(linkId) };
}
