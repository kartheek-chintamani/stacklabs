import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface AnalyticsStats {
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number;
  conversionRate: number;
  avgRevenuePerClick: number;
  uniqueDevices: number;
  uniqueCountries: number;
}

export interface ClicksByDate {
  date: string;
  clicks: number;
  conversions: number;
  revenue: number;
}

export interface ClicksByDevice {
  device_type: string;
  count: number;
}

export interface ClicksByCountry {
  country: string;
  count: number;
}

export interface ClicksByBrowser {
  browser: string;
  count: number;
}

export interface TopLink {
  short_code: string;
  title: string;
  clicks: number;
  conversions: number;
  revenue: number;
}

export function useAnalytics(dateRange: { start: Date; end: Date }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [clicksByDate, setClicksByDate] = useState<ClicksByDate[]>([]);
  const [clicksByDevice, setClicksByDevice] = useState<ClicksByDevice[]>([]);
  const [clicksByCountry, setClicksByCountry] = useState<ClicksByCountry[]>([]);
  const [clicksByBrowser, setClicksByBrowser] = useState<ClicksByBrowser[]>([]);
  const [topLinks, setTopLinks] = useState<TopLink[]>([]);

  const fetchAnalytics = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const startDate = dateRange.start.toISOString();
      const endDate = dateRange.end.toISOString();

      // Fetch overall stats
      const { data: clicks, error: clicksError } = await supabase
        .from('click_events')
        .select('*')
        .eq('user_id', user.id)
        .gte('clicked_at', startDate)
        .lte('clicked_at', endDate);

      if (clicksError) throw clicksError;

      const { data: conversions, error: conversionsError } = await supabase
        .from('conversions')
        .select('*')
        .eq('user_id', user.id)
        .gte('converted_at', startDate)
        .lte('converted_at', endDate);

      if (conversionsError) throw conversionsError;

      // Calculate stats
      const totalClicks = clicks?.length || 0;
      const totalConversions = conversions?.length || 0;
      const totalRevenue = conversions?.reduce((sum, c) => sum + (c.revenue || 0), 0) || 0;
      const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
      const avgRevenuePerClick = totalClicks > 0 ? totalRevenue / totalClicks : 0;

      const uniqueDevices = new Set(clicks?.map(c => c.device_type).filter(Boolean)).size;
      const uniqueCountries = new Set(clicks?.map(c => c.country).filter(Boolean)).size;

      setStats({
        totalClicks,
        totalConversions,
        totalRevenue,
        conversionRate,
        avgRevenuePerClick,
        uniqueDevices,
        uniqueCountries,
      });

      // Clicks by date
      const clicksByDateMap = new Map<string, { clicks: number; conversions: number; revenue: number }>();

      clicks?.forEach(click => {
        const date = new Date(click.clicked_at).toISOString().split('T')[0];
        const existing = clicksByDateMap.get(date) || { clicks: 0, conversions: 0, revenue: 0 };
        clicksByDateMap.set(date, { ...existing, clicks: existing.clicks + 1 });
      });

      conversions?.forEach(conv => {
        const date = new Date(conv.converted_at).toISOString().split('T')[0];
        const existing = clicksByDateMap.get(date) || { clicks: 0, conversions: 0, revenue: 0 };
        clicksByDateMap.set(date, {
          ...existing,
          conversions: existing.conversions + 1,
          revenue: existing.revenue + (conv.revenue || 0),
        });
      });

      const clicksByDateArray = Array.from(clicksByDateMap.entries())
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date));

      setClicksByDate(clicksByDateArray);

      // Clicks by device
      const deviceMap = new Map<string, number>();
      clicks?.forEach(click => {
        if (click.device_type) {
          deviceMap.set(click.device_type, (deviceMap.get(click.device_type) || 0) + 1);
        }
      });
      setClicksByDevice(
        Array.from(deviceMap.entries()).map(([device_type, count]) => ({ device_type, count }))
      );

      // Clicks by country
      const countryMap = new Map<string, number>();
      clicks?.forEach(click => {
        if (click.country) {
          countryMap.set(click.country, (countryMap.get(click.country) || 0) + 1);
        }
      });
      setClicksByCountry(
        Array.from(countryMap.entries())
          .map(([country, count]) => ({ country, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10) // Top 10 countries
      );

      // Clicks by browser
      const browserMap = new Map<string, number>();
      clicks?.forEach(click => {
        if (click.browser) {
          browserMap.set(click.browser, (browserMap.get(click.browser) || 0) + 1);
        }
      });
      setClicksByBrowser(
        Array.from(browserMap.entries()).map(([browser, count]) => ({ browser, count }))
      );

      // Top links
      const { data: links, error: linksError } = await supabase
        .from('short_links')
        .select('*')
        .eq('user_id', user.id)
        .order('click_count', { ascending: false })
        .limit(10);

      if (!linksError && links) {
        // Map conversions to short links
        const linkStats = new Map<string, { conversions: number; revenue: number }>();

        conversions?.forEach(conv => {
          const click = clicks?.find(c => c.id === conv.click_event_id);
          if (click && click.short_link_id) {
            const existing = linkStats.get(click.short_link_id) || { conversions: 0, revenue: 0 };
            linkStats.set(click.short_link_id, {
              conversions: existing.conversions + 1,
              revenue: existing.revenue + (conv.revenue || 0)
            });
          }
        });

        const topLinksData = links.map(link => {
          const stats = linkStats.get(link.id) || { conversions: 0, revenue: 0 };
          return {
            short_code: link.short_code,
            title: link.title || 'Untitled',
            clicks: link.click_count || 0,
            conversions: stats.conversions,
            revenue: stats.revenue,
          };
        });
        setTopLinks(topLinksData);
      }

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [user, dateRange.start, dateRange.end]);

  return {
    loading,
    stats,
    clicksByDate,
    clicksByDevice,
    clicksByCountry,
    clicksByBrowser,
    topLinks,
    refetch: fetchAnalytics,
  };
}
