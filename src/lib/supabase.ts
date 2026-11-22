import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Validate and read Supabase environment variables.
 * Supports VITE_SUPABASE_* with fallback to NEXT_PUBLIC_SUPABASE_*.
 */
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL

const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl) {
  throw new Error(
    '[Supabase] Missing environment variable: VITE_SUPABASE_URL. Please check your .env.local file.',
  )
}

if (!supabasePublishableKey) {
  throw new Error(
    '[Supabase] Missing environment variable: VITE_SUPABASE_PUBLISHABLE_KEY. Please check your .env.local file.',
  )
}

/**
 * Singleton Supabase Client instance for Vaagai Metals Traders.
 * Configured for client-side authentication, database queries, and storage.
 */
export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabasePublishableKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  },
)

/**
 * Helper to safely test and verify the Supabase connection (e.g. Auth service reachability)
 * without leaking any credentials into console logs or creating tables.
 */
export async function verifySupabaseConnection(): Promise<{
  connected: boolean
  message: string
}> {
  try {
    // Ping Supabase Auth service (no credentials logged, no database tables created)
    const { error } = await supabase.auth.getSession()
    if (error) {
      return {
        connected: false,
        message: `Auth service check returned: ${error.message}`,
      }
    }
    return {
      connected: true,
      message: 'Successfully connected to Supabase Auth service.',
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    return {
      connected: false,
      message: `Failed to reach Supabase: ${errorMsg}`,
    }
  }
}
