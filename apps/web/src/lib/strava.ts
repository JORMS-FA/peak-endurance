import { supabase } from './supabase'

export type StravaConnectionStatus = {
  connected: boolean
  athlete: { id: string; name: string | null } | null
  expiresAt: string | null
  scopes: string | null
  needsRefresh: boolean
}

export async function getStravaAuthUrl(): Promise<string | null> {
  if (!supabase) return null
  const { data, error } = await supabase.functions.invoke('strava-auth', {
    body: { action: 'auth' },
  })
  if (error || !data?.url) {
    console.warn('getStravaAuthUrl failed', error)
    return null
  }
  return data.url as string
}

export async function getStravaStatus(): Promise<StravaConnectionStatus | null> {
  if (!supabase) return null
  const { data, error } = await supabase.functions.invoke('strava-auth', {
    body: { action: 'status' },
  })
  if (error) {
    console.warn('getStravaStatus failed', error)
    return null
  }
  return {
    connected: data.connected ?? false,
    athlete: data.athlete ?? null,
    expiresAt: data.expiresAt ?? null,
    scopes: data.scopes ?? null,
    needsRefresh: data.needsRefresh ?? false,
  }
}

export async function refreshStravaToken(): Promise<boolean> {
  if (!supabase) return false
  const { error } = await supabase.functions.invoke('strava-auth', {
    body: { action: 'refresh' },
  })
  if (error) {
    console.warn('refreshStravaToken failed', error)
    return false
  }
  return true
}
