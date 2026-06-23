import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'

const { mockClient, profileRef, authStatusRef, queryTerminal } = vi.hoisted(() => {
  const terminal: { data: unknown; error: unknown } = { data: null, error: null }
  const makeChain = () => {
    const self: Record<string, unknown> = {
      select: vi.fn(() => self),
      eq: vi.fn(() => self),
      upsert: vi.fn(() => self),
      delete: vi.fn(() => self),
      maybeSingle: vi.fn(async () => terminal),
      // Make the builder awaitable so `await .delete().eq()` / `await .upsert()`
      // resolve to the shared terminal like the real Supabase client does.
      then: (resolve: (v: unknown) => unknown) => Promise.resolve(terminal).then(resolve),
    }
    return self
  }
  return {
    mockClient: {
      functions: { invoke: vi.fn() },
      from: vi.fn(() => makeChain()),
    },
    profileRef: { current: null as { id: string } | null },
    authStatusRef: { current: 'unauthenticated' as string },
    queryTerminal: terminal,
  }
})

vi.mock('@/lib/supabase', () => ({
  get supabase() {
    return mockClient
  },
  supabaseConfigured: true,
}))
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ profile: profileRef.current, status: authStatusRef.current }),
}))

import { useApiKey } from '../useApiKey'

beforeEach(() => {
  vi.clearAllMocks()
  profileRef.current = { id: 'u1' }
  authStatusRef.current = 'authenticated'
  queryTerminal.data = null
  queryTerminal.error = null
  mockClient.functions.invoke.mockReset()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useApiKey', () => {
  it('loads an existing active key into keyData', async () => {
    queryTerminal.data = {
      provider: 'google_ai',
      key_hint: '1234',
      status: 'active',
      last_validated_at: '2026-06-01T00:00:00Z',
    }
    const { result } = renderHook(() => useApiKey())
    await waitFor(() => expect(result.current.hasKey).toBe(true))
    expect(result.current.keyData?.provider).toBe('google_ai')
    expect(result.current.keyData?.keyHint).toBe('1234')
  })

  it('hasKey stays false when the row status is not active', async () => {
    queryTerminal.data = { provider: 'openai', key_hint: 'abcd', status: 'revoked', last_validated_at: null }
    const { result } = renderHook(() => useApiKey())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.hasKey).toBe(false)
  })

  it('saveKey returns false and sets an error when validation rejects the key', async () => {
    mockClient.functions.invoke.mockResolvedValue({
      data: { valid: false, error: 'Invalid API key' },
      error: null,
    })
    const { result } = renderHook(() => useApiKey())
    await waitFor(() => expect(result.current.loading).toBe(false))
    let ok = false
    await act(async () => {
      ok = await result.current.saveKey('bad-key', 'openai')
    })
    expect(ok).toBe(false)
    expect(result.current.error).toBe('Invalid API key')
    expect(mockClient.functions.invoke).toHaveBeenCalledWith('ai-validate-key', {
      body: { key: 'bad-key', provider: 'openai' },
    })
  })

  it('saveKey returns false when the validate edge function itself errors', async () => {
    mockClient.functions.invoke.mockResolvedValue({
      data: null,
      error: { message: 'Edge Function returned non-2xx' },
    })
    const { result } = renderHook(() => useApiKey())
    await waitFor(() => expect(result.current.loading).toBe(false))
    let ok = true
    await act(async () => {
      ok = await result.current.saveKey('k', 'anthropic')
    })
    expect(ok).toBe(false)
    expect(result.current.error).toMatch(/Edge Function returned non-2xx/)
  })

  it('saveKey validates and upserts on success, returning true', async () => {
    // Validation passes.
    mockClient.functions.invoke.mockResolvedValueOnce({
      data: { valid: true },
      error: null,
    })
    // Re-fetch after save returns the new key row.
    queryTerminal.data = {
      provider: 'google_ai',
      key_hint: 'wxyz',
      status: 'active',
      last_validated_at: '2026-06-23T00:00:00Z',
    }
    const { result } = renderHook(() => useApiKey())
    await waitFor(() => expect(result.current.loading).toBe(false))
    let ok = false
    await act(async () => {
      ok = await result.current.saveKey('AIza-test-key', 'google_ai')
    })
    expect(ok).toBe(true)
    expect(mockClient.functions.invoke).toHaveBeenCalledWith('ai-validate-key', {
      body: { key: 'AIza-test-key', provider: 'google_ai' },
    })
    expect(result.current.hasKey).toBe(true)
    expect(result.current.keyData?.keyHint).toBe('wxyz')
  })

  it('saveKey returns false when supabase is not configured / no profile', async () => {
    profileRef.current = null
    const { result } = renderHook(() => useApiKey())
    await waitFor(() => expect(result.current.loading).toBe(false))
    let ok = true
    await act(async () => {
      ok = await result.current.saveKey('k', 'google_ai')
    })
    expect(ok).toBe(false)
    expect(mockClient.functions.invoke).not.toHaveBeenCalled()
  })

  it('deleteKey clears the key on success', async () => {
    queryTerminal.data = {
      provider: 'google_ai',
      key_hint: 'wxyz',
      status: 'active',
      last_validated_at: null,
    }
    const { result } = renderHook(() => useApiKey())
    await waitFor(() => expect(result.current.hasKey).toBe(true))
    let ok = false
    await act(async () => {
      ok = await result.current.deleteKey()
    })
    expect(ok).toBe(true)
    expect(result.current.keyData).toBeNull()
    expect(result.current.hasKey).toBe(false)
  })

  it('deleteKey surfaces an error and returns false when the delete fails', async () => {
    queryTerminal.data = null
    queryTerminal.error = { message: 'delete failed' }
    const { result } = renderHook(() => useApiKey())
    await waitFor(() => expect(result.current.loading).toBe(false))
    let ok = true
    await act(async () => {
      ok = await result.current.deleteKey()
    })
    expect(ok).toBe(false)
    expect(result.current.error).toBe('delete failed')
  })
})