import { useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Activity,
  Bike,
  Dumbbell,
  Footprints,
  Loader2,
  Mountain,
  RefreshCw,
  Waves,
  Zap,
} from 'lucide-react'
import { useI18n } from '../hooks/useI18n'
import { useActivities, type SportFilter } from '../hooks/useActivities'
import { useStravaConnection, useStravaSync } from '../hooks/useStrava'

const sportIcon: Record<string, ReactNode> = {
  run: <Footprints size={16} />,
  bike: <Bike size={16} />,
  swim: <Waves size={16} />,
  gym: <Dumbbell size={16} />,
  other: <Activity size={16} />,
}

export function Training() {
  const { t } = useI18n()
  const [filter, setFilter] = useState<SportFilter>('all')
  const { data, loading, refetch } = useActivities({ days: 30, sport: filter })
  const { status: strava } = useStravaConnection()
  const { sync, loading: syncing } = useStravaSync()

  const stravaConnected = Boolean(strava?.connected)

  const filters: { value: SportFilter; label: string; icon: ReactNode }[] = [
    { value: 'all', label: t('all'), icon: <Activity size={14} /> },
    { value: 'run', label: t('sportRun'), icon: <Footprints size={14} /> },
    { value: 'bike', label: t('sportBike'), icon: <Bike size={14} /> },
    { value: 'swim', label: t('sportSwim'), icon: <Waves size={14} /> },
    { value: 'gym', label: t('sportGym'), icon: <Dumbbell size={14} /> },
  ]

  const handleSync = async () => {
    await sync(60)
    await refetch()
  }

  return (
    <div className="page-training">
      <div className="page-header">
        <h2>{t('training')}</h2>
        {stravaConnected && (
          <button
            type="button"
            className="btn-secondary btn-sm"
            onClick={handleSync}
            disabled={syncing}
          >
            {syncing ? <Loader2 size={14} className="spin-icon" /> : <RefreshCw size={14} />}
            <span>{syncing ? t('syncing') : t('syncNow')}</span>
          </button>
        )}
      </div>

      <div className="training-filters">
        {filters.map((f) => (
          <button
            key={f.value}
            type="button"
            className={`chip${filter === f.value ? ' active' : ''}`}
            onClick={() => setFilter(f.value)}
          >
            {f.icon}
            <span>{f.label}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card">
          <div className="empty-state">
            <div className="spinner" />
            <small>{t('loading')}</small>
          </div>
        </div>
      ) : data.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">
              <Dumbbell size={24} />
            </div>
            <p>{t('noActivities')}</p>
            <small>
              {stravaConnected
                ? filter === 'all'
                  ? t('syncToImport')
                  : t('noActivitiesForSport')
                : t('connectStravaToStart')}
            </small>
            {!stravaConnected && (
              <Link to="/app/conexiones" className="btn-primary btn-sm" style={{ marginTop: 12 }}>
                <Zap size={14} />
                <span>{t('connectStrava')}</span>
              </Link>
            )}
            {stravaConnected && filter === 'all' && (
              <button
                type="button"
                className="btn-primary btn-sm"
                onClick={handleSync}
                disabled={syncing}
                style={{ marginTop: 12 }}
              >
                {syncing ? <Loader2 size={14} className="spin-icon" /> : <RefreshCw size={14} />}
                <span>{syncing ? t('syncing') : t('syncNow')}</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="activities-list">
          {data.map((a, i) => (
            <motion.article
              key={a.id}
              className="activity-card"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.4) }}
            >
              <div className="activity-icon" data-sport={a.sport}>
                {sportIcon[a.sport] ?? sportIcon.other}
              </div>
              <div className="activity-body">
                <div className="activity-row">
                  <strong className="activity-title">{a.title}</strong>
                  {a.tss !== null && <span className="activity-tss">{a.tss} TSS</span>}
                </div>
                <div className="activity-meta">
                  <span>{a.date}</span>
                  {a.distance_km !== null && (
                    <span>· {a.distance_km.toFixed(1)} km</span>
                  )}
                  {a.duration_minutes !== null && (
                    <span>· {a.duration_minutes} min</span>
                  )}
                  {a.avg_hr !== null && (
                    <span>· {a.avg_hr} bpm</span>
                  )}
                  {a.elevation_gain_m !== null && a.elevation_gain_m > 0 && (
                    <span>
                      · <Mountain size={10} style={{ verticalAlign: '-1px' }} /> {a.elevation_gain_m} m
                    </span>
                  )}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </div>
  )
}
