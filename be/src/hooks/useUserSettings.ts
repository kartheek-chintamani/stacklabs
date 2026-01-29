import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Tables, TablesUpdate } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type UserSettings = Tables<'user_settings'>;
type UserSettingsUpdate = TablesUpdate<'user_settings'>;

export function useUserSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: UserSettingsUpdate) => {
    if (!user || !settings) return null;
    
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .update(updates)
        .eq('id', settings.id)
        .select()
        .single();
      
      if (error) throw error;
      setSettings(data);
      toast.success('Settings saved!');
      return data;
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to save settings');
      return null;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [user]);

  return {
    settings,
    loading,
    updateSettings,
    refetch: fetchSettings,
  };
}
