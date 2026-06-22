import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LineChart as LineChartIcon, Activity, Heart, Route, Clock, Flame } from 'lucide-react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { useI18n } from '../hooks/useI18n'
import { useActivities } from '../hooks/useActivities'
import { SPORT_COLORS } from '../components/ui/SportIcon'

const GRID = 'rgba(255,255,255,0.06)'
const AXIS = '#b8bcc8'
const TOOLTIP_BG = '#1a1a2e'
const TOOLTIP_BORDER = '#2a2a3e'

const SPORT_LABEL_ES: Record<string, string> = {
  run: 'Carrera', bike: 'Ciclismo', swim: 'Natación', gym: 'Gimnasio', other: 'Otros',
}

const fade = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
}

function tooltipStyle() {
  return { background: TOOLTIP_BG, border: `1px solid ${TOOLTIP_BORDER}`, borderRadius: 8, fontSize: 12, color: AXIS }
}

export function Analysis() {
  const { t, language } = useI18n()
  const isEs = language === 'es'
  const { data, loading } = useActivities({ days: 90 })

  const sportLabel = (s: string) => (isEs ? SPORT_LABEL_ES[s] ?? s : s)

  const totals = useMemo(() => {
    const distance = data.reduce((s, a) => s + (a.distance_km ?? 0), 0)
    const minutes = data.reduce((s, a) => s + (a.duration_minutes ?? 0), 0)
    const tss = data.reduce((s, a) => s + (a.tss ?? 0), 0)
    return { count: data.length, distance, hours: minutes / 60, tss }
  }, [data])

  const bySport = useMemo(() => {
    const map = new Map<string, { count: number; tss: number; km: number }>()
    for (const a of data) {
      const k = a.sport || 'other'
      const cur = map.get(k) ?? { count: 0, tss: 0, km: 0 }
      cur.count += 1
      cur.tss += a.tss ?? 0
      cur.km += a.distance_km ?? 0
      map.set(k, cur)
    }
    return Array.from(map.entries()).map(([sport, v]) => ({
      sport,
      label: sportLabel(sport),
      count: v.count,
      tss: Math.round(v.tss),
      km: Math.round(v.km),
    }))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, isEs])

  // HR trend over time (oldest → newest), only activities with avg_hr
  const hrTrend = useMemo(() => {
    return data
      .filter((a) => a.avg_hr && a.avg_hr > 0)
      .slice()
      .reverse()
      .map((a) => ({ date: a.date.slice(5), hr: a.avg_hr as number }))
  }, [data])

  const summaryCards = [
    { icon: <Activity size={18} />, label: isEs ? 'Actividades' : 'Activities', value: totals.count, color: 'purple' },
    { icon: <Route size={18} />, label: isEs ? 'Distancia' : 'Distance', value: `${totals.distance.toFixed(0)} km`, color: 'blue' },
    { icon: <Clock size={18} />, label: isEs ? 'Tiempo' : 'Time', value: `${totals.hours.toFixed(0)} h`, color: 'green' },
    { icon: <Flame size={18} />, label: 'TSS', value: Math.round(totals.tss), color: 'orange' },
  ]

  return (
    <div className="page-analysis">
      <div className="page-header">
        <h2>{t('analysis')}</h2>
        <span className="text-muted" style={{ fontSize: '0.82rem' }}>{isEs ? 'Últimos 90 días' : 'Last 90 days'}</span>
      </div>

      {loading ? (
        <div className="card"><div className="empty-state"><div className="spinner" /></div></div>
      ) : data.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon"><LineChartIcon size={24} /></div>
            <h3>{t('noData')}</h3>
            <p>{isEs ? 'Conecta Strava y sincroniza para analizar tus entrenamientos.' : 'Connect Strava and sync to analyze your training.'}</p>
            <Link to="/app/conexiones" className="btn-primary btn-sm" style={{ marginTop: 12 }}>{t('connectStrava')}</Link>
          </div>
        </div>
      ) : (
        <>
          {/* Summary */}
          <section className="metrics-grid">
            {summaryCards.map((m, i) => (
              <motion.div key={m.label} className={`metric-card metric-${m.color}`} custom={i} initial="hidden" animate="visible" variants={fade}>
                <div className="metric-icon">{m.icon}</div>
                <div className="metric-body">
                  <span className="metric-label">{m.label}</span>
                  <div className="metric-value"><strong>{m.value}</strong></div>
                </div>
              </motion.div>
            ))}
          </section>

          <div className="dashboard-grid">
            {/* Distribution pie */}
            <motion.section className="card chart-card" custom={4} initial="hidden" animate="visible" variants={fade}>
              <div className="card-header">
                <Activity size={16} />
                <span>{isEs ? 'Distribución por deporte' : 'Sport distribution'}</span>
              </div>
              <div style={{ width: '100%', height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={bySport} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="count" nameKey="label" stroke="none">
                      {bySport.map((e) => (<Cell key={e.sport} fill={SPORT_COLORS[e.sport] || SPORT_COLORS.other} />))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle()} formatter={(v, n) => [`${v} ${isEs ? 'actividades' : 'activities'}`, String(n)] as [string, string]} />
                    <Legend wrapperStyle={{ fontSize: 12, color: AXIS }} formatter={(v: string) => <span style={{ color: AXIS }}>{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.section>

            {/* TSS by sport */}
            <motion.section className="card chart-card" custom={5} initial="hidden" animate="visible" variants={fade}>
              <div className="card-header">
                <Flame size={16} />
                <span>{isEs ? 'Carga (TSS) por deporte' : 'Load (TSS) by sport'}</span>
              </div>
              <div style={{ width: '100%', height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bySport} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
                    <XAxis dataKey="label" tick={{ fill: AXIS, fontSize: 11 }} axisLine={{ stroke: GRID }} tickLine={false} />
                    <YAxis tick={{ fill: AXIS, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle()} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                    <Bar dataKey="tss" name="TSS" radius={[6, 6, 0, 0]} maxBarSize={48}>
                      {bySport.map((e) => (<Cell key={e.sport} fill={SPORT_COLORS[e.sport] || SPORT_COLORS.other} />))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.section>
          </div>

          {/* HR trend */}
          {hrTrend.length > 1 && (
            <motion.section className="card chart-card" custom={6} initial="hidden" animate="visible" variants={fade}>
              <div className="card-header">
                <Heart size={16} />
                <span>{isEs ? 'Frecuencia cardíaca media' : 'Average heart rate'}</span>
              </div>
              <div style={{ width: '100%', height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={hrTrend} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
                    <XAxis dataKey="date" tick={{ fill: AXIS, fontSize: 11 }} interval="preserveStartEnd" axisLine={{ stroke: GRID }} tickLine={false} />
                    <YAxis domain={['dataMin - 10', 'dataMax + 10']} tick={{ fill: AXIS, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle()} formatter={(v) => [`${v} bpm`, isEs ? 'FC media' : 'Avg HR'] as [string, string]} />
                    <Line type="monotone" dataKey="hr" name={isEs ? 'FC media' : 'Avg HR'} stroke="#ef4444" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.section>
          )}
        </>
      )}
    </div>
  )
}
