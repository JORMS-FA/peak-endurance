import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

const { mocks } = vi.hoisted(() => ({
  mocks: {
    useI18n: vi.fn(),
    useTheme: vi.fn(),
    useAuth: vi.fn(),
    startStravaLogin: vi.fn(),
    supabaseClient: { auth: { signInWithOtp: vi.fn(), signInWithOAuth: vi.fn() } },
  },
}))

vi.mock('@/hooks/useI18n', () => ({ useI18n: mocks.useI18n }))
vi.mock('@/hooks/useTheme', () => ({ useTheme: mocks.useTheme }))
vi.mock('@/hooks/useAuth', () => ({ useAuth: mocks.useAuth }))
vi.mock('@/lib/supabase', () => ({
  supabase: mocks.supabaseClient,
  supabaseConfigured: true,
}))
vi.mock('@/lib/strava', () => ({ startStravaLogin: mocks.startStravaLogin }))
vi.mock('@/components/ui/LavaBackground', () => ({
  LavaBackground: () => <div data-testid="lava-bg" />,
}))
vi.mock('@/components/ui/Logo', () => ({
  Logo: ({ size }: { size?: number }) => (
    <div data-testid="logo" data-size={size ?? 0} />
  ),
}))

import { AuthScreen } from '../AuthScreen'

function setup(overrides: Partial<{
  configured: boolean
  language: 'es' | 'en'
}> = {}) {
  const setLanguage = vi.fn()
  const language = overrides.language ?? 'es'
  mocks.useI18n.mockReturnValue({
    // Return the key verbatim so tests can assert by translation key.
    t: (key: string) => key,
    language,
  })
  mocks.useTheme.mockReturnValue({ setLanguage, language })
  mocks.useAuth.mockReturnValue({ configured: overrides.configured ?? true })
  render(
    <MemoryRouter>
      <AuthScreen />
    </MemoryRouter>
  )
  return { setLanguage }
}

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('AuthScreen', () => {
  it('renders the brand logo and the auth title/subtitle', () => {
    setup()
    expect(screen.getAllByTestId('logo')).toHaveLength(2)
    expect(screen.getByText('authTitle')).toBeInTheDocument()
    expect(screen.getByText('authSubtitle')).toBeInTheDocument()
  })

  it('shows the not-configured warning and env var hints when auth is not configured', () => {
    setup({ configured: false })
    expect(screen.getByText('notConfigured')).toBeInTheDocument()
    expect(screen.getByText('VITE_SUPABASE_URL')).toBeInTheDocument()
    expect(screen.getByText('VITE_SUPABASE_ANON_KEY')).toBeInTheDocument()
  })

  it('renders the Strava login button when configured', () => {
    setup({ configured: true })
    expect(
      screen.getByRole('button', { name: /continuar con strava/i }),
    ).toBeInTheDocument()
  })

  it('renders the Google login button when configured', () => {
    setup({ configured: true })
    expect(
      screen.getByRole('button', { name: /continuar con google/i }),
    ).toBeInTheDocument()
  })

  it('exposes a language switcher that calls setLanguage with the new value', async () => {
    const user = userEvent.setup()
    const { setLanguage } = setup()
    const select = screen.getByRole('combobox')
    await user.selectOptions(select, 'en')
    expect(setLanguage).toHaveBeenCalledWith('en')
  })

  it('surfaces a friendly error when starting Strava OAuth fails', async () => {
    const user = userEvent.setup()
    mocks.startStravaLogin.mockRejectedValue(new Error('Edge Function returned non-2xx'))
    setup({ configured: true })
    await user.click(screen.getByRole('button', { name: /continuar con strava/i }))
    expect(await screen.findByText(/Edge Function returned non-2xx/)).toBeInTheDocument()
  })

  it('shows the email unfold button when configured', () => {
    setup({ configured: true })
    expect(
      screen.getByRole('button', { name: /usar correo/i }),
    ).toBeInTheDocument()
  })
})