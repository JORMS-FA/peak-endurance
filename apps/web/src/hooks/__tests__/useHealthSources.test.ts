import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'

const { mockClient, profileRef, authStatusRef, listTerminal } = vi.hoisted(() => {
  const listTerminal: { data: unknown; error: unknown } = { data: null, error: null }
  const makeChain = () => {
    const self: Record<string, unknown> = {
      select: vi.fn(() => self),
      eq: vi.fn(() => self),
      order: vi.fn(() => self),
      then: (resolve: (v: unknown) => unknown) => Promise.resolve(listTerminal).then(resolve),
    }
    return self
  }
  return {
    mockClient: { from: vi.fn(() => makeChain()) },
    profileRef: { current: { id: 'u1' } as { id: string } | null },
    authStatusRef: { current: 'unauthenticated' as string },
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

import { useHealthSources } from '../useHealthSources'

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

describe('useHealthSources', () => {
  it('hasSources is false and not loading when unauthenticated', async () => {
    authStatusRef.current = 'unauthenticated'
    const { result } = renderHook(() => useHealthSources())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.hasSources).toBe(false)
    expect(result.current.sources).toEqual([])
  })

  it('maps rows and sets hasSources true when sources exist', async () => {
    listTerminal.data = [
      { id: 's1', profile_id: 'u1', source_type: 'oura', connected_at: '2026-06-01T00:00:00Z', last_sync_at: null },
    ]
    const { result } = renderHook(() => useHealthSources())
    await waitFor(() => expect(result.current.hasSources).toBe(true))
    expect(result.current.sources[0].source_type).toBe('oura')
  })

  it('hasSources stays false on query error', async () => {
    listTerminal.error = { message: 'nope' }
    const { result } = renderHook(() => useHealthSources())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.hasSources).toBe(false)
    expect(result.current.error).toBe('nope')
  })
})
