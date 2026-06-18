import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import {
  ensureProfile,
  getCurrentSession,
  isAuthConfigured,
  subscribeToAuthChanges,
} from '../lib/auth'
import type { AuthProfile } from '../lib/types'

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

export type AuthContextValue = {
  configured: boolean
  status: AuthStatus
  session: Session | null
  user: Session['user'] | null
  profile: AuthProfile | null
  refresh: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

const SITE_URL = import.meta.env.VITE_SITE_URL ?? window.location.origin

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = isAuthConfigured()
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<AuthProfile | null>(null)
  const bootRef = useRef(false)

  const applySession = useCallback(async (next: Session | null) => {
    setSession(next)
    if (!next) {
      setProfile(null)
      setStatus('unauthenticated')
      return
    }
    const ensured = await ensureProfile(next.user)
    setProfile(ensured)
    setStatus('authenticated')
  }, [])

  useEffect(() => {
    if (!configured) {
      setStatus('unauthenticated')
      return
    }
    let cancelled = false
    ;(async () => {
      const initial = await getCurrentSession()
      if (cancelled) return
      await applySession(initial)
      bootRef.current = true
    })()
    const subscription = subscribeToAuthChanges((next) => {
      void applySession(next)
    })
    return () => {
      cancelled = true
      subscription?.unsubscribe()
    }
  }, [applySession, configured])

  const refresh = useCallback(async () => {
    const current = await getCurrentSession()
    await applySession(current)
  }, [applySession])

  const value = useMemo<AuthContextValue>(
    () => ({
      configured,
      status,
      session,
      user: session?.user ?? null,
      profile,
      refresh,
    }),
    [configured, status, session, profile, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function getSiteUrl() {
  return SITE_URL
}