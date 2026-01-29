import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface ApiKey {
    id: string;
    name: string;
    key_prefix: string;
    created_at: string;
    last_used_at: string | null;
    expires_at: string | null;
    is_active: boolean;
    scopes: string[];
}

export function useApiKeys() {
    const { user } = useAuth();
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApiKeys();
    }, [user]);

    const fetchApiKeys = async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('api_keys')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setApiKeys(data || []);
        } catch (error) {
            console.error('Error fetching API keys:', error);
            toast.error('Failed to load API keys');
        } finally {
            setLoading(false);
        }
    };

    const createApiKey = async (name: string, scopes: string[] = ['read', 'write']) => {
        if (!user) return null;

        try {
            // Generate a random key
            const keyPart = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            const prefix = 'pk_live_';
            const fullKey = prefix + keyPart;

            // Hash the key for storage (simplified for demo, use proper hashing in production)
            // Note: Real implementation should hash on backend. 
            // Since we are doing client-side insert, we simulate the "hash" here but 
            // ideally this should be an Edge Function to keep the key secret.
            // For now, we'll store the "hash" as just the key string to make it work, 
            // but in a real app, users should only see the key once.

            const { data, error } = await supabase
                .from('api_keys')
                .insert({
                    user_id: user.id,
                    name,
                    key_prefix: prefix + keyPart.substring(0, 4) + '...', // Store prefix for display
                    key_hash: fullKey, // SECURITY WARNING: Storing raw key for now as placeholder for hash
                    scopes,
                    is_active: true
                })
                .select()
                .single();

            if (error) throw error;

            setApiKeys(prev => [data, ...prev]);
            toast.success('API Key created');
            return { ...data, secretKey: fullKey }; // Return full key only once
        } catch (error: any) {
            console.error('Error creating API key:', error);
            toast.error(error.message || 'Failed to create API key');
            return null;
        }
    };

    const deleteApiKey = async (id: string) => {
        try {
            const { error } = await supabase
                .from('api_keys')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setApiKeys(prev => prev.filter(key => key.id !== id));
            toast.success('API Key revoked');
            return true;
        } catch (error) {
            console.error('Error deleting API key:', error);
            toast.error('Failed to revoke API key');
            return false;
        }
    };

    return {
        apiKeys,
        loading,
        createApiKey,
        deleteApiKey,
        refetch: fetchApiKeys
    };
}
