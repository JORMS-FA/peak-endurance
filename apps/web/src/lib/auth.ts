import type { Session, Subscription, User } from '@supabase/supabase-js'
import { supabase, supabaseConfigured } from './supabase'
import type { AuthProfile } from './types'

const PROFILES_TABLE = 'profiles'

function getSiteUrl(): string {
  const fromEnv = import.meta.env.VITE_SITE_URL
  if (fromEnv && fromEnv.trim().length > 0) return fromEnv.trim()
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }
  return 'http://localhost:5173'
}

export function isAuthConfigured(): boolean {
  return supabaseConfigured && supabase !== null
}

export async function getCurrentSession(): Promise<Session | null> {
  if (!supabase) return null
  const { data, error } = await supabase.auth.getSession()
  if (error) {
    console.warn('[auth] getSession error:', error.message)
    return null
  }
  return data.session
}

export async function sendMagicLink(email: string): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!supabase) {
    return { ok: false, error: 'Supabase no está configurado.' }
  }
  const trimmed = email.trim().toLowerCase()
  if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { ok: false, error: 'Ingresa un correo electrónico válido.' }
  }
  const redirectTo = `${getSiteUrl()}/auth/callback`
  const { error } = await supabase.auth.signInWithOtp({
    email: trimmed,
    options: {
      emailRedirectTo: redirectTo,
      shouldCreateUser: true,
    },
  })
  if (error) {
    return { ok: false, error: error.message }
  }
  return { ok: true }
}

export async function signOut(): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.warn('[auth] signOut error:', error.message)
  }
}

export function subscribeToAuthChanges(
  callback: (session: Session | null) => void,
): Subscription | null {
  if (!supabase) return null
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session)
  })
  return data.subscription
}

function deriveDisplayName(user: User | null): string | null {
  if (!user) return null
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>
  const candidate =
    (typeof meta.full_name === 'string' && meta.full_name) ||
    (typeof meta.name === 'string' && meta.name) ||
    (typeof meta.display_name === 'string' && meta.display_name) ||
    null
  if (candidate) return candidate
  if (user.email) {
    const local = user.email.split('@')[0] ?? ''
    if (local.length > 0) return local
  }
  return null
}

export async function fetchProfile(userId: string): Promise<AuthProfile | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from(PROFILES_TABLE)
    .select('id, email, display_name, created_at')
    .eq('id', userId)
    .maybeSingle()
  if (error) {
    console.warn('[auth] fetchProfile error:', error.message)
    return null
  }
  return data as AuthProfile | null
}

export async function ensureProfile(user: User): Promise<AuthProfile | null> {
  if (!supabase) return null
  const displayName = deriveDisplayName(user)
  const email = user.email ?? null
  const upsertPayload: Record<string, unknown> = {
    id: user.id,
    email,
    updated_at: new Date().toISOString(),
  }
  if (displayName) upsertPayload.display_name = displayName

  const { data, error } = await supabase
    .from(PROFILES_TABLE)
    .upsert(upsertPayload, { onConflict: 'id' })
    .select('id, email, display_name, created_at')
    .maybeSingle()

  if (error) {
    console.warn('[auth] ensureProfile error:', error.message)
    return null
  }
  return (data as AuthProfile | null) ?? {
    id: user.id,
    email,
    display_name: displayName,
    created_at: null,
  }
}
