// Wrappers around the Strava edge functions (`strava-auth`, `strava-sync`).
// Centralises invocation so components stay clean and we can mock easily.

import { supabase } from './supabase'

export type StravaStatus = {
  connected: boolean
  athlete: { id: string; name: string | null } | null
  expiresAt?: string
  scopes?: string
  needsRefresh?: boolean
}

export type StravaSyncResult = {
  synced: number
  skipped: number
  total: number
  since: string
}

async function invokeAuth<T>(action: string, body?: Record<string, unknown>): Promise<T> {
  if (!supabase) throw new Error('Supabase not configured')
  const { data, error } = await supabase.functions.invoke('strava-auth', {
    body: { action, ...(body ?? {}) },
  })
  if (error) throw error
  if (data && typeof data === 'object' && 'error' in data && data.error) {
    throw new Error(String(data.error))
  }
  return data as T
}

export async function getStravaStatus(): Promise<StravaStatus> {
  return invokeAuth<StravaStatus>('status')
}

export async function startStravaAuth(): Promise<{ url: string }> {
  return invokeAuth<{ url: string }>('auth')
}

export async function startStravaLogin(): Promise<{ url: string }> {
  return invokeAuth<{ url: string }>('login')
}

export async function refreshStravaToken(): Promise<{ success: boolean; expiresAt: string }> {
  return invokeAuth<{ success: boolean; expiresAt: string }>('refresh')
}

export async function disconnectStrava(): Promise<{ success: boolean }> {
  return invokeAuth<{ success: boolean }>('disconnect')
}

export async function syncStravaActivities(days = 60): Promise<StravaSyncResult> {
  if (!supabase) throw new Error('Supabase not configured')
  const { data, error } = await supabase.functions.invoke('strava-sync', {
    body: { days },
  })
  if (error) throw error
  if (data && typeof data === 'object' && 'error' in data && data.error) {
    throw new Error(String(data.error))
  }
  return data as StravaSyncResult
}
