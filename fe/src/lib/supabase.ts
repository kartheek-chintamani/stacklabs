// AI Generated Code by Deloitte + Cursor (BEGIN)
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const createClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not configured. Using mock mode.');
    // Return a minimal mock client to prevent build errors
    return createSupabaseClient('https://mock.supabase.co', 'mock-key');
  }
  
  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    global: {
      fetch: (...args) => fetch(...args),
      headers: { 'x-client-info': 'devtools-nexus' }
    },
    db: {
      schema: 'public'
    },
    auth: {
      persistSession: true,
      autoRefreshToken: true
    },
    realtime: {
      timeout: 30000
    }
  });
};
// AI Generated Code by Deloitte + Cursor (END)

// AI Generated Code by Deloitte + Cursor (BEGIN)
// For server-side with service role key
export const createAdminClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.warn('Supabase admin credentials not configured. Using mock mode.');
    return createSupabaseClient('https://mock.supabase.co', 'mock-service-key', {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }
  
  return createSupabaseClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        fetch: (...args) => fetch(...args),
        headers: { 'x-client-info': 'devtools-nexus-admin' }
      },
      db: {
        schema: 'public'
      },
      realtime: {
        timeout: 30000
      }
    }
  );
};
// AI Generated Code by Deloitte + Cursor (END)
