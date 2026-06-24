import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'

const { mockClient, profileRef, authStatusRef, selectTerminal, writeTerminal } = vi.hoisted(() => {
  const selectTerminal: { data: unknown; error: unknown } = { data: null, error: null }
  const writeTerminal: { data: unknown; error: unknown } = { data: null, error: null }
  const makeChain = () => {
    const chain: Record<string, unknown> = {
      select: vi.fn(() => chain),
      eq: vi.fn(() => chain),
      order: vi.fn(() => chain),
      // select-lists resolve to selectTerminal when awaited.
      then: (resolve: (v: unknown) => unknown) => Promise.resolve(selectTerminal).then(resolve),
    }
    // upsert resolves to writeTerminal when awaited.
    chain.upsert = vi.fn(() => ({
      then: (resolve: (v: unknown) => unknown) => Promise.resolve(writeTerminal).then(resolve),
    }))
    return chain
  }
  return {
    mockClient: { from: vi.fn(() => makeChain()) },
    profileRef: { current: { id: 'u1' } as { id: string } | null },
    authStatusRef: { current: 'unauthenticated' as string },
    selectTerminal,
    writeTerminal,
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

import { useDashboardLayout } from '../useDashboardLayout'

const DEFAULT_KEYS = [
  'coach', 'recovery', 'connect_banner', 'metrics', 'level',
  'pmc_chart', 'weekly_load', 'sport_distribution',
  'today_session', 'quick_read', 'recent_activities',
]

beforeEach(() => {
  vi.clearAllMocks()
  profileRef.current = { id: 'u1' }
  authStatusRef.current = 'authenticated'
  selectTerminal.data = null
  selectTerminal.error = null
  writeTerminal.data = null
  writeTerminal.error = null
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useDashboardLayout', () => {
  it('seeds the default ordered layout when no rows are stored', async () => {
    selectTerminal.data = []
    const { result } = renderHook(() => useDashboardLayout())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.widgets.map((w) => w.widget_key)).toEqual(DEFAULT_KEYS)
    expect(result.current.widgets.every((w) => w.visible)).toBe(true)
    expect(result.current.customizeMode).toBe(false)
  })

  it('reads stored rows, sorts by position, and merges newly-introduced widgets', async () => {
    selectTerminal.data = [
      { widget_key: 'pmc_chart', position: 0, visible: false },
      { widget_key: 'coach', position: 1, visible: true },
    ]
    const { result } = renderHook(() => useDashboardLayout())
    await waitFor(() => expect(result.current.loading).toBe(false))
    const keys = result.current.widgets.map((w) => w.widget_key)
    expect(keys[0]).toBe('pmc_chart')
    expect(keys[1]).toBe('coach')
    // All default keys are present (missing ones appended after stored ones).
    for (const k of DEFAULT_KEYS) expect(keys).toContain(k)
    expect(result.current.widgets.find((w) => w.widget_key === 'pmc_chart')?.visible).toBe(false)
  })

  it('moveUp swaps a widget with the previous one and upserts the new order', async () => {
    selectTerminal.data = []
    const { result } = renderHook(() => useDashboardLayout())
    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => result.current.moveUp('recovery')) // swap coach <-> recovery

    await waitFor(() => expect(result.current.widgets[0].widget_key).toBe('recovery'))
    const keys = result.current.widgets.map((w) => w.widget_key)
    expect(keys[0]).toBe('recovery')
    expect(keys[1]).toBe('coach')
    // upsert was called to persist (mount select + at least one upsert).
    expect(mockClient.from.mock.calls.length).toBeGreaterThanOrEqual(2)
  })

  it('moveUp on the first widget is a no-op', async () => {
    selectTerminal.data = []
    const { result } = renderHook(() => useDashboardLayout())
    await waitFor(() => expect(result.current.loading).toBe(false))
    const before = result.current.widgets.map((w) => w.widget_key)
    act(() => result.current.moveUp('coach'))
    expect(result.current.widgets.map((w) => w.widget_key)).toEqual(before)
  })

  it('toggleVisible flips visibility and persists', async () => {
    selectTerminal.data = []
    const { result } = renderHook(() => useDashboardLayout())
    await waitFor(() => expect(result.current.loading).toBe(false))
    const before = result.current.widgets.find((w) => w.widget_key === 'level')?.visible
    act(() => result.current.toggleVisible('level'))
    expect(result.current.widgets.find((w) => w.widget_key === 'level')?.visible).toBe(!before)
  })

  it('sets an error when persisting fails', async () => {
    selectTerminal.data = []
    writeTerminal.error = { message: 'upsert failed' }
    const { result } = renderHook(() => useDashboardLayout())
    await waitFor(() => expect(result.current.loading).toBe(false))
    act(() => result.current.toggleVisible('level'))
    await waitFor(() => expect(result.current.error).toBe('upsert failed'))
  })

  it('returns defaults without loading when unauthenticated', async () => {
    authStatusRef.current = 'unauthenticated'
    const { result } = renderHook(() => useDashboardLayout())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.widgets.map((w) => w.widget_key)).toEqual(DEFAULT_KEYS)
  })
})
