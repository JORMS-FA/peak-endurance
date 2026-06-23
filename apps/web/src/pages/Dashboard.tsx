import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Activity,
  Flame,
  Heart,
  Moon,
  TrendingUp,
  Zap,
  Send,
  Bot,
  Sparkles,
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
import { SportIcon, SPORT_COLORS } from '../components/ui/SportIcon'
import { LevelCard } from '../components/ui/LevelCard'

// ─── Animation Variants ─────────────────────────────────────────────────────
const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
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

// ─── Suggestion Chips ───────────────────────────────────────────────────────
const suggestionChips = [
  { label: 'Analiza mi semana', path: '/app/ia-coach' },
  { label: 'Ajusta mi plan', path: '/app/ia-coach' },
  { label: '¿Estoy sobreentrenando?', path: '/app/ia-coach' },
]

// ─── Dashboard Component ────────────────────────────────────────────────────
export function Dashboard() {
  const { t, language } = useI18n()
  const { profile } = useAuth()
  const { metrics, hasData, loading } = useDashboardMetrics()
  const { data: today, loading: todayLoading } = useTodaySession()
  const { status: stravaStatus, loading: stravaLoading } = useStravaConnection()

  const stravaConnected = Boolean(stravaStatus?.connected)
  const showEmpty = !loading && !hasData
  const showOnboarding = showEmpty && !stravaConnected
  const showSyncing = showEmpty && stravaConnected
  const fullName = profile?.display_name ?? 'Atleta'
  const firstName = fullName.split(' ')[0] ?? fullName

  const [coachInput, setCoachInput] = useState('')

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

  // Get the latest activity for dynamic AI welcome message
  const latestActivity = metrics.recent[0]
  const aiMessage = useMemo(() => {
    if (latestActivity) {
      const sportLabel = latestActivity.sport === 'bike' ? 'rodada' : latestActivity.sport === 'run' ? 'carrera' : 'sesión'
      const distStr = latestActivity.distance_km ? ` de ${latestActivity.distance_km.toFixed(1)}km` : ''
      const powerStr = latestActivity.avg_hr ? ` a ${latestActivity.avg_hr}bpm` : ''
      return language === 'es'
        ? `Hoy estuviste a tope en tu ${sportLabel}${distStr}${powerStr}. ¡Gran ritmo! 🚴`
        : `You crushed it on your ${latestActivity.sport} session${distStr}${powerStr}. Great pace! 🚴`
    }
    return language === 'es'
      ? 'Conecta Strava para recibir análisis personalizados de tu entrenamiento.'
      : 'Connect Strava to get personalized training insights.'
  }, [latestActivity, language])

  return (
    <div className="page-dashboard">
      {/* ── 1. Peak IA Coach — MERGED compact card ───────────────── */}
      <motion.section
        className="glass-card coach-compact-card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="coach-compact-glow" aria-hidden />
        <div className="welcome-badge-row">
          <Sparkles size={16} strokeWidth={1.5} className="welcome-sparkle" />
          <span className="badge">Peak IA Coach</span>
        </div>
        <h2 className="welcome-greeting">
          👋 {language === 'es' ? 'BUENOS DÍAS' : 'GOOD MORNING'}, {firstName}
        </h2>
        <p className="welcome-message">
          "{aiMessage}"
        </p>
        <div className="coach-compact-input-row">
          <input
            type="text"
            className="coach-quick-input"
            placeholder={language === 'es' ? 'Pregunta a tu coach...' : 'Ask your coach...'}
            value={coachInput}
            onChange={(e) => setCoachInput(e.target.value)}
          />
          <button
            type="button"
            className="coach-quick-send"
            disabled={!coachInput.trim()}
            onClick={() => {
              if (coachInput.trim()) {
                window.location.href = '/app/ia-coach'
              }
            }}
          >
            <Send size={16} strokeWidth={1.5} />
          </button>
        </div>
        <div className="coach-quick-chips">
          {suggestionChips.map((chip) => (
            <Link key={chip.label} to={chip.path} className="chip chip-sm">
              💡 {chip.label}
            </Link>
          ))}
        </div>
      </motion.section>

      {/* ── 2. Energy / Readiness Ring ──────────────────────────── */}
      <motion.section
        className="glass-card energy-card"
        custom={2}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
      >
        <div className="energy-ring-container">
          <div className="energy-ring-chart">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Energy', value: 82 },
                    { name: 'Remaining', value: 18 },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={44}
                  outerRadius={62}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={10}
                >
                  <Cell fill="var(--accent)" />
                  <Cell fill="rgba(255,255,255,0.06)" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="energy-ring-label">
              <span className="energy-ring-pct">82%</span>
              <span className="energy-ring-title">Energy</span>
            </div>
          </div>
          <div className="energy-metrics">
            <h3 className="energy-card-title">{language === 'es' ? 'Nivel de Recuperación' : 'Readiness Level'}</h3>
            <div className="energy-metrics-grid">
              <div className="energy-metric">
                <Moon size={14} strokeWidth={1.5} />
                <div className="energy-metric-body">
                  <span className="energy-metric-label">{language === 'es' ? 'Sueño' : 'Sleep'}</span>
                  <span className="energy-metric-value">7.2h</span>
                </div>
              </div>
              <div className="energy-metric">
                <Heart size={14} strokeWidth={1.5} />
                <div className="energy-metric-body">
                  <span className="energy-metric-label">HRV</span>
                  <span className="energy-metric-value">58ms</span>
                </div>
              </div>
              <div className="energy-metric">
                <Activity size={14} strokeWidth={1.5} />
                <div className="energy-metric-body">
                  <span className="energy-metric-label">{language === 'es' ? 'Recuperación' : 'Recovery'}</span>
                  <span className="energy-metric-value">92%</span>
                </div>
              </div>
            </div>
            <small className="text-muted energy-hint">
              {language === 'es'
                ? '📱 Datos en vivo cuando conectes tu smartwatch o anillo.'
                : '📱 Live data when you connect your smartwatch or ring.'}
            </small>
          </div>
        </div>
      </motion.section>

      {/* ── Connect-Strava nudge ──────────────────────────────────────── */}
      {!stravaLoading && !stravaConnected && !showOnboarding && (
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

      {/* ── Onboarding state: no Strava connected ────────────────────── */}
      {showOnboarding ? (
        <motion.section
          className="glass-card onboarding-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="onboarding-illustration">
            <Zap size={48} strokeWidth={1.5} />
          </div>
          <h2 className="onboarding-title">{t('onboardingTitle')}</h2>
          <p className="onboarding-subtitle">{t('onboardingSubtitle')}</p>
          <Link to="/app/conexiones" className="btn-primary onboarding-cta">
            <span className="strava-mark">S</span>
            {t('connectStrava')}
          </Link>
          <div className="onboarding-meta">
            <span className="onboarding-meta-item"><TrendingUp size={14} strokeWidth={1.5} /> CTL · ATL · TSB</span>
            <span className="onboarding-meta-item"><Activity size={14} strokeWidth={1.5} /> {language === 'es' ? 'Carga semanal' : 'Weekly load'}</span>
            <span className="onboarding-meta-item"><Flame size={14} strokeWidth={1.5} /> {language === 'es' ? 'Distribución por deporte' : 'Sport distribution'}</span>
          </div>
        </motion.section>
      ) : showSyncing ? (
        <motion.section
          className="glass-card onboarding-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="onboarding-illustration is-syncing">
            <div className="spinner" />
          </div>
          <h2 className="onboarding-title">{t('syncingTitle')}</h2>
          <p className="onboarding-subtitle">{t('syncingSubtitle')}</p>
        </motion.section>
      ) : (
      <>
      {/* ── Metrics Grid ───────────────────────────────────────────────── */}
      <section className="metrics-grid">
        {[
          { icon: <Heart size={18} strokeWidth={1.5} />, label: t('mForma'), value: metrics.formPct, unit: '%', color: 'green' },
          { icon: <Zap size={18} strokeWidth={1.5} />, label: t('mCarga'), value: metrics.weeklyTss, unit: 'TSS', color: 'blue' },
          { icon: <TrendingUp size={18} strokeWidth={1.5} />, label: t('mAptitud'), value: metrics.ctl, unit: 'CTL', color: 'purple' },
          { icon: <Flame size={18} strokeWidth={1.5} />, label: t('mFatiga'), value: metrics.atl, unit: 'ATL', color: 'orange' },
        ].map((m, i) => (
          <motion.div
            key={m.label}
            className={`metric-card metric-${m.color}`}
            custom={i + 3}
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

      {/* ── Level & achievements (gamification) ────────────────────────── */}
      <LevelCard />

      {/* ── Performance Management Chart (PMC) ─────────────────────────── */}
      <motion.section
        className="card chart-card"
        custom={7}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
      >
        <div className="card-header">
          <TrendingUp size={16} strokeWidth={1.5} />
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
          custom={8}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <div className="card-header">
            <Zap size={16} strokeWidth={1.5} />
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
          custom={9}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <div className="card-header">
            <Activity size={16} strokeWidth={1.5} />
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
          custom={10}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <div className="card-header">
            <Activity size={16} strokeWidth={1.5} />
            <span>{t('trainingOfDay')}</span>
          </div>
          {todayLoading ? (
            <div className="empty-state"><div className="spinner" /></div>
          ) : today ? (
            <div className="today-session">
              <div className="today-session-icon"><SportIcon sport={today.sport} size={16} /></div>
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
          custom={11}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <div className="card-header">
            <Moon size={16} strokeWidth={1.5} />
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
          custom={12}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <div className="card-header">
            <Zap size={16} strokeWidth={1.5} />
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
                  <span className="recent-icon"><SportIcon sport={a.sport} size={14} /></span>
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
      </>
      )}
    </div>
  )
}
