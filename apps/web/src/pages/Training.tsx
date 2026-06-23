import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity, Dumbbell, Loader2, Mountain, RefreshCw, Zap,
  ChevronDown, CalendarClock, Clock, Route, HeartPulse, Flame, Gauge,
} from 'lucide-react'
import { useI18n } from '../hooks/useI18n'
import { useActivities, type SportFilter } from '../hooks/useActivities'
import { useStravaConnection, useStravaSync } from '../hooks/useStrava'
import { SportIcon, SPORT_COLORS } from '../components/ui/SportIcon'
import { RangeFilter, type DateRange } from '../components/ui/RangeFilter'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

type PlannedSession = {
  id: string
  date: string
  title: string
  sport: string
  intensity: string | null
  duration_minutes: number | null
  tss: number | null
  notes: string | null
}

function fmtDate(d: string, isEs: boolean) {
  return new Date(d + 'T00:00:00').toLocaleDateString(isEs ? 'es-CO' : 'en-US', {
    weekday: 'short', day: 'numeric', month: 'short',
  })
}

export function Training() {
  const { t, language } = useI18n()
  const isEs = language === 'es'
  const { session } = useAuth()
  const [filter, setFilter] = useState<SportFilter>('all')
  const [range, setRange] = useState<DateRange>({ preset: 'month', days: 30 })
  const [expanded, setExpanded] = useState<string | null>(null)
  const [future, setFuture] = useState<PlannedSession[]>([])

  const { data, loading, refetch } = useActivities({ days: range.days, sport: filter })
  const { status: strava } = useStravaConnection()
  const { sync, loading: syncing } = useStravaSync()
  const stravaConnected = Boolean(strava?.connected)

  const fetchFuture = useCallback(async () => {
    if (!supabase || !session?.user?.id) return
    const today = new Date().toISOString().slice(0, 10)
    const { data: rows } = await supabase
      .from('training_sessions')
      .select('id, session_date, title, sport, intensity, duration_minutes, tss, notes, status')
      .eq('profile_id', session.user.id)
      .gte('session_date', today)
      .neq('status', 'completed')
      .order('session_date', { ascending: true })
      .limit(20)
    setFuture((rows ?? []).map((r) => ({
      id: r.id as string,
      date: r.session_date as string,
      title: (r.title as string) ?? 'Entrenamiento',
      sport: (r.sport as string) ?? 'other',
      intensity: (r.intensity as string) ?? null,
      duration_minutes: r.duration_minutes as number | null,
      tss: r.tss as number | null,
      notes: (r.notes as string) ?? null,
    })))
  }, [session?.user?.id])

  useEffect(() => { void fetchFuture() }, [fetchFuture])

  const filters: { value: SportFilter; label: string; icon: ReactNode }[] = [
    { value: 'all', label: t('all'), icon: <Activity size={14} /> },
    { value: 'run', label: t('sportRun'), icon: <SportIcon sport="run" size={14} /> },
    { value: 'bike', label: t('sportBike'), icon: <SportIcon sport="bike" size={14} /> },
    { value: 'swim', label: t('sportSwim'), icon: <SportIcon sport="swim" size={14} /> },
    { value: 'gym', label: t('sportGym'), icon: <SportIcon sport="gym" size={14} /> },
  ]

  const handleSync = async () => {
    await sync(60)
    await refetch()
    await fetchFuture()
  }

  return (
    <div className="page-training">
      <div className="page-header">
        <h2>{t('training')}</h2>
        {stravaConnected && (
          <button type="button" className="btn-secondary btn-sm" onClick={handleSync} disabled={syncing}>
            {syncing ? <Loader2 size={14} className="spin-icon" /> : <RefreshCw size={14} />}
            <span>{syncing ? t('syncing') : t('syncNow')}</span>
          </button>
        )}
      </div>

      {/* Upcoming (future) sessions */}
      {future.length > 0 && (
        <section className="training-upcoming">
          <div className="training-section-title">
            <CalendarClock size={15} />
            <span>{isEs ? 'Próximos entrenamientos' : 'Upcoming workouts'}</span>
          </div>
          <div className="upcoming-row">
            {future.map((s, i) => (
              <motion.button
                type="button"
                key={s.id}
                className="upcoming-card"
                onClick={() => setExpanded(expanded === s.id ? null : s.id)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                style={{ borderColor: `${SPORT_COLORS[s.sport] || SPORT_COLORS.other}55` }}
              >
                <span className="upcoming-icon" style={{ background: SPORT_COLORS[s.sport] || SPORT_COLORS.other }}>
                  <SportIcon sport={s.sport} size={14} />
                </span>
                <span className="upcoming-date">{fmtDate(s.date, isEs)}</span>
                <strong className="upcoming-title">{s.title}</strong>
                <span className="upcoming-meta">
                  {s.duration_minutes ? `${s.duration_minutes} min` : ''}{s.tss ? ` · ${s.tss} TSS` : ''}
                </span>
              </motion.button>
            ))}
          </div>
        </section>
      )}

      {/* Range + sport filters */}
      <RangeFilter value={range} onChange={setRange} />
      <div className="training-filters">
        {filters.map((f) => (
          <button key={f.value} type="button" className={`chip${filter === f.value ? ' active' : ''}`} onClick={() => setFilter(f.value)}>
            {f.icon}<span>{f.label}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card"><div className="empty-state"><div className="spinner" /><small>{t('loading')}</small></div></div>
      ) : data.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon"><Dumbbell size={24} /></div>
            <p>{t('noActivities')}</p>
            <small>{stravaConnected ? t('syncToImport') : t('connectStravaToStart')}</small>
            {!stravaConnected && (
              <Link to="/app/conexiones" className="btn-primary btn-sm" style={{ marginTop: 12 }}>
                <Zap size={14} /><span>{t('connectStrava')}</span>
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="activities-list">
          {data.map((a, i) => {
            const open = expanded === a.id
            return (
              <motion.article
                key={a.id}
                className={`activity-card activity-card-expandable${open ? ' open' : ''}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.3) }}
                onClick={() => setExpanded(open ? null : a.id)}
              >
                <div className="activity-main">
                  <div className="activity-icon" data-sport={a.sport} style={{ background: SPORT_COLORS[a.sport] || SPORT_COLORS.other, color: '#fff' }}>
                    <SportIcon sport={a.sport} size={16} />
                  </div>
                  <div className="activity-body">
                    <div className="activity-row">
                      <strong className="activity-title">{a.title}</strong>
                      {a.tss !== null && <span className="activity-tss">{a.tss} TSS</span>}
                    </div>
                    <div className="activity-meta">
                      <span>{fmtDate(a.date, isEs)}</span>
                      {a.distance_km !== null && <span>· {a.distance_km.toFixed(1)} km</span>}
                      {a.duration_minutes !== null && <span>· {a.duration_minutes} min</span>}
                      {a.avg_hr !== null && <span>· {a.avg_hr} bpm</span>}
                    </div>
                  </div>
                  <ChevronDown size={16} className={`activity-chevron${open ? ' open' : ''}`} />
                </div>

                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      className="activity-detail"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="detail-grid">
                        <Stat icon={<Clock size={14} />} label={isEs ? 'Duración' : 'Duration'} value={a.duration_minutes ? `${a.duration_minutes} min` : '—'} />
                        <Stat icon={<Route size={14} />} label={isEs ? 'Distancia' : 'Distance'} value={a.distance_km ? `${a.distance_km.toFixed(2)} km` : '—'} />
                        <Stat icon={<HeartPulse size={14} />} label={isEs ? 'FC media' : 'Avg HR'} value={a.avg_hr ? `${a.avg_hr} bpm` : '—'} />
                        <Stat icon={<HeartPulse size={14} />} label={isEs ? 'FC máx' : 'Max HR'} value={a.maxHr ? `${a.maxHr} bpm` : '—'} />
                        <Stat icon={<Mountain size={14} />} label={isEs ? 'Desnivel' : 'Elevation'} value={a.elevation_gain_m ? `${a.elevation_gain_m} m` : '—'} />
                        <Stat icon={<Flame size={14} />} label="TSS" value={a.tss != null ? String(a.tss) : '—'} />
                        <Stat icon={<Gauge size={14} />} label={isEs ? 'Ritmo/Vel.' : 'Pace/Speed'} value={paceOf(a.distance_km, a.duration_minutes, a.sport)} />
                        {a.source_type && <Stat icon={<Zap size={14} />} label={isEs ? 'Fuente' : 'Source'} value={a.source_type === 'strava' ? 'Strava' : a.source_type} />}
                      </div>

                      {/* Route map rendered from polyline (SVG, no external API) */}
                      {a.mapPolyline && <PolylineMap encoded={a.mapPolyline} />}

                      {a.stravaId && (
                        <a
                          href={`https://www.strava.com/activities/${a.stravaId}`}
                          target="_blank" rel="noopener noreferrer"
                          className="activity-strava-link"
                        >
                          {isEs ? 'Ver en Strava ↗' : 'View on Strava ↗'}
                        </a>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.article>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="detail-stat">
      <span className="detail-stat-label">{icon} {label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function paceOf(km: number | null, min: number | null, sport: string): string {
  if (!km || !min || km <= 0) return '—'
  if (sport === 'bike') return `${(km / (min / 60)).toFixed(1)} km/h`
  const secPerKm = (min * 60) / km
  const m = Math.floor(secPerKm / 60)
  const s = Math.round(secPerKm % 60)
  return `${m}:${String(s).padStart(2, '0')} /km`
}

// Decode a Google-encoded polyline into [lat, lng] pairs and render as SVG.
function decodePolyline(encoded: string): [number, number][] {
  const points: [number, number][] = []
  let idx = 0
  let lat = 0
  let lng = 0
  while (idx < encoded.length) {
    let b: number, shift = 0, result = 0
    do { b = encoded.charCodeAt(idx++) - 63; result |= (b & 0x1f) << shift; shift += 5 } while (b >= 0x20)
    lat += result & 1 ? ~(result >> 1) : result >> 1
    shift = 0; result = 0
    do { b = encoded.charCodeAt(idx++) - 63; result |= (b & 0x1f) << shift; shift += 5 } while (b >= 0x20)
    lng += result & 1 ? ~(result >> 1) : result >> 1
    points.push([lat / 1e5, lng / 1e5])
  }
  return points
}

function PolylineMap({ encoded }: { encoded: string }) {
  const pts = decodePolyline(encoded)
  if (pts.length < 2) return null
  const lats = pts.map((p) => p[0])
  const lngs = pts.map((p) => p[1])
  const minLat = Math.min(...lats), maxLat = Math.max(...lats)
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs)
  const w = 600, h = 180, pad = 16
  const scaleX = (maxLng - minLng) || 0.001
  const scaleY = (maxLat - minLat) || 0.001
  const toX = (lng: number) => pad + ((lng - minLng) / scaleX) * (w - pad * 2)
  const toY = (lat: number) => h - pad - ((lat - minLat) / scaleY) * (h - pad * 2)
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(p[1]).toFixed(1)},${toY(p[0]).toFixed(1)}`).join(' ')

  return (
    <div className="activity-map" style={{ marginTop: 12 }}>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 'auto', borderRadius: 12, background: '#0a0f14' }}>
        <path d={d} fill="none" stroke="var(--accent, #22c55e)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={toX(pts[0][1])} cy={toY(pts[0][0])} r="5" fill="#22c55e" />
        <circle cx={toX(pts[pts.length - 1][1])} cy={toY(pts[pts.length - 1][0])} r="5" fill="#ef4444" />
      </svg>
    </div>
  )
}
