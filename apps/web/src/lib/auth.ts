import type { Session, Subscription, User } from '@supabase/supabase-js'
import { supabase, supabaseConfigured } from './supabase'
import type { AuthProfile } from './types'

const PROFILES_TABLE = 'profiles'

function getSiteUrl(): string {
  const fromEnv = import.meta.env.VITE_SITE_URL ?? ''
  if (fromEnv.trim().length > 0) return fromEnv.trim()
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }
  return 'http://localhost:4173'
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

export async function signInWithPassword(
  email: string,
  password: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!supabase) {
    return { ok: false, message: 'Supabase is not configured.' }
  }
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  })
  if (error) {
    return { ok: false, message: error.message }
  }
  return { ok: true }
}

export async function signUpWithPassword(
  email: string,
  password: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!supabase) {
    return { ok: false, message: 'Supabase is not configured.' }
  }
  const redirectTo = `${getSiteUrl()}/auth/callback`
  const { error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: { emailRedirectTo: redirectTo },
  })
  if (error) {
    return { ok: false, message: error.message }
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
  callback: (session: Session | null) => void
): Subscription | null {
  if (!supabase) return null
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session)
  })
  return data.subscription
}

function deriveDisplayName(user: User | null): string | null {
  if (!user) return null
  const meta: Record<string, unknown> = (user.user_metadata ?? {})
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

function deriveAvatarUrl(user: User | null): string | null {
  if (!user) return null
  const meta: Record<string, unknown> = (user.user_metadata ?? {})
  return (typeof meta.avatar_url === 'string' && meta.avatar_url) ||
    (typeof meta.picture === 'string' && meta.picture) ||
    null
}

export async function ensureProfile(user: User): Promise<AuthProfile | null> {
  if (!supabase) return null
  const displayName = deriveDisplayName(user)
  const avatarUrl = deriveAvatarUrl(user)
  const email = user.email ?? null
  const upsertPayload: Record<string, unknown> = {
    id: user.id,
    email,
    updated_at: new Date().toISOString(),
  }
  if (displayName) upsertPayload.display_name = displayName
  if (avatarUrl) upsertPayload.avatar_url = avatarUrl

  const { data, error } = await supabase
    .from(PROFILES_TABLE)
    .upsert(upsertPayload, { onConflict: 'id' })
    .select('id, email, display_name, avatar_url, created_at, onboarding_completed')
    .maybeSingle()

  if (error) {
    console.warn('[auth] ensureProfile error:', error.message)
    return {
      id: user.id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl,
      created_at: null,
      onboarding_completed: false,
    }
  }
  return {
    id: data?.id ?? user.id,
    email: data?.email ?? email,
    display_name: data?.display_name ?? displayName,
    avatar_url: data?.avatar_url ?? avatarUrl,
    created_at: data?.created_at ?? null,
    onboarding_completed: data?.onboarding_completed ?? false,
  }
}
