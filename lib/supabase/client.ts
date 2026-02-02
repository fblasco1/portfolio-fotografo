import { createBrowserClient } from '@supabase/ssr';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Solo validar en runtime, no durante el build
if (typeof window === 'undefined' && process.env.NODE_ENV !== 'production') {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Missing Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY)');
  }
}

// Cliente para componentes cliente (browser) - usa createBrowserClient de @supabase/ssr
// Esto maneja correctamente las cookies y la sesión en el navegador sin conflictos con React hooks
let browserClient: SupabaseClient | null = null;
let serverClient: SupabaseClient | null = null;

function getBrowserClient(): SupabaseClient {
  if (!browserClient) {
    if (supabaseUrl && supabaseAnonKey) {
      browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
    } else {
      browserClient = createBrowserClient('https://placeholder.supabase.co', 'placeholder-key');
    }
  }
  return browserClient;
}

function getServerClient(): SupabaseClient {
  if (!serverClient) {
    if (supabaseUrl && supabaseAnonKey) {
      serverClient = createClient(supabaseUrl, supabaseAnonKey);
    } else {
      serverClient = createClient('https://placeholder.supabase.co', 'placeholder-key');
    }
  }
  return serverClient;
}

// Crear cliente de forma lazy usando un getter para evitar problemas con React hooks
// En el navegador, usa createBrowserClient; en el servidor, usa createClient
// El getter asegura que el cliente solo se cree cuando se accede, no durante la importación
let _supabase: SupabaseClient | null = null;

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!_supabase) {
      _supabase = typeof window !== 'undefined' ? getBrowserClient() : getServerClient();
    }
    return (_supabase as any)[prop];
  }
}) as SupabaseClient;

// Cliente con service role para operaciones admin (solo server-side)
// Solo se crea si existe la key, de lo contrario usamos un placeholder para el build
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
export const supabaseAdmin: SupabaseClient = supabaseUrl && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : createClient('https://placeholder.supabase.co', 'placeholder-service-key', {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
