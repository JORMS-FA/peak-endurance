import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL ?? ''
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

export const supabaseConfigured = Boolean(url && anonKey)

// Hybrid storage adapter: localStorage primary + cookie fallback.
// Cookies survive page loads even in headless/test browser environments
// where localStorage may reset between navigations.
const cookieStorageAdapter = {
  getItem(key: string): string | null {
    const ls = localStorage.getItem(key)
    if (ls) return ls
    const cookie = document.cookie.split('; ').find((row) => row.startsWith(key + '='))
    return cookie ? decodeURIComponent(cookie.split('=')[1]) : null
  },
  setItem(key: string, value: string): void {
    localStorage.setItem(key, value)
    document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=604800; SameSite=Lax`
  },
  removeItem(key: string): void {
    localStorage.removeItem(key)
    document.cookie = `${key}=; path=/; max-age=0`
  },
}

export const supabase = supabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        storage: cookieStorageAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null
