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

export type AuthResult =
  | { ok: true; mode: 'session' | 'confirmation_required' }
  | { ok: false; message: string }

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateCredentials(
  email: string,
  password: string
): { ok: true; email: string } | { ok: false; message: string } {
  const normalizedEmail = email.trim().toLowerCase()
  if (!normalizedEmail) {
    return { ok: false, message: 'El correo electrónico es obligatorio.' }
  }
  if (!EMAIL_REGEX.test(normalizedEmail)) {
    return {
      ok: false,
      message: 'El formato del correo electrónico no es válido.',
    }
  }
  if (!password || password.length < 6) {
    return {
      ok: false,
      message: 'La contraseña debe tener al menos 6 caracteres.',
    }
  }
  return { ok: true, email: normalizedEmail }
}

function describeAuthError(err: { message: string } | null | undefined): string {
  if (!err) return 'Error desconocido de autenticación.'
  const msg = err.message || ''
  const lower = msg.toLowerCase()
  if (lower.includes('invalid login credentials')) {
    return 'Correo o contraseña incorrectos.'
  }
  if (lower.includes('email not confirmed')) {
    return 'Tu correo aún no ha sido confirmado. Revisa tu bandeja de entrada.'
  }
  if (lower.includes('user already registered')) {
    return 'Ya existe una cuenta con ese correo. Inicia sesión.'
  }
  if (lower.includes('rate limit')) {
    return 'Demasiados intentos. Espera unos segundos y vuelve a probar.'
  }
  if (lower.includes('weak password')) {
    return 'La contraseña es demasiado débil. Usa al menos 6 caracteres.'
  }
  if (lower.includes('network') || lower.includes('fetch')) {
    return 'Error de red. Comprueba tu conexión a internet.'
  }
  return msg || 'Error de autenticación.'
}

export async function signInWithPassword(
  email: string,
  password: string
): Promise<AuthResult> {
  if (!supabase) {
    return { ok: false, message: 'Supabase no está configurado.' }
  }
  const validation = validateCredentials(email, password)
  if (!validation.ok) return validation

  const { data, error } = await supabase.auth.signInWithPassword({
    email: validation.email,
    password,
  })
  if (error) {
    return { ok: false, message: describeAuthError(error) }
  }

  // Force a redirect to /app on success. Supabase also fires
  // onAuthStateChange, but this guarantees the user lands on /app
  // even if the listener is slow or the React effect hasn't fired yet.
  if (typeof window !== 'undefined') {
    if (data?.session) {
      window.location.assign('/app')
    } else {
      // No session returned (shouldn't happen on sign-in) — still redirect
      // so the AuthGuard can pick it up via getSession.
      window.location.assign('/app')
    }
  }
  return { ok: true, mode: 'session' }
}

export async function signUpWithPassword(
  email: string,
  password: string
): Promise<AuthResult> {
  if (!supabase) {
    return { ok: false, message: 'Supabase no está configurado.' }
  }
  const validation = validateCredentials(email, password)
  if (!validation.ok) return validation

  const redirectTo = `${getSiteUrl()}/auth/callback`
  const { data, error } = await supabase.auth.signUp({
    email: validation.email,
    password,
    options: {
      emailRedirectTo: redirectTo,
      // Instant sign-up: skip the email confirmation round-trip
      // (requires "Confirm Email" to be OFF in Supabase Auth settings).
      data: { instant_signup: true },
    },
  })
  if (error) {
    return { ok: false, message: describeAuthError(error) }
  }

  // Instant auth path: a session is returned and we can go straight to /app.
  if (data?.session) {
    if (typeof window !== 'undefined') {
      window.location.assign('/app')
    }
    return { ok: true, mode: 'session' }
  }

  // Confirmation-required path: Supabase created the user but did NOT
  // sign them in. Fall back to a sign-in attempt; if that also fails
  // (e.g. email not confirmed), surface a clear message.
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: validation.email,
    password,
  })
  if (!signInError) {
    if (typeof window !== 'undefined') {
      window.location.assign('/app')
    }
    return { ok: true, mode: 'session' }
  }

  const lower = (signInError.message || '').toLowerCase()
  if (lower.includes('email not confirmed')) {
    return {
      ok: false,
      message:
        'Cuenta creada. Revisa tu correo para confirmarla antes de iniciar sesión.',
    }
  }
  return { ok: false, message: describeAuthError(signInError) }
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
    .select('id, email, display_name, avatar_url, created_at, onboarding_completed, subscription_tier, subscription_expires_at, subscription_status')
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
      subscription_tier: existing.subscription_tier ?? null,
      subscription_expires_at: existing.subscription_expires_at ?? null,
      subscription_status: existing.subscription_status ?? null,
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
      subscription_tier: 'free',
      subscription_status: 'active',
    })
    .select('id, email, display_name, avatar_url, created_at, onboarding_completed, subscription_tier, subscription_expires_at, subscription_status')
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
      subscription_tier: 'free',
      subscription_expires_at: null,
      subscription_status: 'active',
    }
  }

  return {
    id: created?.id ?? user.id,
    email: created?.email ?? email,
    display_name: created?.display_name ?? displayName,
    avatar_url: created?.avatar_url ?? avatarUrl,
    created_at: created?.created_at ?? null,
    onboarding_completed: created?.onboarding_completed ?? false,
    subscription_tier: created?.subscription_tier ?? null,
    subscription_expires_at: created?.subscription_expires_at ?? null,
    subscription_status: created?.subscription_status ?? null,
  }
}
