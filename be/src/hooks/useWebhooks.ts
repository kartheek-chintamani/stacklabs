import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Webhook {
    id: string;
    url: string;
    secret_key: string | null;
    events: string[]; // e.g., ['price.drop', 'deal.new']
    is_active: boolean;
    created_at: string;
    last_triggered_at: string | null;
    failure_count: number | null;
}

export function useWebhooks() {
    const { user } = useAuth();
    const [webhooks, setWebhooks] = useState<Webhook[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWebhooks();
    }, [user]);

    const fetchWebhooks = async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('webhooks')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            // Data from supabase matches the schema, so we cast it to our interface which now matches the schema
            setWebhooks(data as unknown as Webhook[]);
        } catch (error) {
            console.error('Error fetching webhooks:', error);
            toast.error('Failed to load webhooks');
        } finally {
            setLoading(false);
        }
    };

    const createWebhook = async (url: string, events: string[] = ['price.drop']) => {
        if (!user) return null;

        try {
            const secret_key = 'whsec_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

            const { data, error } = await supabase
                .from('webhooks')
                .insert({
                    user_id: user.id,
                    name: `Webhook ${new Date().toISOString()}`, // Default name
                    url,
                    secret_key,
                    events,
                    is_active: true
                })
                .select()
                .single();

            if (error) throw error;

            const newWebhook = data as unknown as Webhook;
            setWebhooks(prev => [newWebhook, ...prev]);
            toast.success('Webhook created');
            return newWebhook;
        } catch (error: any) {
            console.error('Error creating webhook:', error);
            toast.error(error.message || 'Failed to create webhook');
            return null;
        }
    };

    const deleteWebhook = async (id: string) => {
        try {
            const { error } = await supabase
                .from('webhooks')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setWebhooks(prev => prev.filter(wh => wh.id !== id));
            toast.success('Webhook deleted');
            return true;
        } catch (error) {
            console.error('Error deleting webhook:', error);
            toast.error('Failed to delete webhook');
            return false;
        }
    };

    const toggleActive = async (id: string, isActive: boolean) => {
        try {
            const { error } = await supabase
                .from('webhooks')
                .update({ is_active: isActive })
                .eq('id', id);

            if (error) throw error;

            setWebhooks(prev => prev.map(wh => wh.id === id ? { ...wh, is_active: isActive } : wh));
            toast.success(`Webhook ${isActive ? 'enabled' : 'disabled'}`);
        } catch (error) {
            console.error('Error updating webhook:', error);
            toast.error('Failed to update webhook');
        }
    };

    return {
        webhooks,
        loading,
        createWebhook,
        deleteWebhook,
        toggleActive,
        refetch: fetchWebhooks
    };
}
