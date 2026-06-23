import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

const { mocks } = vi.hoisted(() => ({
  mocks: {
    useI18n: vi.fn(),
    useStravaConnection: vi.fn(),
    useStravaConnect: vi.fn(),
    useStravaDisconnect: vi.fn(),
    useStravaSync: vi.fn(),
  },
}))

vi.mock('@/hooks/useI18n', () => ({ useI18n: mocks.useI18n }))
vi.mock('@/hooks/useStrava', () => ({
  useStravaConnection: mocks.useStravaConnection,
  useStravaConnect: mocks.useStravaConnect,
  useStravaDisconnect: mocks.useStravaDisconnect,
  useStravaSync: mocks.useStravaSync,
}))
vi.mock('@/components/ui/BrandIcon', () => ({
  BrandIcon: ({ name }: { name: string }) => (
    <div data-testid={`brand-${name}`} />
  ),
}))

import { Connections } from '../Connections'

function setup(opts: {
  connected?: boolean
  statusLoading?: boolean
  connecting?: boolean
  connectError?: string | null
  syncing?: boolean
  disconnecting?: boolean
  initialSearch?: string
} = {}) {
  const universe = {
    connected: opts.connected ?? false,
    statusLoading: opts.statusLoading ?? false,
    connecting: opts.connecting ?? false,
    connectError: opts.connectError ?? null,
    syncing: opts.syncing ?? false,
    disconnecting: opts.disconnecting ?? false,
  }
  const refetch = vi.fn()
  const connect = vi.fn(async () => {
    universe.connecting = false
  })
  const disconnect = vi.fn()
  const sync = vi.fn(async () => ({ synced: 0, skipped: 0, total: 0, since: '' }))

  mocks.useI18n.mockReturnValue({ t: (k: string) => k, language: 'es' })
  mocks.useStravaConnection.mockReturnValue({
    status: universe.connected
      ? { connected: true, athlete: { id: '1', name: 'Runner' }, expiresAt: '2026-12-31T00:00:00Z' }
      : { connected: false, athlete: null },
    loading: universe.statusLoading,
    error: null,
    refetch,
  })
  mocks.useStravaConnect.mockReturnValue({
    connect,
    loading: universe.connecting,
    error: universe.connectError,
  })
  mocks.useStravaDisconnect.mockReturnValue({
    disconnect,
    loading: universe.disconnecting,
    error: null,
  })
  mocks.useStravaSync.mockReturnValue({
    sync,
    loading: universe.syncing,
    result: null,
    error: null,
  })

  const initialEntry = opts.initialSearch ? `/connections?${opts.initialSearch}` : '/connections'
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Connections />
    </MemoryRouter>,
  )
  return { connect, disconnect, sync, refetch }
}

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
})

function heading() {
  return screen.getByRole('heading', { name: /^connections$/i })
}

describe('Connections page', () => {
  it('renders the page heading and the Strava primary card', () => {
    setup()
    expect(heading()).toBeInTheDocument()
    expect(screen.getByText('Strava')).toBeInTheDocument()
  })

  it('shows the "not connected" status and a Connect button when Strava is not connected', () => {
    setup({ connected: false })
    expect(screen.getByText('notConnected')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /connectStrava/i })).toBeEnabled()
  })

  it('shows the connected status with the athlete name when connected', () => {
    setup({ connected: true })
    expect(screen.getByText(/connected/i)).toBeInTheDocument()
    expect(screen.getByText(/Runner/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /syncNow/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /disconnect/i })).toBeInTheDocument()
  })

  it('clicking Connect triggers the connect handler', async () => {
    const user = userEvent.setup()
    const { connect } = setup({ connected: false })
    await user.click(screen.getByRole('button', { name: /connectStrava/i }))
    expect(connect).toHaveBeenCalledTimes(1)
  })

  it('clicking Sync triggers a 60-day sync', async () => {
    const user = userEvent.setup()
    const { sync } = setup({ connected: true })
    await user.click(screen.getByRole('button', { name: /syncNow/i }))
    expect(sync).toHaveBeenCalledWith(60)
  })

  it('clicking Disconnect triggers the disconnect handler', async () => {
    const user = userEvent.setup()
    const { disconnect } = setup({ connected: true })
    await user.click(screen.getByRole('button', { name: /disconnect/i }))
    expect(disconnect).toHaveBeenCalledTimes(1)
  })

  it('shows the "checking status" label while status is loading', () => {
    setup({ statusLoading: true })
    expect(screen.getByText('checkingStatus')).toBeInTheDocument()
  })

  it('shows the redirecting label and disables the button while connecting', () => {
    setup({ connected: false, connecting: true })
    const btn = screen.getByRole('button', { name: /redirecting/i })
    expect(btn).toBeDisabled()
  })

  it('surfaces a connect error message', () => {
    setup({ connected: false, connectError: 'Edge Function returned non-2xx' })
    expect(screen.getByText(/Edge Function returned non-2xx/)).toBeInTheDocument()
  })

  it('renders the secondary "coming soon" sources', () => {
    setup()
    expect(screen.getByText('comingSoonSources')).toBeInTheDocument()
    expect(screen.getByText('Garmin Connect')).toBeInTheDocument()
    expect(screen.getByText('COROS')).toBeInTheDocument()
    expect(screen.getByText('Wahoo')).toBeInTheDocument()
    // All coming-soon buttons are disabled.
    const soonButtons = screen
      .getAllByRole('button', { name: /^comingSoon$/i })
      .filter((b) => b.tagName === 'BUTTON')
    expect(soonButtons.length).toBeGreaterThan(0)
    for (const btn of soonButtons) expect(btn).toBeDisabled()
  })

  it('shows the success banner and auto-syncs on the post-OAuth callback (?strava=success)', async () => {
    const { sync, refetch } = setup({ connected: false, initialSearch: 'strava=success' })
    expect(screen.getByText('stravaConnectedSuccess')).toBeInTheDocument()
    await waitFor(() => expect(refetch).toHaveBeenCalled())
    expect(sync).toHaveBeenCalledWith(60)
  })
})