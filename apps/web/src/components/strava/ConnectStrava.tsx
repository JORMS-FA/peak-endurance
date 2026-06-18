import { useEffect, useState, useCallback } from 'react'
import { ExternalLink, CheckCircle, RefreshCw, Loader2, AlertCircle } from 'lucide-react'
import { getStravaAuthUrl, getStravaStatus, refreshStravaToken, type StravaConnectionStatus } from '../../lib/strava'
import { useAuth } from '../../hooks/useAuth'
import { t } from '../../lib/i18n'

type Props = {
  copy: (key: Parameters<typeof t>[1]) => string
  onConnected?: () => void
}

type ViewState =
  | { type: 'loading' }
  | { type: 'idle' }
  | { type: 'connecting' }
  | { type: 'connected'; status: StravaConnectionStatus }
  | { type: 'error'; message: string }

export function ConnectStrava({ copy, onConnected }: Props) {
  const { configured } = useAuth()
  const [view, setView] = useState<ViewState>({ type: 'loading' })
  const [refreshing, setRefreshing] = useState(false)

  const loadStatus = useCallback(async () => {
    if (!configured) {
      setView({ type: 'idle' })
      return
    }
    const params = new URLSearchParams(window.location.search)
    if (params.get('strava') === 'success') {
      window.history.replaceState({}, '', window.location.pathname)
      onConnected?.()
    }

    const status = await getStravaStatus()
    if (!status) {
      setView({ type: 'idle' })
      return
    }
    if (status.connected) {
      setView({ type: 'connected', status })
    } else {
      setView({ type: 'idle' })
    }
  }, [configured, onConnected])

  useEffect(() => {
    void loadStatus()
  }, [loadStatus])

  async function handleConnect() {
    setView({ type: 'connecting' })
    const url = await getStravaAuthUrl()
    if (url) {
      window.location.href = url
    } else {
      setView({ type: 'error', message: copy('stravaError') })
    }
  }

  async function handleRefresh() {
    setRefreshing(true)
    const ok = await refreshStravaToken()
    if (ok) {
      await loadStatus()
    }
    setRefreshing(false)
  }

  if (view.type === 'loading') {
    return (
      <article className="connection-card">
        <div className="source-row">
          <Loader2 size={18} className="spinner" />
          <div>
            <strong>Strava</strong>
            <small>{copy('stravaCheck')}</small>
          </div>
        </div>
      </article>
    )
  }

  if (view.type === 'error') {
    return (
      <article className="connection-card">
        <div className="source-row">
          <AlertCircle size={18} style={{ color: 'var(--warning)' }} />
          <div>
            <strong>Strava</strong>
            <small style={{ color: 'var(--warning)' }}>{view.message}</small>
          </div>
        </div>
      </article>
    )
  }

  if (view.type === 'connected') {
    const { status } = view
    return (
      <article className="connection-card">
        <div className="source-row">
          <span className="source-dot" style={{ backgroundColor: 'var(--accent)' }} />
          <div>
            <strong>Strava</strong>
            <small>{copy('connected')}{status.athlete?.name ? ` como ${status.athlete.name}` : ''}</small>
          </div>
        </div>
        <p>
          <CheckCircle size={14} style={{ verticalAlign: 'middle', marginRight: 4, color: 'var(--accent)' }} />
          {copy('stravaSyncAuto')}
        </p>
        <button
          type="button"
          className="secondary-button"
          onClick={handleRefresh}
          disabled={refreshing}
          style={{ marginTop: 10 }}
        >
          <RefreshCw size={14} style={{ marginRight: 6 }} />
          {refreshing ? copy('stravaRefreshing') : copy('stravaRefresh')}
        </button>
      </article>
    )
  }

  return (
    <article className="connection-card">
      <div className="source-row">
        <span className="source-dot" style={{ backgroundColor: '#5e6ad2' }} />
        <div>
          <strong>Strava</strong>
          <small>{copy('stravaConnect')}</small>
        </div>
      </div>
      <p>{copy('stravaConnectDescription')}</p>
      <button
        type="button"
        className="primary-button"
        onClick={handleConnect}
        disabled={view.type === 'connecting'}
        style={{ marginTop: 10 }}
      >
        <ExternalLink size={14} style={{ marginRight: 6 }} />
        {view.type === 'connecting' ? copy('stravaRedirect') : copy('stravaConnect')}
      </button>
    </article>
  )
}
