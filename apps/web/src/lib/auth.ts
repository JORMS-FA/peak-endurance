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
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      emailRedirectTo: redirectTo,
      // Instant sign-up: skip the email confirmation round-trip
      // (requires "Confirm Email" to be OFF in Supabase Auth settings).
      data: { instant_signup: true },
    },
  })
  if (error) {
    return { ok: false, message: error.message }
  }
  // Instant auth: when Supabase creates and signs in the user in one go
  // (Confirm Email disabled), onAuthStateChange will pick up the session
  // and AuthGuard will navigate to /app. As a safety net, force a redirect
  // once the user object is present.
  if (data?.user) {
    const { data: sessionData } = await supabase.auth.getSession()
    if (sessionData.session) {
      if (typeof window !== 'undefined') {
        window.location.assign('/app')
      }
    }
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

  // First, try to read the existing profile
  const { data: existing } = await supabase
    .from(PROFILES_TABLE)
    .select('id, email, display_name, avatar_url, created_at, onboarding_completed')
    .eq('id', user.id)
    .maybeSingle()

  if (existing) {
    // Profile exists — only update non-critical fields (never touch onboarding_completed)
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (email && email !== existing.email) updates.email = email
    if (displayName && displayName !== existing.display_name) updates.display_name = displayName
    if (avatarUrl && avatarUrl !== existing.avatar_url) updates.avatar_url = avatarUrl

    if (Object.keys(updates).length > 1) {
      await supabase.from(PROFILES_TABLE).update(updates).eq('id', user.id)
    }

    return {
      id: existing.id,
      email: existing.email ?? email,
      display_name: existing.display_name ?? displayName,
      avatar_url: existing.avatar_url ?? avatarUrl,
      created_at: existing.created_at,
      onboarding_completed: existing.onboarding_completed ?? false,
    }
  }

  // Profile doesn't exist — create it (new user)
  const { data: created, error } = await supabase
    .from(PROFILES_TABLE)
    .insert({
      id: user.id,
      email,
      display_name: displayName,
      avatar_url: avatarUrl,
      onboarding_completed: false,
    })
    .select('id, email, display_name, avatar_url, created_at, onboarding_completed')
    .maybeSingle()

  if (error) {
    console.warn('[auth] ensureProfile insert error:', error.message)
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
    id: created?.id ?? user.id,
    email: created?.email ?? email,
    display_name: created?.display_name ?? displayName,
    avatar_url: created?.avatar_url ?? avatarUrl,
    created_at: created?.created_at ?? null,
    onboarding_completed: created?.onboarding_completed ?? false,
  }
}
