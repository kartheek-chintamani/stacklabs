import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type PostTemplate = Tables<'post_templates'>;
type PostTemplateInsert = TablesInsert<'post_templates'>;
type PostTemplateUpdate = TablesUpdate<'post_templates'>;

const defaultTemplates = [
  {
    name: 'Electronics Deal',
    category: 'electronics' as const,
    content: '🔥 *HOT DEAL ALERT* 🔥\n\n{title}\n\n💰 Price: ₹{price} (Save {discount}%!)\n📱 {description}\n\n👉 Buy Now: {link}\n\n#TechDeals #Electronics #SaveMoney',
  },
  {
    name: 'Fashion Sale',
    category: 'fashion' as const,
    content: '👗 *FASHION ALERT* 👗\n\n{title}\n\n✨ {discount}% OFF!\n💵 Now: ₹{price}\n\n🛍️ Shop Now: {link}\n\n#Fashion #Style #Sale',
  },
  {
    name: 'Travel Deal',
    category: 'travel' as const,
    content: '✈️ *TRAVEL DEAL* ✈️\n\n{title}\n\n🏖️ {description}\n💰 Starting at ₹{price}\n\n🔗 Book Now: {link}\n\n#Travel #Vacation #TravelDeals',
  },
  {
    name: 'Food Offer',
    category: 'food' as const,
    content: '🍕 *FOOD OFFER* 🍕\n\n{title}\n\n🤤 {description}\n💸 Flat {discount}% OFF!\n\n🔗 Order: {link}\n\n#Food #Foodie #Offers',
  },
];

export function useTemplates() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<PostTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTemplates = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('post_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // If no templates exist, create defaults
      if (!data || data.length === 0) {
        await createDefaultTemplates();
        return;
      }
      
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultTemplates = async () => {
    if (!user) return;
    
    try {
      const templatesWithUserId = defaultTemplates.map(t => ({
        ...t,
        user_id: user.id,
        is_default: true,
      }));
      
      const { data, error } = await supabase
        .from('post_templates')
        .insert(templatesWithUserId)
        .select();
      
      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error creating default templates:', error);
    }
  };

  const createTemplate = async (template: Omit<PostTemplateInsert, 'user_id'>) => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('post_templates')
        .insert({ ...template, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      setTemplates(prev => [data, ...prev]);
      toast.success('Template created!');
      return data;
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Failed to create template');
      return null;
    }
  };

  const updateTemplate = async (id: string, updates: PostTemplateUpdate) => {
    try {
      const { data, error } = await supabase
        .from('post_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      setTemplates(prev => prev.map(t => t.id === id ? data : t));
      toast.success('Template updated!');
      return data;
    } catch (error) {
      console.error('Error updating template:', error);
      toast.error('Failed to update template');
      return null;
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('post_templates')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setTemplates(prev => prev.filter(t => t.id !== id));
      toast.success('Template deleted!');
      return true;
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
      return false;
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [user]);

  return {
    templates,
    loading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    refetch: fetchTemplates,
  };
}
