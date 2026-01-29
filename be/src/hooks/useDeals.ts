import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Deal = Tables<'deals'>;
type DealInsert = TablesInsert<'deals'>;
type DealUpdate = TablesUpdate<'deals'>;

export function useDeals() {
  const { user } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDeals = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDeals(data || []);
    } catch (error) {
      console.error('Error fetching deals:', error);
      toast.error('Failed to load deals');
    } finally {
      setLoading(false);
    }
  };

  const createDeal = async (deal: Omit<DealInsert, 'user_id'>) => {
    console.log('🔍 createDeal called with:', deal);
    console.log('👤 Current user:', user?.id);

    if (!user) {
      console.error('❌ No user found - cannot create deal');
      toast.error('Please log in to save products');
      return null;
    }

    try {
      console.log('📤 Inserting deal into database...');
      const { data, error } = await supabase
        .from('deals')
        .insert({ ...deal, user_id: user.id })
        .select()
        .single();

      if (error) {
        console.error('❌ Database error:', error);
        throw error;
      }

      console.log('✅ Deal created successfully:', data);
      setDeals(prev => [data, ...prev]);
      toast.success('Deal added successfully!');
      return data;
    } catch (error: any) {
      console.error('❌ Error creating deal:', error);
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
      });
      toast.error(`Failed to add deal: ${error?.message || 'Unknown error'}`);
      return null;
    }
  };

  const updateDeal = async (id: string, updates: DealUpdate) => {
    try {
      const { data, error } = await supabase
        .from('deals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setDeals(prev => prev.map(d => d.id === id ? data : d));
      return data;
    } catch (error) {
      console.error('Error updating deal:', error);
      toast.error('Failed to update deal');
      return null;
    }
  };

  const toggleFavorite = async (id: string) => {
    const deal = deals.find(d => d.id === id);
    if (!deal) return;

    const newFavoriteStatus = !deal.is_favorite;
    await updateDeal(id, { is_favorite: newFavoriteStatus });
    toast.success(newFavoriteStatus ? 'Added to favorites!' : 'Removed from favorites');
  };

  const deleteDeal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('deals')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setDeals(prev => prev.filter(d => d.id !== id));
      toast.success('Deal removed');
      return true;
    } catch (error) {
      console.error('Error deleting deal:', error);
      toast.error('Failed to remove deal');
      return false;
    }
  };

  useEffect(() => {
    fetchDeals();
  }, [user]);

  return {
    deals,
    loading,
    createDeal,
    updateDeal,
    toggleFavorite,
    deleteDeal,
    refetch: fetchDeals,
  };
}
