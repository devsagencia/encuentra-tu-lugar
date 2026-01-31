import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

function readSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';
  return { url, key };
}

let _client: SupabaseClient<Database> | null = null;

function getClient(): SupabaseClient<Database> {
  if (_client) return _client;

  const { url, key } = readSupabaseEnv();
  if (!url || !key) {
    // IMPORTANTE:
    // En build/prerender (Vercel) puede evaluarse este módulo sin variables de entorno.
    // No debemos lanzar aquí; devolvemos un proxy que fallará solo cuando se intente usar.
    if (typeof window !== 'undefined') {
      console.warn('Supabase environment variables are not set');
    }

    return new Proxy(
      {},
      {
        get() {
          throw new Error(
            'Supabase env vars are not set (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY).'
          );
        },
      },
    ) as unknown as SupabaseClient<Database>;
  }

  _client = createClient<Database>(url, key, {
    auth: {
      storage: typeof window !== 'undefined' ? localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
    },
  });
  return _client;
}

// Mantener compatibilidad con imports existentes: `import { supabase } ...`
export const supabase = new Proxy(
  {},
  {
    get(_target, prop) {
      return (getClient() as any)[prop];
    },
  },
) as unknown as SupabaseClient<Database>;