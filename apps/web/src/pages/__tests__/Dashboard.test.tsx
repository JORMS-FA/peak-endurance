import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import type { ReactNode } from 'react'

const { mocks } = vi.hoisted(() => ({
  mocks: {
    useI18n: vi.fn(),
    useAuth: vi.fn(),
    useDashboardMetrics: vi.fn(),
    useTodaySession: vi.fn(),
    useStravaConnection: vi.fn(),
    useHealthSources: vi.fn(),
    useHealthMetrics: vi.fn(),
    useDashboardLayout: vi.fn(),
  },
}))

vi.mock('@/hooks/useI18n', () => ({ useI18n: mocks.useI18n }))
vi.mock('@/hooks/useAuth', () => ({ useAuth: mocks.useAuth }))
vi.mock('@/hooks/useDashboardMetrics', () => ({ useDashboardMetrics: mocks.useDashboardMetrics }))
vi.mock('@/hooks/useTodaySession', () => ({ useTodaySession: mocks.useTodaySession }))
vi.mock('@/hooks/useStrava', () => ({ useStravaConnection: mocks.useStravaConnection }))
vi.mock('@/hooks/useHealthSources', () => ({ useHealthSources: mocks.useHealthSources }))
vi.mock('@/hooks/useHealthMetrics', () => ({ useHealthMetrics: mocks.useHealthMetrics }))
vi.mock('@/hooks/useDashboardLayout', () => ({ useDashboardLayout: mocks.useDashboardLayout }))
vi.mock('@/components/ui/AnimatedNumber', () => ({
  AnimatedNumber: ({ value }: { value: number | string }) => (
    <span data-testid="an">{String(value)}</span>
  ),
}))
vi.mock('@/components/ui/SportIcon', () => ({
  SportIcon: ({ sport }: { sport: string }) => <span data-testid={`sport-${sport}`} />,
  SPORT_COLORS: { run: '#f00', bike: '#0f0', swim: '#00f', other: '#888' },
}))
vi.mock('@/components/ui/LevelCard', () => ({
  LevelCard: () => <div data-testid="level-card" />,
}))
// recharts needs a measurable container; stub ResponsiveContainer to render its
// single child so we can assert chart presence without measuring DOM.
vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts')
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: ReactNode }) => (
      <div data-testid="responsive-container">{children}</div>
    ),
  }
})

import { Dashboard } from '../Dashboard'

const DEFAULT_WIDGET_KEYS = [
  'coach', 'recovery', 'connect_banner', 'metrics', 'level',
  'pmc_chart', 'weekly_load', 'sport_distribution',
  'today_session', 'quick_read', 'recent_activities',
] as const

function defaultLayout(customizeMode = false) {
  return {
    widgets: DEFAULT_WIDGET_KEYS.map((widget_key, i) => ({ widget_key, position: i, visible: true })),
    loading: false,
    error: null,
    customizeMode,
    setCustomizeMode: vi.fn(),
    moveUp: vi.fn(),
    moveDown: vi.fn(),
    toggleVisible: vi.fn(),
    refetch: vi.fn(),
  }
}

function setup(opts: {
  hasData?: boolean
  loading?: boolean
  stravaConnected?: boolean
  stravaLoading?: boolean
  today?: object | null
  todayLoading?: boolean
  hasSources?: boolean
  hasToday?: boolean
  healthToday?: object | null
  customizeMode?: boolean
} = {}) {
  const hasData = opts.hasData ?? false
  const loading = opts.loading ?? false
  const stravaConnected = opts.stravaConnected ?? false
  const hasSources = opts.hasSources ?? false
  const hasToday = opts.hasToday ?? false

  mocks.useI18n.mockReturnValue({ t: (k: string) => k, language: 'es' })
  mocks.useAuth.mockReturnValue({
    profile: { id: 'u1', display_name: 'Ana Runner', onboarding_completed: true },
  })
  mocks.useDashboardMetrics.mockReturnValue({
    metrics: {
      ctl: 42,
      atl: 30,
      tsb: 12,
      formPct: 60,
      weeklyTss: 250,
      weeklyHours: 6.5,
      weeklyDistance: 42.0,
      daily: [],
      weeklySeries: [],
      recent: hasData
        ? [
            {
              id: 'a1',
              date: '2026-06-23',
              title: 'Long Run',
              sport: 'run',
              duration_minutes: 90,
              distance_km: 15.0,
              tss: 120,
              avg_hr: 145,
            },
          ]
        : [],
    },
    loading,
    error: null,
    hasData,
    refetch: vi.fn(),
  })
  mocks.useTodaySession.mockReturnValue({
    data: opts.today ?? null,
    loading: opts.todayLoading ?? false,
    error: null,
    refetch: vi.fn(),
  })
  mocks.useStravaConnection.mockReturnValue({
    status: stravaConnected ? { connected: true, athlete: null } : null,
    loading: opts.stravaLoading ?? false,
    error: null,
    refetch: vi.fn(),
  })
  mocks.useHealthSources.mockReturnValue({
    sources: hasSources ? [{ id: 's1', profile_id: 'u1', source_type: 'oura' }] : [],
    hasSources,
    loading: false,
    error: null,
    refetch: vi.fn(),
  })
  mocks.useHealthMetrics.mockReturnValue({
    today: hasToday ? (opts.healthToday ?? { recovery_pct: 82, sleep_hours: 7.2, hrv_ms: 58 }) : null,
    latest: null,
    hasToday,
    loading: false,
    error: null,
    refetch: vi.fn(),
  })
  mocks.useDashboardLayout.mockReturnValue(defaultLayout(opts.customizeMode ?? false))

  return render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('Dashboard', () => {
  it('greets the athlete by first name in the coach card', () => {
    setup({ hasData: true, stravaConnected: true })
    expect(screen.getByText(/BUENOS DÍAS.*ANA/i)).toBeInTheDocument()
  })

  it('shows the onboarding card (not "--") when Strava is not connected and there is no data', () => {
    setup({ hasData: false, stravaConnected: false, loading: false })
    expect(screen.getByText('onboardingTitle')).toBeInTheDocument()
    expect(screen.getByText('onboardingSubtitle')).toBeInTheDocument()
    // The connect CTA links to the connections page.
    expect(screen.getByText('connectStrava')).toBeInTheDocument()
  })

  it('shows the syncing state when Strava is connected but no data yet', () => {
    setup({ hasData: false, stravaConnected: true, loading: false })
    expect(screen.getByText('syncingTitle')).toBeInTheDocument()
    expect(screen.getByText('syncingSubtitle')).toBeInTheDocument()
  })

  it('renders the four PMC metric cards with numeric values when data exists', () => {
    setup({ hasData: true, stravaConnected: true, loading: false })
    expect(screen.getByText('mForma')).toBeInTheDocument()
    expect(screen.getByText('mCarga')).toBeInTheDocument()
    expect(screen.getByText('mAptitud')).toBeInTheDocument()
    expect(screen.getByText('mFatiga')).toBeInTheDocument()
    // Numeric metric values are rendered via the AnimatedNumber stub.
    const numbers = screen.getAllByTestId('an').map((n) => n.textContent)
    expect(numbers).toContain('60') // formPct
    expect(numbers).toContain('250') // weeklyTss
    expect(numbers).toContain('42') // ctl
    expect(numbers).toContain('30') // atl
  })

  it('does NOT render the onboarding card when data exists', () => {
    setup({ hasData: true, stravaConnected: true, loading: false })
    expect(screen.queryByText('onboardingTitle')).not.toBeInTheDocument()
    expect(screen.queryByText('syncingTitle')).not.toBeInTheDocument()
  })

  it('shows the connect-Strava banner when not connected and not in onboarding-only state', () => {
    // hasData true keeps showOnboarding false, so the banner is shown instead.
    setup({ hasData: true, stravaConnected: false, loading: false })
    expect(screen.getByText('connectStravaTitle')).toBeInTheDocument()
  })

  it('renders the recent activities list when data exists', () => {
    setup({ hasData: true, stravaConnected: true, loading: false })
    expect(screen.getByText('Long Run')).toBeInTheDocument()
  })

  it('shows an empty recent activities state with the connect hint when nothing is connected', () => {
    setup({ hasData: true, stravaConnected: false, loading: false })
    // Empty recent list shows a connect-source hint.
    expect(screen.getByText('connectSource')).toBeInTheDocument()
  })

  it('renders the gamification LevelCard', () => {
    setup({ hasData: true, stravaConnected: true, loading: false })
    expect(screen.getByTestId('level-card')).toBeInTheDocument()
  })

  it('renders today\'s session when one is scheduled', () => {
    setup({
      hasData: true,
      stravaConnected: true,
      today: {
        id: 's1',
        title: 'Tempo Run',
        sport: 'run',
        duration_minutes: 45,
        intensity: 'high',
        status: 'planned',
        notes: '4x1k',
      },
    })
    expect(screen.getByText('Tempo Run')).toBeInTheDocument()
    expect(screen.getByText(/45 min/i)).toBeInTheDocument()
  })

  it('shows the no-session empty state when no session is scheduled today', () => {
    setup({ hasData: true, stravaConnected: true, today: null, todayLoading: false })
    expect(screen.getByText('noSessionToday')).toBeInTheDocument()
  })

  // ── Recovery gating (Energy Ring) ────────────────────────────────────────
  it('shows the recovery locked state (no fake numbers) when no health source is connected', () => {
    setup({ hasData: true, stravaConnected: true, hasSources: false })
    expect(screen.getByText('recoveryLockedTitle')).toBeInTheDocument()
    expect(screen.getByText('recoveryLockedCta')).toBeInTheDocument()
    expect(screen.getByText('connectHealth')).toBeInTheDocument()
    // The hardcoded fake values must NOT appear when locked.
    expect(screen.queryByText('7.2h')).not.toBeInTheDocument()
    expect(screen.queryByText('58ms')).not.toBeInTheDocument()
  })

  it('shows the syncing state when a health source is connected but today has no metric', () => {
    setup({ hasData: true, stravaConnected: true, hasSources: true, hasToday: false })
    expect(screen.getByText('recoverySyncingToday')).toBeInTheDocument()
  })

  it('shows real recovery values when a health source has today metrics', () => {
    setup({
      hasData: true,
      stravaConnected: true,
      hasSources: true,
      hasToday: true,
      healthToday: { recovery_pct: 82, sleep_hours: 7.2, hrv_ms: 58 },
    })
    expect(screen.getAllByText('82%').length).toBeGreaterThan(0)
    expect(screen.getByText('7.2h')).toBeInTheDocument()
    expect(screen.getByText('58ms')).toBeInTheDocument()
  })

  // ── Dashboard customization ──────────────────────────────────────────────
  it('renders the Customize button when data exists', () => {
    setup({ hasData: true, stravaConnected: true })
    expect(screen.getByRole('button', { name: /customize/i })).toBeInTheDocument()
  })

  it('calls setCustomizeMode when the Customize button is clicked', async () => {
    const user = userEvent.setup()
    setup({ hasData: true, stravaConnected: true, customizeMode: false })
    await user.click(screen.getByRole('button', { name: /customize/i }))
    expect(mocks.useDashboardLayout.mock.results[0].value.setCustomizeMode).toHaveBeenCalled()
  })

  it('shows per-widget reorder/visibility controls when customize mode is on', () => {
    setup({ hasData: true, stravaConnected: true, customizeMode: true })
    // moveUp / moveDown / hideWidget aria-labels come from the WidgetFrame controls.
    expect(screen.getAllByLabelText('moveUp').length).toBeGreaterThan(0)
    expect(screen.getAllByLabelText('moveDown').length).toBeGreaterThan(0)
    expect(screen.getAllByLabelText('hideWidget').length).toBeGreaterThan(0)
    // The hint is shown while customizing.
    expect(screen.getByText('customizeHint')).toBeInTheDocument()
  })
})