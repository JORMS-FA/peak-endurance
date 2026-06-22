import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Activity,
  Bike,
  Dumbbell,
  Flame,
  Footprints,
  Heart,
  Moon,
  TrendingUp,
  Waves,
  Zap,
} from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
} from 'recharts'
import { useI18n } from '../hooks/useI18n'
import { useAuth } from '../hooks/useAuth'
import { useDashboardMetrics } from '../hooks/useDashboardMetrics'
import { useTodaySession } from '../hooks/useTodaySession'
import { useStravaConnection } from '../hooks/useStrava'
import { AnimatedNumber } from '../components/ui/AnimatedNumber'
import type { ReactNode } from 'react'

// ─── Animation Variants ─────────────────────────────────────────────────────
const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
}

// ─── Sport Icons & Colors ───────────────────────────────────────────────────
const sportIcon: Record<string, ReactNode> = {
  run: <Footprints size={14} />,
  bike: <Bike size={14} />,
  swim: <Waves size={14} />,
  gym: <Dumbbell size={14} />,
  rest: <Moon size={14} />,
  other: <Activity size={14} />,
}

const SPORT_COLORS: Record<string, string> = {
  run: '#22c55e',
  bike: '#3b82f6',
  swim: '#06b6d4',
  gym: '#f97316',
  other: '#8b5cf6',
}

// ─── PMC Computation ────────────────────────────────────────────────────────
type PmcPoint = { date: string; ctl: number; atl: number; tsb: number; tss: number }

function computePmcSeries(daily: { date: string; tss: number }[]): PmcPoint[] {
  let ctl = 0
  let atl = 0
  return daily.map((d) => {
    ctl += (d.tss - ctl) / 42
    atl += (d.tss - atl) / 7
    return { date: d.date, ctl: Math.round(ctl), atl: Math.round(atl), tsb: Math.round(ctl - atl), tss: d.tss }
  })
}

// ─── Chart Theme Constants ──────────────────────────────────────────────────
const CHART_GRID_STROKE = 'rgba(255,255,255,0.06)'
const CHART_TEXT_COLOR = '#b8bcc8'
const TOOLTIP_BG = '#1a1a2e'
const TOOLTIP_BORDER = '#2a2a3e'

// ─── Custom Tooltips ────────────────────────────────────────────────────────
interface PmcTooltipPayloadItem {
  name: string
  value: number
  color: string
}

function PmcTooltip({ active, payload, label }: { active?: boolean; payload?: PmcTooltipPayloadItem[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: TOOLTIP_BG, border: `1px solid ${TOOLTIP_BORDER}`, borderRadius: 8, padding: '10px 14px', fontSize: 12, color: CHART_TEXT_COLOR }}>
      <p style={{ margin: 0, fontWeight: 600, marginBottom: 4, color: '#fff' }}>{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ margin: '2px 0', color: entry.color }}>
          {entry.name}: <strong>{entry.value}</strong>
        </p>
      ))}
    </div>
  )
}

interface WeeklyTooltipPayloadItem {
  value: number
}

function WeeklyTooltip({ active, payload, label }: { active?: boolean; payload?: WeeklyTooltipPayloadItem[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: TOOLTIP_BG, border: `1px solid ${TOOLTIP_BORDER}`, borderRadius: 8, padding: '10px 14px', fontSize: 12, color: CHART_TEXT_COLOR }}>
      <p style={{ margin: 0, fontWeight: 600, color: '#fff' }}>{label}</p>
      <p style={{ margin: '4px 0', color: '#06b6d4' }}>TSS: <strong>{Math.round(payload[0].value)}</strong></p>
    </div>
  )
}

// ─── Dashboard Component ────────────────────────────────────────────────────
export function Dashboard() {
  const { t } = useI18n()
  const { profile } = useAuth()
  const { metrics, hasData, loading } = useDashboardMetrics()
  const { data: today, loading: todayLoading } = useTodaySession()
  const { status: stravaStatus } = useStravaConnection()

  const stravaConnected = Boolean(stravaStatus?.connected)
  const showEmpty = !loading && !hasData

  // Compute PMC series for chart
  const pmcSeries = useMemo(() => computePmcSeries(metrics.daily), [metrics.daily])

  // Compute sport distribution from recent activities
  const pieData = useMemo(() => {
    const sportCounts = metrics.recent.reduce<Record<string, number>>((acc, a) => {
      const sport = a.sport || 'other'
      acc[sport] = (acc[sport] || 0) + 1
      return acc
    }, {})
    return Object.entries(sportCounts).map(([name, value]) => ({ name, value }))
  }, [metrics.recent])

  return (
    <div className="page-dashboard">
      {/* ── Hero AI Coach Card ─────────────────────────────────────────── */}
      <motion.section
        className="hero-card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="hero-content">
          <span className="badge">Peak IA Coach</span>
          <h2>
            {profile?.display_name ? `${t('aiHeroPrefix')}, ${profile.display_name.split(' ')[0]}.` : t('aiHeroFallback')}
          </h2>
          <p className="hero-subtitle">{t('aiHeroSubtitle')}</p>
          <div className="hero-actions">
            <Link to="/app/ia-coach" className="btn-primary">{t('analyzeWeek')}</Link>
            <Link to="/app/plan" className="btn-secondary">{t('adjustPlan')}</Link>
            <Link to="/app/analisis" className="btn-secondary">{t('detectFatigue')}</Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="pulse-ring" />
          <div className="pulse-ring delay-1" />
          <div className="pulse-core" />
        </div>
      </motion.section>

      {/* ── Connect-Strava nudge ──────────────────────────────────────── */}
      {!stravaConnected && (
        <motion.div
          className="card connect-banner"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="connect-banner-icon" style={{ background: '#fc4c02' }}>S</div>
          <div className="connect-banner-body">
            <strong>{t('connectStravaTitle')}</strong>
            <small>{t('connectStravaHint')}</small>
          </div>
          <Link to="/app/conexiones" className="btn-primary btn-sm">
            {t('connectStrava')}
          </Link>
        </motion.div>
      )}

      {/* ── Metrics Grid ───────────────────────────────────────────────── */}
      <section className="metrics-grid">
        {[
          { icon: <Heart size={18} />, label: t('mForma'), value: metrics.formPct, unit: '%', color: 'green' },
          { icon: <Zap size={18} />, label: t('mCarga'), value: metrics.weeklyTss, unit: 'TSS', color: 'blue' },
          { icon: <TrendingUp size={18} />, label: t('mAptitud'), value: metrics.ctl, unit: 'CTL', color: 'purple' },
          { icon: <Flame size={18} />, label: t('mFatiga'), value: metrics.atl, unit: 'ATL', color: 'orange' },
        ].map((m, i) => (
          <motion.div
            key={m.label}
            className={`metric-card metric-${m.color}`}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
          >
            <div className="metric-icon">{m.icon}</div>
            <div className="metric-body">
              <span className="metric-label">{m.label}</span>
              <div className="metric-value">
                <strong>
                  {showEmpty ? '--' : <AnimatedNumber value={m.value} />}
                </strong>
                <small>{m.unit}</small>
              </div>
            </div>
          </motion.div>
        ))}
      </section>

      {/* ── Performance Management Chart (PMC) ─────────────────────────── */}
      <motion.section
        className="card chart-card"
        custom={4}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
      >
        <div className="card-header">
          <TrendingUp size={16} />
          <span>{t('weeklyState')} — PMC (90 días)</span>
        </div>
        {showEmpty ? (
          <div className="empty-state"><p>{t('noData')}</p></div>
        ) : (
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={pmcSeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="tsbGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: CHART_TEXT_COLOR, fontSize: 11 }}
                  tickFormatter={(val: string) => val.slice(5)}
                  interval="preserveStartEnd"
                  axisLine={{ stroke: CHART_GRID_STROKE }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: CHART_TEXT_COLOR, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<PmcTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 12, color: CHART_TEXT_COLOR }}
                />
                <Area
                  type="monotone"
                  dataKey="tsb"
                  name="TSB (Form)"
                  stroke="#22c55e"
                  fill="url(#tsbGradient)"
                  strokeWidth={1.5}
                />
                <Line
                  type="monotone"
                  dataKey="ctl"
                  name="CTL (Fitness)"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#3b82f6' }}
                />
                <Line
                  type="monotone"
                  dataKey="atl"
                  name="ATL (Fatigue)"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#f97316' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </motion.section>

      {/* ── Two-column dashboard grid ──────────────────────────────────── */}
      <div className="dashboard-grid">
        {/* Weekly Load BarChart */}
        <motion.section
          className="card chart-card"
          custom={5}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <div className="card-header">
            <Zap size={16} />
            <span>Carga Semanal (TSS)</span>
          </div>
          {showEmpty ? (
            <div className="empty-state"><p>{t('noData')}</p></div>
          ) : (
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.weeklySeries} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a855f7" stopOpacity={1} />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity={1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} vertical={false} />
                  <XAxis
                    dataKey="day"
                    tick={{ fill: CHART_TEXT_COLOR, fontSize: 12 }}
                    axisLine={{ stroke: CHART_GRID_STROKE }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: CHART_TEXT_COLOR, fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<WeeklyTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar
                    dataKey="tss"
                    fill="url(#barGradient)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.section>

        {/* Sport Distribution PieChart */}
        <motion.section
          className="card chart-card"
          custom={6}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <div className="card-header">
            <Activity size={16} />
            <span>Distribución por Deporte</span>
          </div>
          {pieData.length === 0 ? (
            <div className="empty-state"><p>{t('noData')}</p></div>
          ) : (
            <div style={{ width: '100%', height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                    stroke="none"
                  >
                    {pieData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={SPORT_COLORS[entry.name] || SPORT_COLORS.other}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: TOOLTIP_BG,
                      border: `1px solid ${TOOLTIP_BORDER}`,
                      borderRadius: 8,
                      fontSize: 12,
                      color: CHART_TEXT_COLOR,
                    }}
                    formatter={(value, name) => [`${value} actividades`, String(name)] as [string, string]}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 12, color: CHART_TEXT_COLOR }}
                    formatter={(value: string) => <span style={{ color: CHART_TEXT_COLOR }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.section>

        {/* Today's session */}
        <motion.section
          className="card"
          custom={7}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <div className="card-header">
            <Activity size={16} />
            <span>{t('trainingOfDay')}</span>
          </div>
          {todayLoading ? (
            <div className="empty-state"><div className="spinner" /></div>
          ) : today ? (
            <div className="today-session">
              <div className="today-session-icon">{sportIcon[today.sport] ?? sportIcon.other}</div>
              <div className="today-session-body">
                <strong>{today.title}</strong>
                <span className="text-muted">
                  {today.duration_minutes ? `${today.duration_minutes} min` : ''}
                  {today.intensity ? ` · ${today.intensity}` : ''}
                </span>
                {today.notes && <small className="text-muted">{today.notes}</small>}
              </div>
              <span className={`status-badge ${today.status === 'completed' ? 'success' : 'warning'}`}>
                {t(today.status === 'completed' ? 'completed' : 'planned')}
              </span>
            </div>
          ) : (
            <div className="empty-state">
              <p>{t('noData')}</p>
              <small>{stravaConnected ? t('noSessionToday') : t('connectSource')}</small>
            </div>
          )}
        </motion.section>

        {/* Recovery / Quick read */}
        <motion.section
          className="card"
          custom={8}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <div className="card-header">
            <Moon size={16} />
            <span>{t('quickRead')}</span>
          </div>
          <div className="recovery-grid">
            <div className="recovery-item">
              <span className="recovery-label">TSB</span>
              <span className="recovery-value">{showEmpty ? '--' : <AnimatedNumber value={metrics.tsb} />}</span>
            </div>
            <div className="recovery-item">
              <span className="recovery-label">{t('weeklyHours')}</span>
              <span className="recovery-value">{showEmpty ? '--' : <AnimatedNumber value={metrics.weeklyHours} decimals={1} />}</span>
            </div>
            <div className="recovery-item">
              <span className="recovery-label">{t('weeklyDistance')}</span>
              <span className="recovery-value">{showEmpty ? '--' : <AnimatedNumber value={metrics.weeklyDistance} decimals={1} />}</span>
            </div>
          </div>
        </motion.section>

        {/* Recent activities */}
        <motion.section
          className="card"
          custom={9}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <div className="card-header">
            <Zap size={16} />
            <span>{t('recentActivities')}</span>
          </div>
          {metrics.recent.length === 0 ? (
            <div className="empty-state">
              <p>{t('noData')}</p>
              <small>{stravaConnected ? t('syncToSeeActivities') : t('connectSource')}</small>
            </div>
          ) : (
            <ul className="recent-list">
              {metrics.recent.map((a) => (
                <li key={a.id} className="recent-item">
                  <span className="recent-icon">{sportIcon[a.sport] ?? sportIcon.other}</span>
                  <div className="recent-body">
                    <strong>{a.title}</strong>
                    <small className="text-muted">
                      {a.date}
                      {a.distance_km ? ` · ${a.distance_km.toFixed(1)} km` : ''}
                      {a.duration_minutes ? ` · ${a.duration_minutes} min` : ''}
                      {a.tss ? ` · ${a.tss} TSS` : ''}
                    </small>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </motion.section>
      </div>
    </div>
  )
}
