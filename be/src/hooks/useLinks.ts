import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type AffiliateLink = Tables<'affiliate_links'>;
type AffiliateLinkInsert = TablesInsert<'affiliate_links'>;
type AffiliateLinkUpdate = TablesUpdate<'affiliate_links'>;

export function useLinks() {
  const { user } = useAuth();
  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLinks = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('affiliate_links')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setLinks(data || []);
    } catch (error) {
      console.error('Error fetching links:', error);
      toast.error('Failed to load links');
    } finally {
      setLoading(false);
    }
  };

  const createLink = async (link: Omit<AffiliateLinkInsert, 'user_id'>) => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('affiliate_links')
        .insert({ ...link, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      setLinks(prev => [data, ...prev]);
      toast.success('Link created successfully!');
      return data;
    } catch (error) {
      console.error('Error creating link:', error);
      toast.error('Failed to create link');
      return null;
    }
  };

  const updateLink = async (id: string, updates: AffiliateLinkUpdate) => {
    try {
      const { data, error } = await supabase
        .from('affiliate_links')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      setLinks(prev => prev.map(l => l.id === id ? data : l));
      toast.success('Link updated successfully!');
      return data;
    } catch (error) {
      console.error('Error updating link:', error);
      toast.error('Failed to update link');
      return null;
    }
  };

  const deleteLink = async (id: string) => {
    try {
      const { error } = await supabase
        .from('affiliate_links')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setLinks(prev => prev.filter(l => l.id !== id));
      toast.success('Link deleted successfully!');
      return true;
    } catch (error) {
      console.error('Error deleting link:', error);
      toast.error('Failed to delete link');
      return false;
    }
  };

  useEffect(() => {
    fetchLinks();
  }, [user]);

  const stats = {
    total: links.length,
    active: links.filter(l => l.status === 'posted').length,
    totalClicks: links.reduce((sum, l) => sum + (l.click_count || 0), 0),
  };

  return {
    links,
    loading,
    stats,
    createLink,
    updateLink,
    deleteLink,
    refetch: fetchLinks,
  };
}
