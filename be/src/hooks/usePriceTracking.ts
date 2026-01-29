import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface PriceHistory {
    id: string;
    deal_id: string;
    price: number;
    original_price: number;
    currency: string;
    in_stock: boolean;
    recorded_at: string;
}

export function usePriceTracking(dealId?: string) {
    const { user } = useAuth();
    const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
    const [loading, setLoading] = useState(false);
    const [lowestPrice, setLowestPrice] = useState<number | null>(null);
    const [highestPrice, setHighestPrice] = useState<number | null>(null);
    const [currentPrice, setCurrentPrice] = useState<number | null>(null);

    const fetchPriceHistory = async () => {
        if (!dealId) return;

        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('price_history')
                .select('*')
                .eq('deal_id', dealId)
                .order('recorded_at', { ascending: false });

            if (error) throw error;

            setPriceHistory(data || []);

            // Calculate stats
            if (data && data.length > 0) {
                const prices = data.map(h => h.price);
                setLowestPrice(Math.min(...prices));
                setHighestPrice(Math.max(...prices));
                setCurrentPrice(data[0].price); // Most recent
            }
        } catch (error) {
            console.error('Error fetching price history:', error);
            toast.error('Failed to load price history');
        } finally {
            setLoading(false);
        }
    };

    const addPricePoint = async (params: {
        deal_id: string;
        price: number;
        original_price?: number;
        in_stock?: boolean;
    }) => {
        try {
            const { data, error } = await supabase
                .from('price_history')
                .insert({
                    deal_id: params.deal_id,
                    price: params.price,
                    original_price: params.original_price || params.price,
                    currency: 'INR',
                    in_stock: params.in_stock !== false,
                })
                .select()
                .single();

            if (error) throw error;

            setPriceHistory(prev => [data, ...prev]);
            return data;
        } catch (error) {
            console.error('Error adding price point:', error);
            return null;
        }
    };

    const getPriceChange = (): { amount: number; percentage: number; direction: 'up' | 'down' | 'stable' } | null => {
        if (priceHistory.length < 2) return null;

        const latest = priceHistory[0].price;
        const previous = priceHistory[1].price;
        const amount = latest - previous;
        const percentage = ((amount / previous) * 100);

        return {
            amount,
            percentage,
            direction: amount > 0 ? 'up' : amount < 0 ? 'down' : 'stable',
        };
    };

    const isPriceAtLowest = (): boolean => {
        if (!currentPrice || !lowestPrice) return false;
        return currentPrice === lowestPrice;
    };

    useEffect(() => {
        if (dealId) {
            fetchPriceHistory();
        }
    }, [dealId]);

    return {
        priceHistory,
        loading,
        lowestPrice,
        highestPrice,
        currentPrice,
        addPricePoint,
        getPriceChange,
        isPriceAtLowest,
        refetch: fetchPriceHistory,
    };
}
