import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, renderHook, act, waitFor } from '@testing-library/react'
import type { Session } from '@supabase/supabase-js'
import type { ReactNode } from 'react'

const { mocks } = vi.hoisted(() => ({
  mocks: {
    isAuthConfigured: vi.fn(() => true),
    getCurrentSession: vi.fn(),
    ensureProfile: vi.fn(),
    subscribeToAuthChanges: vi.fn(() => null),
  },
}))

vi.mock('@/lib/auth', () => ({
  isAuthConfigured: mocks.isAuthConfigured,
  getCurrentSession: mocks.getCurrentSession,
  ensureProfile: mocks.ensureProfile,
  subscribeToAuthChanges: mocks.subscribeToAuthChanges,
}))

import { AuthProvider } from '../AuthProvider'
import { useAuth } from '@/hooks/useAuth'

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.isAuthConfigured.mockReturnValue(true)
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('AuthProvider', () => {
  it('exposes a loading status initially then unauthenticated when no session', async () => {
    mocks.getCurrentSession.mockResolvedValue(null)
    mocks.ensureProfile.mockResolvedValue(null)
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.status).toBe('loading')
    await waitFor(() => expect(result.current.status).toBe('unauthenticated'))
    expect(result.current.session).toBeNull()
    expect(result.current.profile).toBeNull()
  })

  it('becomes authenticated with an ensured profile when a session exists', async () => {
    const session = { access_token: 'abc' } as Session
    const profile = { id: 'u1', onboarding_completed: false }
    mocks.getCurrentSession.mockResolvedValue(session)
    mocks.ensureProfile.mockResolvedValue(profile)
    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.status).toBe('authenticated'))
    expect(result.current.session).toBe(session)
    expect(result.current.profile).toEqual(profile)
  })

  it('immediately marks as unauthenticated when auth is not configured', async () => {
    mocks.isAuthConfigured.mockReturnValue(false)
    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.status).toBe('unauthenticated'))
    expect(mocks.getCurrentSession).not.toHaveBeenCalled()
  })

  it('refresh re-reads the session and applies it', async () => {
    mocks.getCurrentSession
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ access_token: 'abc' } as Session)
    mocks.ensureProfile
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 'u1', onboarding_completed: true })
    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.status).toBe('unauthenticated'))
    await act(async () => {
      await result.current.refresh()
    })
    await waitFor(() => expect(result.current.status).toBe('authenticated'))
  })

  it('throws when useAuth is used outside the provider', () => {
    // Suppress the expected error noise.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => renderHook(() => useAuth())).toThrow(/useAuth must be inside AuthProvider/)
    spy.mockRestore()
  })

  it('exposes the configured flag from isAuthConfigured', () => {
    mocks.isAuthConfigured.mockReturnValue(true)
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.configured).toBe(true)
  })

  it('renders children', () => {
    mocks.getCurrentSession.mockResolvedValue(null)
    mocks.ensureProfile.mockResolvedValue(null)
    const { getByText } = render(
      <AuthProvider>
        <span>child-marker</span>
      </AuthProvider>
    )
    expect(getByText('child-marker')).toBeInTheDocument()
  })
})