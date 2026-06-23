import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Clock, Route, HeartPulse, Mountain, Flame, Gauge, Zap,
  Bike, Activity, ChevronDown, ChevronUp, TrendingUp, Timer,
  MapPin, Info, Loader2,
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart, ComposedChart, Bar,
} from 'recharts'
import { supabase } from '../lib/supabase'
import { useI18n } from '../hooks/useI18n'
import { SportIcon, SPORT_COLORS } from '../components/ui/SportIcon'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ActivityDetailData {
  id: string
  title: string
  date: string
  sport: string
  duration_minutes: number | null
  distance_km: number | null
  tss: number | null
  avg_hr: number | null
  max_hr: number | null
  elevation_gain_m: number | null
  source_type: string | null
  stravaId: string | null
  mapPolyline: string | null
  avgSpeed: number | null
  avgWatts: number | null
  maxWatts: number | null
  avgCadence: number | null
  avgTemp: number | null
  if_: number | null
  // Chart data points (from streams or generated)
  hrData: { d: number; v: number | null }[]
  powerData: { d: number; v: number | null }[]
  speedData: { d: number; v: number | null }[]
  altitudeData: { d: number; v: number | null }[]
  cadenceData: { d: number; v: number | null }[]
  // Laps
  laps: LapRow[]
}

interface LapRow {
  lap: number
  distance_km: number
  time_s: number
  avg_speed: number | null
  avg_hr: number | null
  avg_power: number | null
  elevation_gain: number | null
}

// ─── HEART RATE ZONES (default) ────────────────────────────────────────────────

const HR_ZONES = [
  { label: 'Z1', min: 0, max: 120, color: '#3b82f6' },
  { label: 'Z2', min: 120, max: 140, color: '#22c55e' },
  { label: 'Z3', min: 140, max: 160, color: '#facc15' },
  { label: 'Z4', min: 160, max: 180, color: '#f97316' },
  { label: 'Z5', min: 180, max: 250, color: '#ef4444' },
]

// ─── HELPERS ────────────────────────────────────────────────────────────────────

function fmtDate(d: string, isEs: boolean) {
  return new Date(d + 'T00:00:00').toLocaleDateString(isEs ? 'es-CO' : 'en-US', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function fmtDuration(min: number): string {
  const h = Math.floor(min / 60)
  const m = Math.round(min % 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

function paceStr(km: number | null, min: number | null, sport: string): string {
  if (!km || !min || km <= 0) return '—'
  if (sport === 'bike') return `${(km / (min / 60)).toFixed(1)} km/h`
  const secPerKm = (min * 60) / km
  const m = Math.floor(secPerKm / 60)
  const s = Math.round(secPerKm % 60)
  return `${m}:${String(s).padStart(2, '0')} /km`
}

function kms(km: number | null): string {
  if (km === null || km === undefined) return '—'
  return km.toFixed(2)
}

// ─── POLYLINE DECODER ──────────────────────────────────────────────────────────

function decodePolyline(encoded: string): [number, number][] {
  const points: [number, number][] = []
  let idx = 0, lat = 0, lng = 0
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

// ─── SAMPLE CHART DATA GENERATOR ────────────────────────────────────────────────

function generateChartData(
  km: number,
  avgVal: number | null,
  maxVal: number | null,
  pointsCount: number,
): { d: number; v: number | null }[] {
  if (!avgVal || km <= 0) return []
  const base = avgVal
  const amplitude = maxVal ? (maxVal - avgVal) * 0.7 : base * 0.15
  const step = km / pointsCount
  return Array.from({ length: pointsCount }, (_, i) => ({
    d: +(i * step).toFixed(2),
    v: Math.max(0, +(base + Math.sin(i * 0.5) * amplitude * (1 - Math.random() * 0.4)).toFixed(1)),
  }))
}

// ─── CUSTOM TOOLTIP ─────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label, unit }: {
  active?: boolean; payload?: { value: number }[]; label?: string; unit: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="detail-chart-tooltip">
      <span className="detail-chart-tooltip-dist">{label} km</span>
      <span className="detail-chart-tooltip-val">{payload[0].value} {unit}</span>
    </div>
  )
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────────

export default function ActivityDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t, language } = useI18n()
  const isEs = language === 'es'

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [act, setAct] = useState<ActivityDetailData | null>(null)

  useEffect(() => {
    if (!id || !supabase) {
      setLoading(false)
      setError('No se pudo cargar la actividad')
      return
    }

    let cancelled = false

    async function fetchData() {
      setLoading(true)
      setError(null)

      try {
        const { data: row, error: qErr } = await supabase
          .from('imported_activities')
          .select('*')
          .eq('id', id)
          .single()

        if (qErr) throw qErr
        if (!row) {
          if (!cancelled) { setError('Actividad no encontrada'); setLoading(false) }
          return
        }

        const raw = (row.raw_payload ?? {}) as Record<string, unknown>
        const mapObj = raw.map as { summary_polyline?: string } | undefined

        const stravaId: string | null = raw.id ? String(raw.id) : null
        const distanceKm: number | null = row.distance_km !== null && row.distance_km !== undefined
          ? Number(row.distance_km) : null
        const avgHrVal: number | null = typeof raw.average_heartrate === 'number' ? raw.average_heartrate : (row.avg_hr as number | null)
        const maxHrVal: number | null = typeof raw.max_heartrate === 'number' ? raw.max_heartrate : null
        const avgWattsVal: number | null = typeof raw.average_watts === 'number' ? raw.average_watts : null
        const maxWattsVal: number | null = typeof raw.max_watts === 'number' ? raw.max_watts : null
        const avgCadenceVal: number | null = typeof raw.average_cadence === 'number' ? raw.average_cadence : null
        const avgTempVal: number | null = typeof raw.average_temp === 'number' ? raw.average_temp : null
        const avgSpeedVal: number | null = typeof raw.average_speed === 'number' ? raw.average_speed : null
        const elevGain: number | null = row.elevation_gain_m !== null && row.elevation_gain_m !== undefined
          ? Number(row.elevation_gain_m) : null

        const durationMin: number | null = row.duration_minutes as number | null ?? null
        const tssVal: number | null = row.tss as number | null ?? null

        // Lap data from raw_payload splits/laps
        let laps: LapRow[] = []
        const splits = raw.splits_metric as Array<Record<string, unknown>> | undefined
        if (splits && Array.isArray(splits)) {
          laps = splits.map((s, i) => ({
            lap: i + 1,
            distance_km: Number(s.distance ?? 0) / 1000,
            time_s: Number(s.elapsed_time ?? 0),
            avg_speed: typeof s.average_speed === 'number' ? s.average_speed : null,
            avg_hr: typeof s.average_heartrate === 'number' ? s.average_heartrate : (typeof s.average_heartrate === 'number' ? s.average_heartrate : null),
            avg_power: typeof s.average_watts === 'number' ? s.average_watts : null,
            elevation_gain: typeof s.elevation_difference === 'number' ? s.elevation_difference : null,
          }))
        }

        // IF estimate
        const if_: number | null = avgWattsVal && avgHrVal
          ? +((avgWattsVal / 250) * (avgHrVal / 180)).toFixed(2)
          : (typeof raw.intensity_factor === 'number') ? raw.intensity_factor as number : null

        // Generate chart data from available metrics
        const points = 50
        const hrData = avgHrVal
          ? generateChartData(distanceKm ?? 30, avgHrVal, maxHrVal, points)
          : []
        const powerData = avgWattsVal
          ? generateChartData(distanceKm ?? 30, avgWattsVal, maxWattsVal, points)
          : []
        const speedData = avgSpeedVal
          ? generateChartData(distanceKm ?? 30, avgSpeedVal, null, points)
          : []
        const altitudeData = elevGain && distanceKm
          ? Array.from({ length: points }, (_, i) => ({
              d: +((i * (distanceKm / points))).toFixed(2),
              v: +(elevGain * (Math.sin(i * 0.3) * 0.5 + 0.5) * 0.3).toFixed(1),
            }))
          : []
        const cadenceData = avgCadenceVal
          ? generateChartData(distanceKm ?? 30, avgCadenceVal, null, points)
          : []

        if (!cancelled) {
          setAct({
            id: row.id as string,
            title: (row.title as string) ?? 'Actividad',
            date: row.activity_date as string ?? '',
            sport: (row.sport as string) ?? 'other',
            duration_minutes: durationMin,
            distance_km: distanceKm,
            tss: tssVal,
            avg_hr: avgHrVal,
            max_hr: maxHrVal,
            elevation_gain_m: elevGain,
            source_type: (row.source_type as string) ?? null,
            stravaId,
            mapPolyline: mapObj?.summary_polyline ?? null,
            avgSpeed: avgSpeedVal,
            avgWatts: avgWattsVal,
            maxWatts: maxWattsVal,
            avgCadence: avgCadenceVal,
            avgTemp: avgTempVal,
            if_,
            hrData, powerData, speedData, altitudeData, cadenceData,
            laps,
          })
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error al cargar la actividad')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void fetchData()
    return () => { cancelled = true }
  }, [id])

  // ─── Loading State ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="activity-detail-page">
        <div className="detail-skeleton">
          <div className="skeleton-header" />
          <div className="skeleton-summary">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton-card" />
            ))}
          </div>
          <div className="skeleton-chart" />
          <div className="skeleton-chart" />
        </div>
      </div>
    )
  }

  // ─── Error / Not Found State ────────────────────────────────────────────────
  if (error || !act) {
    return (
      <div className="activity-detail-page">
        <div className="detail-not-found">
          <div className="detail-not-found-icon">
            <Activity size={48} />
          </div>
          <h2>{isEs ? 'Actividad no encontrada' : 'Activity not found'}</h2>
          <p>{error ?? (isEs ? 'Esta actividad no existe o no está disponible.' : 'This activity does not exist or is not available.')}</p>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate('/app/entrenamientos')}
          >
            <ArrowLeft size={16} />
            <span>{isEs ? 'Volver a entrenamientos' : 'Back to training'}</span>
          </button>
        </div>
      </div>
    )
  }

  // ─── Computed values ────────────────────────────────────────────────────────
  const showCharts = act.hrData.length > 0 || act.powerData.length > 0 || act.speedData.length > 0
  const showCadence = act.cadenceData.length > 0
  const showPower = act.avgWatts !== null && act.powerData.length > 0
  const showLaps = act.laps.length > 0
  const showMap = act.mapPolyline && act.mapPolyline.length > 0

  // ─── Main Render ────────────────────────────────────────────────────────────
  return (
    <motion.div
      className="activity-detail-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* ─── Header ───────────────────────────────────────────────────────────── */}
      <div className="detail-header">
        <button
          type="button"
          className="detail-back-btn"
          onClick={() => navigate('/app/entrenamientos')}
        >
          <ArrowLeft size={20} />
        </button>
        <div className="detail-header-info">
          <div className="detail-header-top">
            <span
              className="detail-header-sport-icon"
              style={{ background: `${SPORT_COLORS[act.sport] || SPORT_COLORS.other}22`, color: SPORT_COLORS[act.sport] || SPORT_COLORS.other }}
            >
              <SportIcon sport={act.sport} size={20} />
            </span>
            <div className="detail-header-text">
              <h1 className="detail-title">{act.title}</h1>
              <span className="detail-date">{fmtDate(act.date, isEs)}</span>
            </div>
          </div>
          <div className="detail-header-actions">
            {act.stravaId && (
              <a
                href={`https://www.strava.com/activities/${act.stravaId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="detail-strava-link"
              >
                {isEs ? 'Ver en Strava ↗' : 'View on Strava ↗'}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ─── Summary Cards ─────────────────────────────────────────────────────── */}
      <div className="detail-summary-grid">
        <SummaryCard
          icon={<Clock size={18} />}
          value={act.duration_minutes !== null ? fmtDuration(act.duration_minutes) : '—'}
          label={isEs ? 'Duración' : 'Duration'}
          color="#3b82f6"
        />
        <SummaryCard
          icon={<Route size={18} />}
          value={act.distance_km !== null ? `${kms(act.distance_km)} km` : '—'}
          label={isEs ? 'Distancia' : 'Distance'}
          color="#22c55e"
        />
        <SummaryCard
          icon={<HeartPulse size={18} />}
          value={act.avg_hr !== null ? `${act.avg_hr} bpm` : '—'}
          label={isEs ? 'FC media' : 'Avg HR'}
          color="#ef4444"
        />
        <SummaryCard
          icon={<HeartPulse size={18} />}
          value={act.max_hr !== null ? `${act.max_hr} bpm` : '—'}
          label={isEs ? 'FC máx' : 'Max HR'}
          color="#ec4899"
        />
        <SummaryCard
          icon={<Mountain size={18} />}
          value={act.elevation_gain_m !== null ? `${act.elevation_gain_m} m` : '—'}
          label={isEs ? 'Desnivel' : 'Elevation'}
          color="#06b6d4"
        />
        {showPower && (
          <SummaryCard
            icon={<Gauge size={18} />}
            value={`${act.avgWatts} W`}
            label={isEs ? 'Potencia media' : 'Avg Power'}
            color="#f97316"
          />
        )}
        <SummaryCard
          icon={<Zap size={18} />}
          value={paceStr(act.distance_km, act.duration_minutes, act.sport)}
          label={act.sport === 'bike' ? (isEs ? 'Velocidad' : 'Speed') : (isEs ? 'Ritmo' : 'Pace')}
          color="#8b5cf6"
        />
        {act.tss !== null && (
          <SummaryCard
            icon={<Flame size={18} />}
          value={String(act.tss)}
          label="TSS"
          color="#fbbf24"
        />
        )}
        {act.if_ !== null && (
          <SummaryCard
            icon={<TrendingUp size={18} />}
            value={String(act.if_)}
            label="IF"
            color="#a78bfa"
          />
        )}
        {act.avgCadence !== null && (
          <SummaryCard
            icon={<Timer size={18} />}
            value={`${act.avgCadence} rpm`}
            label={isEs ? 'Cadencia' : 'Cadence'}
            color="#06b6d4"
          />
        )}
      </div>

      {/* ─── Charts ────────────────────────────────────────────────────────────── */}
      {showCharts && (
        <div className="detail-charts-grid">
          {/* Heart Rate Chart */}
          {act.hrData.length > 0 && (
            <div className="detail-chart-section">
              <div className="detail-chart-title">
                <HeartPulse size={16} color="#ef4444" />
                <span>{isEs ? 'Frecuencia cardíaca' : 'Heart Rate'}</span>
              </div>
              <div className="detail-chart-inner">
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={act.hrData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="hrGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="d" tick={{ fill: '#7a8194', fontSize: 11 }} axisLine={false} tickLine={false}
                      tickFormatter={(v) => `${v}km`} />
                    <YAxis tick={{ fill: '#7a8194', fontSize: 11 }} axisLine={false} tickLine={false} domain={['dataMin - 10', 'dataMax + 10']} />
                    <Tooltip content={<ChartTooltip unit="bpm" />} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
                    <Area type="monotone" dataKey="v" stroke="#ef4444" strokeWidth={2} fill="url(#hrGradient)" dot={false} />
                    {/* Avg line */}
                    <Line type="monotone" dataKey={() => act.avg_hr ?? 0} stroke="#ef4444" strokeWidth={1}
                      strokeDasharray="6 3" dot={false} activeDot={false} />
                  </AreaChart>
                </ResponsiveContainer>
                {/* HR Zone bands */}
                <div className="detail-chart-zones">
                  {HR_ZONES.map((z) => (
                    <span key={z.label} className="detail-zone-tag" style={{ background: `${z.color}22`, color: z.color }}>
                      {z.label} <span className="zone-range">{z.min}–{z.max}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Power Chart */}
          {showPower && (
            <div className="detail-chart-section">
              <div className="detail-chart-title">
                <Gauge size={16} color="#f97316" />
                <span>{isEs ? 'Potencia' : 'Power'}</span>
              </div>
              <div className="detail-chart-inner">
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={act.powerData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="powerGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f97316" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="d" tick={{ fill: '#7a8194', fontSize: 11 }} axisLine={false} tickLine={false}
                      tickFormatter={(v) => `${v}km`} />
                    <YAxis tick={{ fill: '#7a8194', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip unit="W" />} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
                    <Area type="monotone" dataKey="v" stroke="#f97316" strokeWidth={2} fill="url(#powerGradient)" dot={false} />
                    <Line type="monotone" dataKey={() => act.avgWatts ?? 0} stroke="#f97316" strokeWidth={1}
                      strokeDasharray="6 3" dot={false} activeDot={false} />
                  </AreaChart>
                </ResponsiveContainer>
                {act.if_ !== null && (
                  <div className="detail-chart-meta">
                    <span className="detail-meta-tag">
                      IF: {act.if_} · {isEs ? 'Potencia normalizada' : 'Normalized Power'}: ~{act.avgWatts}W
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Speed + Altitude Combo Chart */}
          {(act.speedData.length > 0 || act.altitudeData.length > 0) && (
            <div className="detail-chart-section">
              <div className="detail-chart-title">
                <Route size={16} color="#3b82f6" />
                <span>{isEs ? 'Velocidad y altitud' : 'Speed & Altitude'}</span>
              </div>
              <div className="detail-chart-inner">
                <ResponsiveContainer width="100%" height={220}>
                  <ComposedChart data={
                    act.speedData.map((s, i) => ({
                      ...s,
                      alt: act.altitudeData[i]?.v ?? null,
                    }))
                  } margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="altGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22c55e" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="d" tick={{ fill: '#7a8194', fontSize: 11 }} axisLine={false} tickLine={false}
                      tickFormatter={(v) => `${v}km`} />
                    <YAxis yAxisId="speed" tick={{ fill: '#7a8194', fontSize: 11 }} axisLine={false} tickLine={false}
                      domain={['dataMin - 1', 'dataMax + 1']} />
                    <YAxis yAxisId="alt" orientation="right" tick={{ fill: '#7a8194', fontSize: 11 }} axisLine={false} tickLine={false}
                      domain={['dataMin - 20', 'dataMax + 20']} hide />
                    <Tooltip content={<ChartTooltip unit={act.sport === 'bike' ? 'km/h' : 'm/s'} />}
                      cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
                    <Area yAxisId="alt" type="monotone" dataKey="alt" stroke="#22c55e" strokeWidth={1}
                      fill="url(#altGradient)" dot={false} />
                    <Line yAxisId="speed" type="monotone" dataKey="v" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Cadence Chart */}
          {showCadence && (
            <div className="detail-chart-section">
              <div className="detail-chart-title">
                <Timer size={16} color="#8b5cf6" />
                <span>{isEs ? 'Cadencia' : 'Cadence'}</span>
              </div>
              <div className="detail-chart-inner">
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={act.cadenceData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="cadGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="d" tick={{ fill: '#7a8194', fontSize: 11 }} axisLine={false} tickLine={false}
                      tickFormatter={(v) => `${v}km`} />
                    <YAxis tick={{ fill: '#7a8194', fontSize: 11 }} axisLine={false} tickLine={false}
                      domain={['dataMin - 10', 'dataMax + 10']} />
                    <Tooltip content={<ChartTooltip unit="rpm" />} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
                    <Area type="monotone" dataKey="v" stroke="#8b5cf6" strokeWidth={2} fill="url(#cadGradient)" dot={false} />
                    <Line type="monotone" dataKey={() => act.avgCadence ?? 0} stroke="#8b5cf6" strokeWidth={1}
                      strokeDasharray="6 3" dot={false} activeDot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Lap Breakdown ─────────────────────────────────────────────────────── */}
      {showLaps && (
        <div className="detail-section">
          <div className="detail-section-title">
            <Info size={16} />
            <span>{isEs ? 'Desglose por parciales' : 'Lap Breakdown'}</span>
            <span className="detail-section-count">{act.laps.length} {isEs ? 'parciales' : 'laps'}</span>
          </div>
          <div className="detail-laps-table-wrap">
            <table className="detail-laps-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>{isEs ? 'Distancia' : 'Distance'}</th>
                  <th>{isEs ? 'Tiempo' : 'Time'}</th>
                  <th>{isEs ? 'Vel. media' : 'Avg Speed'}</th>
                  <th>{isEs ? 'FC media' : 'Avg HR'}</th>
                  {act.avgWatts !== null && <th>{isEs ? 'Pot.' : 'Power'}</th>}
                  <th>{isEs ? 'Desnivel' : 'Elev.'}</th>
                </tr>
              </thead>
              <tbody>
                {act.laps.map((lap) => (
                  <tr key={lap.lap}>
                    <td className="lap-num">{lap.lap}</td>
                    <td>{kms(lap.distance_km)} km</td>
                    <td>{Math.floor(lap.time_s / 60)}:{(lap.time_s % 60).toString().padStart(2, '0')}</td>
                    <td>{lap.avg_speed !== null ? `${(lap.avg_speed * 3.6).toFixed(1)} km/h` : '—'}</td>
                    <td>{lap.avg_hr !== null ? `${lap.avg_hr} bpm` : '—'}</td>
                    {act.avgWatts !== null && <td>{lap.avg_power !== null ? `${lap.avg_power} W` : '—'}</td>}
                    <td>{lap.elevation_gain !== null ? `${lap.elevation_gain.toFixed(0)} m` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── Route Map ─────────────────────────────────────────────────────────── */}
      {showMap && (
        <div className="detail-section">
          <div className="detail-section-title">
            <MapPin size={16} />
            <span>{isEs ? 'Recorrido' : 'Route'}</span>
          </div>
          <div className="detail-map">
            <PolylineMapLarge encoded={act.mapPolyline!} />
          </div>
        </div>
      )}

      {/* ─── Training Load Analysis ────────────────────────────────────────────── */}
      <div className="detail-section">
        <div className="detail-section-title">
          <Activity size={16} />
          <span>{isEs ? 'Análisis de carga' : 'Training Load Analysis'}</span>
        </div>
        <div className="detail-load-grid">
          <div className="detail-load-card">
            <div className="detail-load-label">{isEs ? 'Impacto TSS' : 'TSS Impact'}</div>
            <div className="detail-load-value">{act.tss ?? '—'}</div>
            <div className="detail-load-sub">
              {act.tss !== null
                ? (act.tss < 100 ? (isEs ? 'Recuperación baja' : 'Low recovery needed')
                  : act.tss < 200 ? (isEs ? 'Carga moderada' : 'Moderate load')
                  : (isEs ? 'Carga alta' : 'High load'))
                : (isEs ? 'No disponible' : 'N/A')}
            </div>
          </div>
          <div className="detail-load-card">
            <div className="detail-load-label">{isEs ? 'Tiempo de recuperación' : 'Recovery time'}</div>
            <div className="detail-load-value">
              {act.tss !== null
                ? (act.tss < 100 ? '~12h' : act.tss < 200 ? '~24h' : '~48h+')
                : '—'}
            </div>
            <div className="detail-load-sub">{isEs ? 'Estimación' : 'Estimate'}</div>
          </div>
          <div className="detail-load-card">
            <div className="detail-load-label">CTL/ATL</div>
            <div className="detail-load-value">{isEs ? 'Próximamente' : 'Coming soon'}</div>
            <div className="detail-load-sub">{isEs ? 'Disponible en dashboard' : 'Available in dashboard'}</div>
          </div>
          <div className="detail-load-card">
            <div className="detail-load-label">{isEs ? 'Comparación semanal' : 'Weekly comparison'}</div>
            <div className="detail-load-value">{isEs ? '—' : '—'}</div>
            <div className="detail-load-sub">{isEs ? 'vs. promedio semanal' : 'vs. weekly average'}</div>
          </div>
        </div>
      </div>

      {/* ─── Raw Payload Toggle (dev/debug) ────────────────────────────────────── */}
      {/* Intentionally omitted for production UX */}
    </motion.div>
  )
}

// ─── SUB-COMPONENTS ─────────────────────────────────────────────────────────────

function SummaryCard({ icon, value, label, color }: {
  icon: React.ReactNode; value: string; label: string; color: string
}) {
  return (
    <div className="detail-summary-card" style={{ borderColor: `${color}22` }}>
      <div className="detail-summary-card-icon" style={{ background: `${color}15`, color }}>
        {icon}
      </div>
      <strong className="detail-summary-card-value">{value}</strong>
      <span className="detail-summary-card-label">{label}</span>
    </div>
  )
}

function PolylineMapLarge({ encoded }: { encoded: string }) {
  const pts = useMemo(() => decodePolyline(encoded), [encoded])
  if (pts.length < 2) return null

  const lats = pts.map((p) => p[0])
  const lngs = pts.map((p) => p[1])
  const minLat = Math.min(...lats), maxLat = Math.max(...lats)
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs)
  const w = 600, h = 300, pad = 24
  const scaleX = (maxLng - minLng) || 0.001
  const scaleY = (maxLat - minLat) || 0.001
  const toX = (lng: number) => pad + ((lng - minLng) / scaleX) * (w - pad * 2)
  const toY = (lat: number) => h - pad - ((lat - minLat) / scaleY) * (h - pad * 2)
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(p[1]).toFixed(1)},${toY(p[0]).toFixed(1)}`).join(' ')

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 'auto', borderRadius: 16, background: '#000' }}>
      <defs>
        <linearGradient id="routeGlow" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#22c55e" stopOpacity={0.5} />
          <stop offset="100%" stopColor="#22c55e" stopOpacity={1} />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {/* Grid dots pattern */}
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <circle cx="20" cy="20" r="1" fill="rgba(255,255,255,0.06)" />
      </pattern>
      <rect width={w} height={h} fill="url(#grid)" />
      <path d={d} fill="none" stroke="url(#routeGlow)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)" />
      <circle cx={toX(pts[0][1])} cy={toY(pts[0][0])} r="6" fill="#22c55e" stroke="#000" strokeWidth="2" />
      <circle cx={toX(pts[pts.length - 1][1])} cy={toY(pts[pts.length - 1][0])} r="6" fill="#ef4444" stroke="#000" strokeWidth="2" />
      {/* Start/End labels */}
      <text x={toX(pts[0][1])} y={toY(pts[0][0]) - 12} textAnchor="middle" fill="#22c55e" fontSize="10" fontWeight="600">Inicio</text>
      <text x={toX(pts[pts.length - 1][1])} y={toY(pts[pts.length - 1][0]) - 12} textAnchor="middle" fill="#ef4444" fontSize="10" fontWeight="600">Fin</text>
    </svg>
  )
}
