import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
import { PolylineMap } from '../components/ui/PolylineMap'
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

function fmtDateTime(d: Date, isEs: boolean) {
  return d.toLocaleDateString(isEs ? 'es-CO' : 'en-US', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

const SPORT_LABEL_KEY: Record<string, string> = {
  run: 'sportRun',
  bike: 'sportBike',
  swim: 'sportSwim',
  gym: 'sportGym',
  other: 'sportOther',
}

export function Training() {
  const { t, language } = useI18n()
  const isEs = language === 'es'
  const navigate = useNavigate()
  const { session } = useAuth()
  const [filter, setFilter] = useState<SportFilter>('all')
  const [range, setRange] = useState<DateRange>({ preset: 'month', days: 30 })
  const [expanded, setExpanded] = useState<string | null>(null)
  const [future, setFuture] = useState<PlannedSession[]>([])
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null)
  const [autoSyncing, setAutoSyncing] = useState(false)

  const { data, loading, refetch } = useActivities({ days: range.days, sport: filter })
  const { status: strava, loading: stravaLoading } = useStravaConnection()
  const { sync, loading: syncing } = useStravaSync()
  const stravaConnected = Boolean(strava?.connected)
  const autoSynced = useRef(false)

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

  /* ── Auto-sync on mount ─────────────────────────────────────── */
  useEffect(() => {
    if (autoSynced.current) return
    const ready = !loading && !stravaLoading
    if (!ready) return
    if (data.length > 0) { autoSynced.current = true; return }
    if (!stravaConnected) { autoSynced.current = true; return }

    autoSynced.current = true
    setAutoSyncing(true)

    sync(60).then((res) => {
      if (res) setLastSyncAt(new Date())
      return refetch()
    }).then(() => fetchFuture())
      .finally(() => setAutoSyncing(false))
  }, [loading, stravaLoading, data.length, stravaConnected, sync, refetch, fetchFuture])

  /* ── Handlers ────────────────────────────────────────────────── */
  const handleSync = async () => {
    await sync(60)
    setLastSyncAt(new Date())
    await refetch()
    await fetchFuture()
  }

  /* ── Computed stats ──────────────────────────────────────────── */
  const totalTss = data.reduce((s, a) => s + (a.tss ?? 0), 0)
  const totalMinutes = data.reduce((s, a) => s + (a.duration_minutes ?? 0), 0)
  const totalDist = data.reduce((s, a) => s + (a.distance_km ?? 0), 0)

  /* ── Filters ─────────────────────────────────────────────────── */
  const filters: { value: SportFilter; label: string; icon: ReactNode }[] = [
    { value: 'all', label: t('all'), icon: <Activity size={14} /> },
    { value: 'run', label: t('sportRun'), icon: <SportIcon sport="run" size={14} /> },
    { value: 'bike', label: t('sportBike'), icon: <SportIcon sport="bike" size={14} /> },
    { value: 'swim', label: t('sportSwim'), icon: <SportIcon sport="swim" size={14} /> },
    { value: 'gym', label: t('sportGym'), icon: <SportIcon sport="gym" size={14} /> },
  ]

  return (
    <div className="page-training">
      {/* ── Header with sync info ──────────────────────────────── */}
      <div className="page-header">
        <h2>{t('training')}</h2>
        <div className="training-header-right">
          {autoSyncing && (
            <span className="training-auto-syncing">
              <Loader2 size={13} className="spin-icon" />
              <small>{isEs ? 'Sincronizando...' : 'Syncing...'}</small>
            </span>
          )}
          {stravaConnected && !autoSyncing && (
            <button
              type="button"
              className="btn-secondary btn-sm"
              onClick={handleSync}
              disabled={syncing}
            >
              {syncing ? <Loader2 size={13} className="spin-icon" /> : <RefreshCw size={13} />}
              <span>{syncing ? t('syncing') : isEs ? 'Buscar nuevas' : 'Check new'}</span>
            </button>
          )}
        </div>
      </div>

      {stravaConnected && (
        <div className="training-sync-info">
          <RefreshCw size={11} />
          <small>
            {isEs ? 'Última sincronización: ' : 'Last sync: '}
            {lastSyncAt ? fmtDateTime(lastSyncAt, isEs) : isEs ? 'nunca' : 'never'}
          </small>
        </div>
      )}

      {/* ── Upcoming sessions ──────────────────────────────────── */}
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

      {/* ── Filters ─────────────────────────────────────────────── */}
      <RangeFilter value={range} onChange={setRange} />
      <div className="training-filters">
        {filters.map((f) => (
          <button key={f.value} type="button" className={`chip${filter === f.value ? ' active' : ''}`} onClick={() => setFilter(f.value)}>
            {f.icon}<span>{f.label}</span>
          </button>
        ))}
      </div>

      {/* ── Content ─────────────────────────────────────────────── */}
      {loading ? (
        <div className="card"><div className="empty-state"><div className="spinner" /><small>{t('loading')}</small></div></div>
      ) : data.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon"><Dumbbell size={24} /></div>
            <p>{t('noActivities')}</p>
            <small>{stravaConnected ? t('syncToImport') : t('connectStravaToStart')}</small>
            {!stravaLoading && !stravaConnected && (
              <Link to="/app/conexiones" className="btn-primary btn-sm" style={{ marginTop: 12 }}>
                <Zap size={14} /><span>{t('connectStrava')}</span>
              </Link>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* ── Summary bar ──────────────────────────────────────── */}
          <div className="training-summary-bar">
            <div className="summary-pill">
              <div className="summary-pill-icon is-count"><Activity size={15} /></div>
              <div className="summary-pill-body">
                <span className="summary-pill-value">{data.length}</span>
                <span className="summary-pill-label">{isEs ? 'Actividades' : 'Activities'}</span>
              </div>
            </div>
            <div className="summary-pill">
              <div className="summary-pill-icon is-bike"><Flame size={15} /></div>
              <div className="summary-pill-body">
                <span className="summary-pill-value">{totalTss}</span>
                <span className="summary-pill-label">TSS</span>
              </div>
            </div>
            <div className="summary-pill">
              <div className="summary-pill-icon is-run"><Clock size={15} /></div>
              <div className="summary-pill-body">
                <span className="summary-pill-value">{(totalMinutes / 60).toFixed(1)}</span>
                <span className="summary-pill-label">{isEs ? 'Horas' : 'Hours'}</span>
              </div>
            </div>
            <div className="summary-pill">
              <div className="summary-pill-icon is-swim"><Route size={15} /></div>
              <div className="summary-pill-body">
                <span className="summary-pill-value">{totalDist.toFixed(0)}</span>
                <span className="summary-pill-label">km</span>
              </div>
            </div>
          </div>

          {/* ── Activity list ────────────────────────────────────── */}
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
                    <div className="activity-icon" data-sport={a.sport}>
                      <SportIcon sport={a.sport} size={18} />
                    </div>
                    <div className="activity-body">
                      <div className="activity-row">
                        <strong className="activity-title">{a.title}</strong>
                        <span className="activity-sport-badge">
                          {t(SPORT_LABEL_KEY[a.sport] as any) || a.sport}
                        </span>
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
                        {a.mapPolyline && <PolylineMap encoded={a.mapPolyline} variant="compact" />}

                        <div className="activity-detail-actions">
                          <button
                            type="button"
                            className="btn-primary btn-sm"
                            onClick={(e) => { e.stopPropagation(); navigate(`/app/entrenamientos/${a.id}`) }}
                          >
                            <Activity size={14} />
                            <span>{isEs ? 'Ver detalle completo' : 'View full details'}</span>
                          </button>
                        </div>

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
        </>
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
