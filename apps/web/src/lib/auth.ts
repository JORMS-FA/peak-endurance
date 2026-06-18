import type { Session, Subscription, User } from '@supabase/supabase-js'
import { supabase, supabaseConfigured } from './supabase'
import type { AuthProfile } from './types'

export function isAuthConfigured() {
  return supabaseConfigured
}

export async function getCurrentSession(): Promise<Session | null> {
  if (!supabase) return null
  const { data, error } = await supabase.auth.getSession()
  if (error) {
    console.warn('getSession error', error.message)
    return null
  }
  return data.session ?? null
}

export async function sendMagicLink(email: string, redirectTo?: string) {
  if (!supabase) {
    return { ok: false as const, message: 'Supabase no está configurado.' }
  }
  const trimmed = email.trim().toLowerCase()
  const { error } = await supabase.auth.signInWithOtp({
    email: trimmed,
    options: {
      emailRedirectTo: redirectTo,
      shouldCreateUser: true,
    },
  })
  if (error) {
    return { ok: false as const, message: error.message }
  }
  return { ok: true as const }
}

export async function signOut() {
  if (!supabase) return
  await supabase.auth.signOut()
}

export function subscribeToAuthChanges(handler: (session: Session | null) => void): Subscription | null {
  if (!supabase) return null
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    handler(session)
  })
  return data.subscription
}

function profileFromUser(user: User | null): AuthProfile | null {
  if (!user) return null
  const meta = user.user_metadata ?? {}
  const displayName =
    (typeof meta.full_name === 'string' && meta.full_name) ||
    (typeof meta.name === 'string' && meta.name) ||
    user.email?.split('@')[0] ||
    'Atleta'
  return {
    id: user.id,
    email: user.email ?? '',
    displayName,
    avatarUrl: typeof meta.avatar_url === 'string' ? meta.avatar_url : null,
  }
}

export async function fetchProfile(_userId: string): Promise<AuthProfile | null> {
  if (!supabase) return null
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) return null
  return profileFromUser(data.user)
}

export async function ensureProfile(user: User | null): Promise<AuthProfile | null> {
  if (!user) return null
  const profile = profileFromUser(user)
  if (!profile || !supabase) return profile
  try {
    await supabase.from('profiles').upsert(
      {
        id: profile.id,
        email: profile.email,
        display_name: profile.displayName,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' },
    )
  } catch (error) {
    console.warn('ensureProfile upsert failed', error)
  }
  return profile
}