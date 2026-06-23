import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { mockSupabase, configuredRef } = vi.hoisted(() => {
  const invoke = vi.fn()
  return {
    mockSupabase: { functions: { invoke } },
    configuredRef: { value: true },
  }
})

vi.mock('../supabase', () => ({
  get supabase() {
    return configuredRef.value ? mockSupabase : null
  },
  get supabaseConfigured() {
    return configuredRef.value
  },
}))

const {
  getStravaStatus,
  startStravaAuth,
  refreshStravaToken,
  disconnectStrava,
  syncStravaActivities,
} = await import('../strava')

beforeEach(() => {
  configuredRef.value = true
  mockSupabase.functions.invoke.mockReset()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('strava lib wrappers', () => {
  it('getStravaStatus returns parsed status', async () => {
    const status = {
      connected: true,
      athlete: { id: '1', name: 'Runner' },
      expiresAt: '2026-12-31T00:00:00Z',
    }
    mockSupabase.functions.invoke.mockResolvedValue({ data: status, error: null })
    await expect(getStravaStatus()).resolves.toEqual(status)
    expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('strava-auth', {
      body: { action: 'status' },
    })
  })

  it('getStravaStatus throws when the edge function returns an error', async () => {
    mockSupabase.functions.invoke.mockResolvedValue({
      data: null,
      error: { message: 'Edge Function returned non-2xx' },
    })
    await expect(getStravaStatus()).rejects.toThrow('Edge Function returned non-2xx')
  })

  it('getStravaStatus throws when the payload carries an error field', async () => {
    mockSupabase.functions.invoke.mockResolvedValue({
      data: { error: 'oauth_failed' },
      error: null,
    })
    await expect(getStravaStatus()).rejects.toThrow('oauth_failed')
  })

  it('throws "Supabase not configured" when supabase is null', async () => {
    configuredRef.value = false
    await expect(getStravaStatus()).rejects.toThrow('Supabase not configured')
    await expect(syncStravaActivities()).rejects.toThrow('Supabase not configured')
  })

  it('startStravaAuth returns the OAuth url', async () => {
    mockSupabase.functions.invoke.mockResolvedValue({
      data: { url: 'https://www.strava.com/oauth/authorize?foo=1' },
      error: null,
    })
    await expect(startStravaAuth()).resolves.toEqual({
      url: expect.stringContaining('strava.com'),
    })
    expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('strava-auth', {
      body: { action: 'auth' },
    })
  })

  it('refreshStravaToken returns success and a new expiresAt', async () => {
    mockSupabase.functions.invoke.mockResolvedValue({
      data: { success: true, expiresAt: '2026-12-31T00:00:00Z' },
      error: null,
    })
    const res = await refreshStravaToken()
    expect(res).toEqual({ success: true, expiresAt: '2026-12-31T00:00:00Z' })
    expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('strava-auth', {
      body: { action: 'refresh' },
    })
  })

  it('disconnectStrava returns success payload', async () => {
    mockSupabase.functions.invoke.mockResolvedValue({ data: { success: true }, error: null })
    await expect(disconnectStrava()).resolves.toEqual({ success: true })
  })

  it('syncStravaActivities defaults to 60 days', async () => {
    mockSupabase.functions.invoke.mockResolvedValue({
      data: { synced: 5, skipped: 1, total: 6, since: '2026-04-24' },
      error: null,
    })
    const res = await syncStravaActivities()
    expect(res.synced).toBe(5)
    expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('strava-sync', {
      body: { days: 60 },
    })
  })

  it('syncStravaActivities forwards a custom days window', async () => {
    mockSupabase.functions.invoke.mockResolvedValue({
      data: { synced: 2, skipped: 0, total: 2, since: '2026-06-16' },
      error: null,
    })
    await syncStravaActivities(7)
    expect(mockSupabase.functions.invoke).toHaveBeenCalledWith('strava-sync', {
      body: { days: 7 },
    })
  })

  it('syncStravaActivities throws on edge function error', async () => {
    mockSupabase.functions.invoke.mockResolvedValue({
      data: null,
      error: { message: 'sync blew up' },
    })
    await expect(syncStravaActivities()).rejects.toThrow('sync blew up')
  })

  it('syncStravaActivities throws on payload error field', async () => {
    mockSupabase.functions.invoke.mockResolvedValue({
      data: { error: 'token expired' },
      error: null,
    })
    await expect(syncStravaActivities()).rejects.toThrow('token expired')
  })
})