import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

const { mocks } = vi.hoisted(() => ({
  mocks: {
    useAuth: vi.fn(),
  },
}))

vi.mock('@/hooks/useAuth', () => ({
  useAuth: mocks.useAuth,
}))

// Stub Onboarding so AuthGuard's onboarding branch renders a marker instead of
// pulling in its own dependency tree.
vi.mock('@/pages/Onboarding', () => ({
  Onboarding: () => <div data-testid="onboarding-stub">onboarding</div>,
}))

import { AuthGuard } from '../AuthGuard'

function renderAt(path: string, children: ReactNode = <span>protected</span>) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/app" element={<AuthGuard>{children}</AuthGuard>} />
        <Route path="/login" element={<span>login-page</span>} />
      </Routes>
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
})

describe('AuthGuard', () => {
  it('shows the loading spinner while status is loading', () => {
    mocks.useAuth.mockReturnValue({ status: 'loading', configured: true, profile: null })
    renderAt('/app')
    expect(screen.getByText('Cargando...')).toBeInTheDocument()
    expect(screen.queryByText('protected')).not.toBeInTheDocument()
  })

  it('redirects to /login when not authenticated', () => {
    mocks.useAuth.mockReturnValue({ status: 'unauthenticated', configured: true, profile: null })
    renderAt('/app')
    expect(screen.getByText('login-page')).toBeInTheDocument()
    expect(screen.queryByText('protected')).not.toBeInTheDocument()
  })

  it('redirects to /login when auth is not configured', () => {
    mocks.useAuth.mockReturnValue({ status: 'authenticated', configured: false, profile: null })
    renderAt('/app')
    expect(screen.getByText('login-page')).toBeInTheDocument()
  })

  it('renders the onboarding screen when profile onboarding is incomplete', () => {
    mocks.useAuth.mockReturnValue({
      status: 'authenticated',
      configured: true,
      profile: { id: 'u1', onboarding_completed: false },
    })
    renderAt('/app')
    expect(screen.getByTestId('onboarding-stub')).toBeInTheDocument()
    expect(screen.queryByText('protected')).not.toBeInTheDocument()
  })

  it('renders children when authenticated and onboarding is complete', () => {
    mocks.useAuth.mockReturnValue({
      status: 'authenticated',
      configured: true,
      profile: { id: 'u1', onboarding_completed: true },
    })
    renderAt('/app')
    expect(screen.getByText('protected')).toBeInTheDocument()
  })

  it('renders children when the per-user onboarding-done flag is set in localStorage', () => {
    localStorage.setItem('peak_onboarding_done_u1', '1')
    mocks.useAuth.mockReturnValue({
      status: 'authenticated',
      configured: true,
      profile: { id: 'u1', onboarding_completed: false },
    })
    renderAt('/app')
    expect(screen.getByText('protected')).toBeInTheDocument()
    expect(screen.queryByTestId('onboarding-stub')).not.toBeInTheDocument()
  })
})