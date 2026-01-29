import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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
  created_at: string;
  updated_at: string;
}

export interface AffiliateProgramInsert {
  name: string;
  program_type: string;
  api_key?: string;
  api_secret?: string;
  affiliate_id?: string;
  tracking_param?: string;
  base_url?: string;
  commission_rate?: number;
  is_active?: boolean;
  config?: Record<string, any>;
}

// Predefined affiliate program configurations
export const AFFILIATE_PROGRAM_CONFIGS = {
  amazon: {
    name: 'Amazon Associates',
    program_type: 'amazon',
    tracking_param: 'tag',
    base_url: 'https://www.amazon.in',
    commission_rate: 4,
  },
  flipkart: {
    name: 'Flipkart Affiliate',
    program_type: 'flipkart',
    tracking_param: 'affid',
    base_url: 'https://www.flipkart.com',
    commission_rate: 6,
  },
  myntra: {
    name: 'Myntra Affiliate',
    program_type: 'myntra',
    tracking_param: 'affiliate_id',
    base_url: 'https://www.myntra.com',
    commission_rate: 8,
  },
  ajio: {
    name: 'AJIO Affiliate',
    program_type: 'ajio',
    tracking_param: 'aff_id',
    base_url: 'https://www.ajio.com',
    commission_rate: 7,
  },
  cuelinks: {
    name: 'Cuelinks',
    program_type: 'cuelinks',
    tracking_param: 'subid',
    base_url: 'https://linksredirect.com',
    commission_rate: 5,
  },
  meesho: {
    name: 'Meesho Partner',
    program_type: 'meesho',
    tracking_param: 'ref',
    base_url: 'https://www.meesho.com',
    commission_rate: 10,
  },
  nykaa: {
    name: 'Nykaa Affiliate',
    program_type: 'nykaa',
    tracking_param: 'utm_source',
    base_url: 'https://www.nykaa.com',
    commission_rate: 8,
  },
  tatacliq: {
    name: 'Tata CLiQ Affiliate',
    program_type: 'tatacliq',
    tracking_param: 'affiliate',
    base_url: 'https://www.tatacliq.com',
    commission_rate: 5,
  },
};

export function useAffiliatePrograms() {
  const { user } = useAuth();
  const [programs, setPrograms] = useState<AffiliateProgram[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPrograms = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('affiliate_programs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type assertion since the table is new and types aren't generated yet
      setPrograms((data || []) as AffiliateProgram[]);
    } catch (error) {
      console.error('Error fetching affiliate programs:', error);
      toast.error('Failed to load affiliate programs');
    } finally {
      setLoading(false);
    }
  };

  const createProgram = async (program: AffiliateProgramInsert) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('affiliate_programs')
        .insert({ ...program, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      
      const newProgram = data as AffiliateProgram;
      setPrograms(prev => [newProgram, ...prev]);
      toast.success('Affiliate program added!');
      return newProgram;
    } catch (error) {
      console.error('Error creating affiliate program:', error);
      toast.error('Failed to add affiliate program');
      return null;
    }
  };

  const updateProgram = async (id: string, updates: Partial<AffiliateProgramInsert>) => {
    try {
      const { data, error } = await supabase
        .from('affiliate_programs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      const updatedProgram = data as AffiliateProgram;
      setPrograms(prev => prev.map(p => p.id === id ? updatedProgram : p));
      toast.success('Affiliate program updated!');
      return updatedProgram;
    } catch (error) {
      console.error('Error updating affiliate program:', error);
      toast.error('Failed to update affiliate program');
      return null;
    }
  };

  const deleteProgram = async (id: string) => {
    try {
      const { error } = await supabase
        .from('affiliate_programs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setPrograms(prev => prev.filter(p => p.id !== id));
      toast.success('Affiliate program removed');
      return true;
    } catch (error) {
      console.error('Error deleting affiliate program:', error);
      toast.error('Failed to remove affiliate program');
      return false;
    }
  };

  const toggleActive = async (id: string) => {
    const program = programs.find(p => p.id === id);
    if (!program) return;
    
    await updateProgram(id, { is_active: !program.is_active });
  };

  // Convert a regular URL to an affiliate URL
  const convertToAffiliateLink = (originalUrl: string, programType?: string): { affiliateUrl: string; program: AffiliateProgram | null } => {
    // Find the matching affiliate program
    let matchedProgram: AffiliateProgram | null = null;
    
    if (programType) {
      matchedProgram = programs.find(p => p.program_type === programType && p.is_active) || null;
    } else {
      // Try to detect the platform from the URL
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

  useEffect(() => {
    fetchPrograms();
  }, [user]);

  return {
    programs,
    loading,
    createProgram,
    updateProgram,
    deleteProgram,
    toggleActive,
    convertToAffiliateLink,
    refetch: fetchPrograms,
  };
}
