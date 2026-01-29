import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type PriceAlert = Tables<'price_alerts'>;
type PriceAlertInsert = TablesInsert<'price_alerts'>;
type PriceAlertUpdate = TablesUpdate<'price_alerts'>;

export function usePriceAlerts() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('price_alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error fetching price alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAlert = async (alert: Omit<PriceAlertInsert, 'user_id'>) => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('price_alerts')
        .insert({ ...alert, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      setAlerts(prev => [data, ...prev]);
      toast.success('Price alert created!');
      return data;
    } catch (error) {
      console.error('Error creating alert:', error);
      toast.error('Failed to create price alert');
      return null;
    }
  };

  const updateAlert = async (id: string, updates: PriceAlertUpdate) => {
    try {
      const { data, error } = await supabase
        .from('price_alerts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      setAlerts(prev => prev.map(a => a.id === id ? data : a));
      return data;
    } catch (error) {
      console.error('Error updating alert:', error);
      toast.error('Failed to update alert');
      return null;
    }
  };

  const deleteAlert = async (id: string) => {
    try {
      const { error } = await supabase
        .from('price_alerts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setAlerts(prev => prev.filter(a => a.id !== id));
      toast.success('Price alert removed');
      return true;
    } catch (error) {
      console.error('Error deleting alert:', error);
      toast.error('Failed to remove alert');
      return false;
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [user]);

  const activeAlerts = alerts.filter(a => !a.is_triggered);
  const triggeredAlerts = alerts.filter(a => a.is_triggered);

  return {
    alerts,
    activeAlerts,
    triggeredAlerts,
    loading,
    createAlert,
    updateAlert,
    deleteAlert,
    refetch: fetchAlerts,
  };
}
