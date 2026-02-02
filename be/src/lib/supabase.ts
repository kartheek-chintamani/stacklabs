import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing env.VITE_SUPABASE_URL');
}
if (!supabaseAnonKey) {
  throw new Error('Missing env.VITE_SUPABASE_PUBLISHABLE_KEY');
}

// Default supabase client instance
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

export const createClient = () =>
  createSupabaseClient(supabaseUrl, supabaseAnonKey);

// For server-side with service role key
export const createAdminClient = () => {
  const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error('Missing env.VITE_SUPABASE_SERVICE_ROLE_KEY');
  }

  return createSupabaseClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
};
