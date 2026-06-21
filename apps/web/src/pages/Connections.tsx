import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, Loader2, RefreshCw, XCircle, Zap } from 'lucide-react'
import { useI18n } from '../hooks/useI18n'
import {
  useStravaConnect,
  useStravaConnection,
  useStravaDisconnect,
  useStravaSync,
} from '../hooks/useStrava'

type StaticSource = {
  id: string
  name: string
  color: string
  comingSoon?: boolean
}

const SECONDARY_SOURCES: StaticSource[] = [
  { id: 'garmin', name: 'Garmin Connect', color: '#007dbb', comingSoon: true },
  { id: 'coros', name: 'COROS', color: '#23d18b', comingSoon: true },
  { id: 'wahoo', name: 'Wahoo', color: '#0068b5', comingSoon: true },
  { id: 'igpsport', name: 'iGPSPORT', color: '#e02e26', comingSoon: true },
]

export function Connections() {
  const { t } = useI18n()
  const { status, loading: statusLoading, refetch } = useStravaConnection()
  const { connect, loading: connecting, error: connectError } = useStravaConnect()
  const { disconnect, loading: disconnecting } = useStravaDisconnect(refetch)
  const { sync, loading: syncing, result: syncResult, error: syncError } = useStravaSync()
  const [searchParams, setSearchParams] = useSearchParams()
  const [showSuccess, setShowSuccess] = useState(false)

  // Handle the post-OAuth callback (?strava=success) once on mount.
  useEffect(() => {
    if (searchParams.get('strava') === 'success') {
      setShowSuccess(true)
      void refetch()
      // Auto-trigger an initial sync of the last 60 days.
      void sync(60)
      // Clean the URL.
      const next = new URLSearchParams(searchParams)
      next.delete('strava')
      setSearchParams(next, { replace: true })
      const t = window.setTimeout(() => setShowSuccess(false), 4000)
      return () => window.clearTimeout(t)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const connected = Boolean(status?.connected)
  const athleteName = status?.athlete?.name

  const expirationLabel = useMemo(() => {
    if (!status?.expiresAt) return null
    const d = new Date(status.expiresAt)
    return d.toLocaleString()
  }, [status?.expiresAt])

  return (
    <div className="page-connections">
      <div className="page-header">
        <h2>{t('connections')}</h2>
      </div>

      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="form-success"
          style={{ marginBottom: '1rem' }}
        >
          <CheckCircle2 size={18} />
          <span>{t('stravaConnectedSuccess')}</span>
        </motion.div>
      )}

      {/* ── Strava ─────────────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="connection-card connection-card-primary"
      >
        <div className="connection-icon" style={{ background: '#fc4c02' }}>S</div>
        <div className="connection-info">
          <strong>Strava</strong>
          {statusLoading ? (
            <span className="connection-status">{t('checkingStatus')}</span>
          ) : connected ? (
            <span className="connection-status status-available">
              <CheckCircle2 size={12} style={{ verticalAlign: '-2px', marginRight: 4 }} />
              {t('connected')}
              {athleteName ? ` · ${athleteName}` : ''}
            </span>
          ) : (
            <span className="connection-status">{t('notConnected')}</span>
          )}
          {expirationLabel && connected && (
            <small className="text-muted" style={{ fontSize: '0.72rem' }}>
              {t('tokenExpires')}: {expirationLabel}
            </small>
          )}
        </div>
        <div className="connection-actions">
          {connected ? (
            <>
              <button
                type="button"
                className="btn-primary btn-sm"
                onClick={() => void sync(60)}
                disabled={syncing}
              >
                {syncing ? <Loader2 size={14} className="spin-icon" /> : <RefreshCw size={14} />}
                {syncing ? t('syncing') : t('syncNow')}
              </button>
              <button
                type="button"
                className="btn-secondary btn-sm"
                onClick={() => void disconnect()}
                disabled={disconnecting}
              >
                {disconnecting ? <Loader2 size={14} className="spin-icon" /> : <XCircle size={14} />}
                {t('disconnect')}
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn-primary btn-sm"
              onClick={() => void connect()}
              disabled={connecting || statusLoading}
            >
              {connecting ? <Loader2 size={14} className="spin-icon" /> : <Zap size={14} />}
              {connecting ? t('redirecting') : t('connectStrava')}
            </button>
          )}
        </div>
      </motion.section>

      {(connectError || syncError) && (
        <div className="form-error" style={{ marginTop: '0.75rem' }}>
          {connectError ?? syncError}
        </div>
      )}

      {syncResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card"
          style={{ marginTop: '0.75rem' }}
        >
          <div className="card-header">
            <RefreshCw size={14} />
            <span>{t('lastSync')}</span>
          </div>
          <p style={{ fontSize: '0.85rem' }}>
            {syncResult.synced} {t('syncedActivities')}
            {syncResult.skipped > 0 && (
              <span className="text-muted"> · {syncResult.skipped} {t('skipped')}</span>
            )}
          </p>
        </motion.div>
      )}

      {/* ── Other sources ──────────────────────────────────────────────── */}
      <h3 className="connections-subhead">{t('comingSoonSources')}</h3>
      <div className="connections-list">
        {SECONDARY_SOURCES.map((source, idx) => (
          <motion.div
            key={source.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 * idx }}
            className="connection-card"
          >
            <div className="connection-icon" style={{ background: source.color }}>
              {source.name.charAt(0)}
            </div>
            <div className="connection-info">
              <strong>{source.name}</strong>
              <span className="connection-status">{t('comingSoon')}</span>
            </div>
            <button type="button" className="btn-secondary btn-sm btn-disabled" disabled>
              {t('comingSoon')}
            </button>
          </motion.div>
        ))}
      </div>

      <section className="card" style={{ marginTop: '1rem' }}>
        <p className="text-muted" style={{ fontSize: '0.85rem' }}>
          {t('stravaDescription')}
        </p>
      </section>
    </div>
  )
}
