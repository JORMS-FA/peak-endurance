import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { TrendingUp, Activity, Zap, Heart, Flame } from 'lucide-react'
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { useI18n } from '../hooks/useI18n'
import { useDashboardMetrics } from '../hooks/useDashboardMetrics'
import { AnimatedNumber } from '../components/ui/AnimatedNumber'

const GRID = 'rgba(255,255,255,0.06)'
const AXIS = '#b8bcc8'
const TOOLTIP_BG = '#1a1a2e'
const TOOLTIP_BORDER = '#2a2a3e'

type PmcPoint = { date: string; ctl: number; atl: number; tsb: number; tss: number }

function computePmc(daily: { date: string; tss: number }[]): PmcPoint[] {
  let ctl = 0
  let atl = 0
  return daily.map((d) => {
    ctl += (d.tss - ctl) / 42
    atl += (d.tss - atl) / 7
    return { date: d.date, ctl: Math.round(ctl), atl: Math.round(atl), tsb: Math.round(ctl - atl), tss: d.tss }
  })
}

/** Aggregate the daily series into ISO-week buckets (last ~13 weeks). */
function weeklyBuckets(daily: { date: string; tss: number }[]): { label: string; tss: number }[] {
  const out: { label: string; tss: number }[] = []
  for (let i = 0; i < daily.length; i += 7) {
    const chunk = daily.slice(i, i + 7)
    if (chunk.length === 0) continue
    const tss = Math.round(chunk.reduce((s, d) => s + d.tss, 0))
    const start = chunk[0].date.slice(5) // MM-DD
    out.push({ label: start, tss })
  }
  return out
}

function ChartTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: TOOLTIP_BG, border: `1px solid ${TOOLTIP_BORDER}`, borderRadius: 8, padding: '10px 14px', fontSize: 12, color: AXIS }}>
      <p style={{ margin: 0, fontWeight: 600, marginBottom: 4, color: '#fff' }}>{label}</p>
      {payload.map((e) => (
        <p key={e.name} style={{ margin: '2px 0', color: e.color }}>{e.name}: <strong>{e.value}</strong></p>
      ))}
    </div>
  )
}

const fade = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
}

export function Progress() {
  const { t, language } = useI18n()
  const { metrics, hasData, loading } = useDashboardMetrics()
  const isEs = language === 'es'

  const pmc = useMemo(() => computePmc(metrics.daily), [metrics.daily])
  const weekly = useMemo(() => weeklyBuckets(metrics.daily), [metrics.daily])

  const cards = [
    { icon: <Heart size={18} />, label: isEs ? 'Forma' : 'Form', value: metrics.formPct, unit: '%', color: 'green' },
    { icon: <TrendingUp size={18} />, label: isEs ? 'Aptitud (CTL)' : 'Fitness (CTL)', value: metrics.ctl, unit: '', color: 'purple' },
    { icon: <Flame size={18} />, label: isEs ? 'Fatiga (ATL)' : 'Fatigue (ATL)', value: metrics.atl, unit: '', color: 'orange' },
    { icon: <Zap size={18} />, label: isEs ? 'Carga 7 días' : '7-day load', value: metrics.weeklyTss, unit: 'TSS', color: 'blue' },
  ]

  return (
    <div className="page-progress">
      <div className="page-header">
        <h2>{t('progress')}</h2>
      </div>

      {loading ? (
        <div className="card"><div className="empty-state"><div className="spinner" /></div></div>
      ) : !hasData ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon"><TrendingUp size={24} /></div>
            <h3>{isEs ? 'Aún no hay datos' : 'No data yet'}</h3>
            <p>{isEs ? 'Conecta Strava y sincroniza para ver tu progreso.' : 'Connect Strava and sync to see your progress.'}</p>
            <Link to="/app/conexiones" className="btn-primary btn-sm" style={{ marginTop: 12 }}>
              {t('connectStrava')}
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Summary metrics */}
          <section className="metrics-grid">
            {cards.map((m, i) => (
              <motion.div
                key={m.label}
                className={`metric-card metric-${m.color}`}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={fade}
              >
                <div className="metric-icon">{m.icon}</div>
                <div className="metric-body">
                  <span className="metric-label">{m.label}</span>
                  <div className="metric-value">
                    <strong><AnimatedNumber value={m.value} /></strong>
                    {m.unit && <small>{m.unit}</small>}
                  </div>
                </div>
              </motion.div>
            ))}
          </section>

          {/* PMC evolution */}
          <motion.section className="card chart-card" custom={4} initial="hidden" animate="visible" variants={fade}>
            <div className="card-header">
              <TrendingUp size={16} />
              <span>{isEs ? 'Evolución de forma (90 días)' : 'Form evolution (90 days)'}</span>
            </div>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={pmc} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="progTsb" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
                  <XAxis dataKey="date" tick={{ fill: AXIS, fontSize: 11 }} tickFormatter={(v: string) => v.slice(5)} interval="preserveStartEnd" axisLine={{ stroke: GRID }} tickLine={false} />
                  <YAxis tick={{ fill: AXIS, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12, color: AXIS }} />
                  <Area type="monotone" dataKey="tsb" name={isEs ? 'Forma (TSB)' : 'Form (TSB)'} stroke="#22c55e" fill="url(#progTsb)" strokeWidth={1.5} />
                  <Line type="monotone" dataKey="ctl" name={isEs ? 'Aptitud (CTL)' : 'Fitness (CTL)'} stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  <Line type="monotone" dataKey="atl" name={isEs ? 'Fatiga (ATL)' : 'Fatigue (ATL)'} stroke="#f97316" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </motion.section>

          {/* Weekly load */}
          <motion.section className="card chart-card" custom={5} initial="hidden" animate="visible" variants={fade}>
            <div className="card-header">
              <Activity size={16} />
              <span>{isEs ? 'Carga por semana (TSS)' : 'Weekly load (TSS)'}</span>
            </div>
            <div style={{ width: '100%', height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekly} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="progBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a855f7" stopOpacity={1} />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity={1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: AXIS, fontSize: 11 }} axisLine={{ stroke: GRID }} tickLine={false} />
                  <YAxis tick={{ fill: AXIS, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="tss" name="TSS" fill="url(#progBar)" radius={[6, 6, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.section>
        </>
      )}
    </div>
  )
}
