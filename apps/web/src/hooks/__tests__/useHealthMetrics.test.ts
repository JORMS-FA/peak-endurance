import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'

const { mockClient, profileRef, authStatusRef, queryTerminal, listTerminal } = vi.hoisted(() => {
  const terminal: { data: unknown; error: unknown } = { data: null, error: null }
  const listTerminal: { data: unknown; error: unknown } = { data: null, error: null }
  const makeChain = () => {
    const self: Record<string, unknown> = {
      select: vi.fn(() => self),
      eq: vi.fn(() => self),
      gte: vi.fn(() => self),
      order: vi.fn(() => self),
      limit: vi.fn(() => self),
      upsert: vi.fn(() => self),
      // Awaitable terminal → resolves to listTerminal (used by select-lists).
      then: (resolve: (v: unknown) => unknown) => Promise.resolve(listTerminal).then(resolve),
    }
    return self
  }
  return {
    mockClient: { from: vi.fn(() => makeChain()) },
    profileRef: { current: { id: 'u1' } as { id: string } | null },
    authStatusRef: { current: 'unauthenticated' as string },
    queryTerminal: terminal,
    listTerminal,
  }
})

vi.mock('@/lib/supabase', () => ({
  get supabase() {
    return mockClient
  },
  supabaseConfigured: true,
}))
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    profile: profileRef.current,
    status: authStatusRef.current,
    session: { user: { id: 'u1' } },
  }),
}))

import { useHealthMetrics } from '../useHealthMetrics'

beforeEach(() => {
  vi.clearAllMocks()
  profileRef.current = { id: 'u1' }
  authStatusRef.current = 'authenticated'
  listTerminal.data = null
  listTerminal.error = null
})

afterEach(() => {
  vi.restoreAllMocks()
})

function isoToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

describe('useHealthMetrics', () => {
  it('returns no data and not loading when supabase is not configured / unauthenticated', async () => {
    authStatusRef.current = 'unauthenticated'
    const { result } = renderHook(() => useHealthMetrics())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.today).toBeNull()
    expect(result.current.hasToday).toBe(false)
  })

  it('sets hasToday and maps today row when the latest window includes today', async () => {
    listTerminal.data = [
      { id: 'm1', profile_id: 'u1', date: isoToday(), sleep_hours: '7.2', hrv_ms: '58', recovery_pct: '82', source: 'oura' },
    ]
    const { result } = renderHook(() => useHealthMetrics())
    await waitFor(() => expect(result.current.hasToday).toBe(true))
    expect(result.current.today?.recovery_pct).toBe(82)
    expect(result.current.today?.sleep_hours).toBe(7.2)
    expect(result.current.today?.hrv_ms).toBe(58)
  })

  it('hasToday stays false when the latest row is not today', async () => {
    listTerminal.data = [
      { id: 'm0', profile_id: 'u1', date: '2020-01-01', sleep_hours: '6', hrv_ms: '50', recovery_pct: '70', source: 'oura' },
    ]
    const { result } = renderHook(() => useHealthMetrics())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.hasToday).toBe(false)
    expect(result.current.latest?.recovery_pct).toBe(70)
  })

  it('handles a query error gracefully', async () => {
    listTerminal.error = { message: 'boom' }
    const { result } = renderHook(() => useHealthMetrics())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.hasToday).toBe(false)
    expect(result.current.error).toBe('boom')
  })
})
