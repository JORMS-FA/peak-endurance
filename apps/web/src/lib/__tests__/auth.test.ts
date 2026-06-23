import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Session, User } from '@supabase/supabase-js'

const { mockClient, configuredRef, queryBuilder, locationAssign, mockLocation } = vi.hoisted(() => {
  const configuredRef = { value: true }
  const auth = {
    getSession: vi.fn(),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signInWithOtp: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChange: vi.fn(),
    getUser: vi.fn(),
  }
  // Shared terminal that every chain resolves to.
  const terminal: { data: unknown; error: unknown } = { data: null, error: null }
  // A chainable query builder. Each chain method returns itself for fluent use,
  // and the terminating `maybeSingle()` resolves with the shared terminal.
  const chain = (): Record<string, (...args: unknown[]) => unknown> => {
    const self: Record<string, (...args: unknown[]) => unknown> = {
      select: vi.fn(() => self),
      eq: vi.fn(() => self),
      gte: vi.fn(() => self),
      order: vi.fn(() => self),
      limit: vi.fn(() => self),
      maybeSingle: vi.fn(async () => terminal),
      update: vi.fn(() => self),
      insert: vi.fn(() => self),
      upsert: vi.fn(() => self),
      delete: vi.fn(() => self),
    }
    return self
  }
  const queryBuilder = {
    reset: () => {
      terminal.data = null
      terminal.error = null
    },
    setTerminal: (next: { data: unknown; error: unknown }) => {
      terminal.data = next.data
      terminal.error = next.error
    },
    chain: () => chain(),
  }
  const mockClient = {
    auth,
    functions: { invoke: vi.fn() },
    from: vi.fn(() => queryBuilder.chain()),
  }
  const fakeLocation = {
    assign: vi.fn(),
    replace: vi.fn(),
    href: '',
    origin: 'https://test.peak-endurance.app',
  }
  return {
mockClient,
  configuredRef,
  queryBuilder,
  locationAssign: fakeLocation.assign,
  mockLocation: fakeLocation as unknown as Location,
}
})

vi.mock('../supabase', () => ({
  get supabase() {
    return configuredRef.value ? mockClient : null
  },
  get supabaseConfigured() {
    return configuredRef.value
  },
}))

const {
  isAuthConfigured,
  getCurrentSession,
  signInWithPassword,
  signUpWithPassword,
  signOut,
  subscribeToAuthChanges,
  ensureProfile,
} = await import('../auth')

let locationGetterSpy: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  configuredRef.value = true
  queryBuilder.reset()
  mockClient.auth.getSession.mockReset()
  mockClient.auth.signInWithPassword.mockReset()
  mockClient.auth.signUp.mockReset()
  mockClient.auth.signOut.mockReset()
  mockClient.auth.onAuthStateChange.mockReset()
  mockClient.from.mockReset()
  locationAssign.mockReset()
  // Return the same stable mock location object on every access so the
  // `assign` spy persists across reads.
  locationGetterSpy = vi.spyOn(window, 'location', 'get').mockReturnValue(mockLocation)
})

afterEach(() => {
  vi.restoreAllMocks()
})

function fakeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2026-01-01T00:00:00Z',
    email: 'athlete@test.com',
    ...overrides,
  } as unknown as User
}

describe('isAuthConfigured', () => {
  it('is true when supabase is configured and present', () => {
    configuredRef.value = true
    expect(isAuthConfigured()).toBe(true)
  })

  it('is false when supabase is null', () => {
    configuredRef.value = false
    expect(isAuthConfigured()).toBe(false)
  })
})

describe('getCurrentSession', () => {
  it('returns the session when present', async () => {
    const session = { access_token: 'abc' } as Session
    mockClient.auth.getSession.mockResolvedValue({ data: { session }, error: null })
    await expect(getCurrentSession()).resolves.toBe(session)
  })

  it('returns null on error and warns', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mockClient.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: { message: 'boom' },
    })
    await expect(getCurrentSession()).resolves.toBeNull()
    expect(warn).toHaveBeenCalled()
  })

  it('returns null when supabase is not configured', async () => {
    configuredRef.value = false
    await expect(getCurrentSession()).resolves.toBeNull()
  })
})

describe('signOut', () => {
  it('calls supabase.auth.signOut', async () => {
    mockClient.auth.signOut.mockResolvedValue({ error: null })
    await signOut()
    expect(mockClient.auth.signOut).toHaveBeenCalledTimes(1)
  })

  it('warns but does not throw on signOut error', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mockClient.auth.signOut.mockResolvedValue({ error: { message: 'nope' } })
    await expect(signOut()).resolves.toBeUndefined()
    expect(warn).toHaveBeenCalled()
  })

  it('is a no-op when supabase is not configured', async () => {
    configuredRef.value = false
    await signOut()
    expect(mockClient.auth.signOut).not.toHaveBeenCalled()
  })
})

describe('signInWithPassword validation', () => {
  it('rejects empty email', async () => {
    const res = await signInWithPassword('', 'password123')
    expect(res.ok).toBe(false)
    expect(res.ok ? true : res.message).toMatch(/correo/i)
  })

  it('rejects an invalid email format', async () => {
    const res = await signInWithPassword('not-an-email', 'password123')
    expect(res.ok).toBe(false)
    expect(res.ok ? true : res.message).toMatch(/formato/)
  })

  it('rejects a password shorter than 6 characters', async () => {
    const res = await signInWithPassword('a@b.com', '12345')
    expect(res.ok).toBe(false)
    expect(res.ok ? true : res.message).toMatch(/contraseña/i)
  })

  it('normalises email to lowercase before calling supabase', async () => {
    mockClient.auth.signInWithPassword.mockResolvedValue({
      data: { session: { access_token: 'x' } as Session },
      error: null,
    })
    await signInWithPassword('Athlete@Test.com', 'password123')
    expect(mockClient.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'athlete@test.com',
      password: 'password123',
    })
  })

  it('redirects to /app and returns ok on success', async () => {
    mockClient.auth.signInWithPassword.mockResolvedValue({
      data: { session: { access_token: 'x' } as Session },
      error: null,
    })
    const res = await signInWithPassword('a@b.com', 'password123')
    expect(res.ok).toBe(true)
    if (res.ok) expect(res.mode).toBe('session')
    expect(locationAssign).toHaveBeenCalledWith('/app')
  })

  it('maps "invalid login credentials" to a friendly message and does not redirect', async () => {
    mockClient.auth.signInWithPassword.mockResolvedValue({
      data: { session: null },
      error: { message: 'Invalid login credentials' },
    })
    const res = await signInWithPassword('a@b.com', 'password123')
    expect(res.ok).toBe(false)
    expect(res.ok ? '' : res.message).toMatch(/incorrectos/i)
    expect(locationAssign).not.toHaveBeenCalled()
  })

  it('maps "email not confirmed" to a confirmation message', async () => {
    mockClient.auth.signInWithPassword.mockResolvedValue({
      data: { session: null },
      error: { message: 'Email not confirmed' },
    })
    const res = await signInWithPassword('a@b.com', 'password123')
    expect(res.ok ? '' : res.message).toMatch(/confirm/i)
  })

  it('maps rate-limit errors to a wait message', async () => {
    mockClient.auth.signInWithPassword.mockResolvedValue({
      data: { session: null },
      error: { message: 'Rate limit exceeded' },
    })
    const res = await signInWithPassword('a@b.com', 'password123')
    expect(res.ok ? '' : res.message).toMatch(/espera/i)
  })

  it('returns a not-configured message when supabase is null', async () => {
    configuredRef.value = false
    const res = await signInWithPassword('a@b.com', 'password123')
    expect(res.ok).toBe(false)
    expect(res.ok ? '' : res.message).toMatch(/supabase/i)
  })
})

describe('signUpWithPassword', () => {
  it('redirects immediatamente when an instant session is returned', async () => {
    mockClient.auth.signUp.mockResolvedValue({
      data: { session: { access_token: 'x' } as Session, user: fakeUser() },
      error: null,
    })
    const res = await signUpWithPassword('a@b.com', 'password123')
    expect(res.ok).toBe(true)
    expect(locationAssign).toHaveBeenCalledWith('/app')
  })

  it('falls back to sign-in and surfaces a confirmation message when email is not confirmed', async () => {
    mockClient.auth.signUp.mockResolvedValue({
      data: { session: null, user: fakeUser() },
      error: null,
    })
    mockClient.auth.signInWithPassword.mockResolvedValue({
      data: { session: null },
      error: { message: 'Email not confirmed' },
    })
    const res = await signUpWithPassword('a@b.com', 'password123')
    expect(res.ok).toBe(false)
    expect(res.ok ? '' : res.message).toMatch(/confirm/i)
  })

  it('rejects validation errors the same as sign-in', async () => {
    const res = await signUpWithPassword('bad', 'password123')
    expect(res.ok).toBe(false)
  })

  it('maps "user already registered"', async () => {
    mockClient.auth.signUp.mockResolvedValue({
      data: { session: null, user: null },
      error: { message: 'User already registered' },
    })
    const res = await signUpWithPassword('a@b.com', 'password123')
    expect(res.ok ? '' : res.message).toMatch(/ya existe/i)
  })
})

describe('ensureProfile', () => {
  it('returns the existing profile without touching onboarding_completed', async () => {
    queryBuilder.setTerminal({
      data: {
        id: 'user-1',
        email: 'athlete@test.com',
        display_name: 'Runner',
        avatar_url: null,
        created_at: '2026-01-01T00:00:00Z',
        onboarding_completed: true,
      },
      error: null,
    })
    const profile = await ensureProfile(fakeUser())
    expect(profile?.id).toBe('user-1')
    expect(profile?.onboarding_completed).toBe(true)
  })

  it('creates a new profile when none exists', async () => {
    // first maybeSingle (select) returns null, second (insert) returns a row.
    let call = 0
    mockClient.from.mockImplementation(() => {
      call++
      const chain = queryBuilder.chain()
      // Make maybeSingle resolve with different data per call.
      chain.maybeSingle = vi.fn(async () => {
        if (call === 1) {
          return { data: null, error: null }
        }
        return {
          data: {
            id: 'user-1',
            email: 'athlete@test.com',
            display_name: 'athlete',
            avatar_url: null,
            created_at: '2026-06-23T00:00:00Z',
            onboarding_completed: false,
          },
          error: null,
        }
      }) as unknown as typeof chain.maybeSingle
      return chain
    })
    const profile = await ensureProfile(fakeUser({ email: 'athlete@test.com' }))
    expect(profile?.email).toBe('athlete@test.com')
    expect(profile?.onboarding_completed).toBe(false)
  })

  it('returns a fallback profile when the insert errors out', async () => {
    let call = 0
    mockClient.from.mockImplementation(() => {
      call++
      const chain = queryBuilder.chain()
      chain.maybeSingle = vi.fn(async () => {
        if (call === 1) return { data: null, error: null }
        return { data: null, error: { message: 'insert failed' } }
      }) as unknown as typeof chain.maybeSingle
      return chain
    })
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const profile = await ensureProfile(fakeUser())
    expect(profile?.id).toBe('user-1')
    expect(warn).toHaveBeenCalled()
  })

  it('returns null when supabase is not configured', async () => {
    configuredRef.value = false
    await expect(ensureProfile(fakeUser())).resolves.toBeNull()
  })
})

describe('subscribeToAuthChanges', () => {
  it('returns a subscription handle whose unsubscribe is forwarded', () => {
    const unsub = vi.fn()
    mockClient.auth.onAuthStateChange.mockImplementation((cb: (e: unknown, s: unknown) => void) => {
      // Simulate firing once with a session (event, session).
      cb('SIGNED_IN', { access_token: 'x' })
      return { data: { subscription: { unsubscribe: unsub } } }
    })
    const seen: unknown[] = []
    const sub = subscribeToAuthChanges((s) => seen.push(s))
    expect(seen[0]).toEqual({ access_token: 'x' })
    sub?.unsubscribe()
    expect(unsub).toHaveBeenCalled()
  })

  it('returns null when supabase is not configured', () => {
    configuredRef.value = false
    expect(subscribeToAuthChanges(() => {})).toBeNull()
  })
})