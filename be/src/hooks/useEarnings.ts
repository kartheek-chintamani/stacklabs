import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Tables, TablesInsert } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Earning = Tables<'earnings'>;
type EarningInsert = TablesInsert<'earnings'>;

export function useEarnings() {
  const { user } = useAuth();
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEarnings = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('earnings')
        .select('*')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });
      
      if (error) throw error;
      setEarnings(data || []);
    } catch (error) {
      console.error('Error fetching earnings:', error);
      toast.error('Failed to load earnings');
    } finally {
      setLoading(false);
    }
  };

  const addEarning = async (earning: Omit<EarningInsert, 'user_id'>) => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('earnings')
        .insert({ ...earning, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      setEarnings(prev => [data, ...prev]);
      toast.success('Earning recorded!');
      return data;
    } catch (error) {
      console.error('Error adding earning:', error);
      toast.error('Failed to record earning');
      return null;
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, [user]);

  const totalEarnings = earnings.reduce((sum, e) => sum + Number(e.amount), 0);
  const pendingEarnings = earnings
    .filter(e => e.status === 'pending')
    .reduce((sum, e) => sum + Number(e.amount), 0);
  
  const thisMonthEarnings = earnings
    .filter(e => {
      const earnedDate = new Date(e.earned_at);
      const now = new Date();
      return earnedDate.getMonth() === now.getMonth() && 
             earnedDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const networkBreakdown = earnings.reduce((acc, e) => {
    if (!acc[e.network_name]) {
      acc[e.network_name] = { total: 0, pending: 0 };
    }
    acc[e.network_name].total += Number(e.amount);
    if (e.status === 'pending') {
      acc[e.network_name].pending += Number(e.amount);
    }
    return acc;
  }, {} as Record<string, { total: number; pending: number }>);

  return {
    earnings,
    loading,
    totalEarnings,
    pendingEarnings,
    thisMonthEarnings,
    networkBreakdown,
    addEarning,
    refetch: fetchEarnings,
  };
}
