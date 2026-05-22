import {
  Bell,
  Bot,
  CalendarDays,
  Dumbbell,
  Flag,
  Globe,
  Home,
  LineChart,
  MoreHorizontal,
  Plug,
  Search,
  Settings,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import {
  startTransition,
  useDeferredValue,
  useEffect,
  useState,
} from 'react'
import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { appBrand, appNavigation, languages, mobileNavigation } from '@peak-ui'
import { createAiProposal } from './lib/ai-engine'
import { buildCoachContext } from './lib/context-builder'
import { t } from './lib/i18n'
import peakLogo from './assets/peak-logo.png'
import {
  calendarMonths,
  initialActivities,
  initialAiSettings,
  initialAiUsage,
  initialConnections,
  initialSessions,
  raceDate,
  sparklineSets,
} from './lib/mock-data'
import { supabaseConfigured } from './lib/supabase'
import type {
  AiSettings,
  AppLanguage,
  AthleteUser,
  DateRange,
  ImportedActivity,
  PendingAiAction,
  SourceConnection,
  TrainingSession,
} from './lib/types'

const iconMap = {
  home: Home,
  calendar: CalendarDays,
  dumbbell: Dumbbell,
  flag: Flag,
  sparkles: Sparkles,
  chart: LineChart,
  trending: TrendingUp,
  plug: Plug,
  settings: Settings,
  more: MoreHorizontal,
} as const

const storageKeys = {
  user: 'peak-v2-user',
  language: 'peak-v2-language',
  selectedDate: 'peak-v2-selected-date',
  dateRange: 'peak-v2-range',
  aiSettings: 'peak-v2-ai-settings',
  aiUsage: 'peak-v2-ai-usage',
  sessions: 'peak-v2-sessions',
  pendingAction: 'peak-v2-pending-action',
}

function loadStored<T>(key: string, fallback: T): T {
  const value = localStorage.getItem(key)
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function App() {
  const [language, setLanguage] = useState<AppLanguage>(() => loadStored(storageKeys.language, 'es'))
  const [user, setUser] = useState<AthleteUser | null>(() => loadStored(storageKeys.user, null))
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [sessions, setSessions] = useState<TrainingSession[]>(() => loadStored(storageKeys.sessions, initialSessions))
  const [activities] = useState<ImportedActivity[]>(initialActivities)
  const [connections] = useState<SourceConnection[]>(initialConnections)
  const [selectedDate, setSelectedDate] = useState(() => loadStored(storageKeys.selectedDate, '2026-05-01'))
  const [range, setRange] = useState<DateRange>(() =>
    loadStored(storageKeys.dateRange, { start: '2026-04-24', end: '2026-05-24' }),
  )
  const [aiSettings, setAiSettings] = useState<AiSettings>(() => loadStored(storageKeys.aiSettings, initialAiSettings))
  const [aiUsage, setAiUsage] = useState(() => loadStored(storageKeys.aiUsage, initialAiUsage))
  const [pendingAction, setPendingAction] = useState<PendingAiAction | null>(() =>
    loadStored(storageKeys.pendingAction, null),
  )
  const deferredRange = useDeferredValue(range)

  useEffect(() => {
    localStorage.setItem(storageKeys.language, JSON.stringify(language))
    localStorage.setItem(storageKeys.user, JSON.stringify(user))
    localStorage.setItem(storageKeys.selectedDate, JSON.stringify(selectedDate))
    localStorage.setItem(storageKeys.dateRange, JSON.stringify(range))
    localStorage.setItem(storageKeys.aiSettings, JSON.stringify(aiSettings))
    localStorage.setItem(storageKeys.aiUsage, JSON.stringify(aiUsage))
    localStorage.setItem(storageKeys.sessions, JSON.stringify(sessions))
    localStorage.setItem(storageKeys.pendingAction, JSON.stringify(pendingAction))
  }, [language, user, selectedDate, range, aiSettings, aiUsage, sessions, pendingAction])

  if (!isAuthenticated) {
    return (
      <SignInScreen
        language={language}
        setLanguage={setLanguage}
        initialUser={user}
        onEnter={(nextUser) => {
          setUser(nextUser)
          setIsAuthenticated(true)
        }}
      />
    )
  }

  if (!user) {
    return (
      <SignInScreen
        language={language}
        setLanguage={setLanguage}
        initialUser={null}
        onEnter={(nextUser) => {
          setUser(nextUser)
          setIsAuthenticated(true)
        }}
      />
    )
  }

  const copy = (key: Parameters<typeof t>[1]) => t(language, key)
  const rangeActivities = activities.filter((activity) => activity.date >= deferredRange.start && activity.date <= deferredRange.end)
  const rangeSessions = sessions.filter((session) => session.date >= deferredRange.start && session.date <= deferredRange.end)
  const selectedSession = sessions.find((session) => session.date === selectedDate) ?? null
  const selectedActivity = activities.find((activity) => activity.date === selectedDate) ?? null
  const coachContext = buildCoachContext({
    selectedDate,
    range: deferredRange,
    sessions,
    activities,
    connections,
    aiSettings,
    aiUsage,
    language,
  })

  const remainingAi = aiUsage.limit - aiUsage.used
  const recoveryScore = 85
  const todaySession = sessions.find((session) => session.date === selectedDate) ?? sessions[2]

  function onCreateProposal(kind: PendingAiAction['kind']) {
    if (remainingAi <= 0) return
    const proposal = createAiProposal({ kind, selectedSession, selectedDate })
    setAiUsage((current) => ({ ...current, used: current.used + 1 }))
    setPendingAction(proposal)
  }

  function onApplyPendingAction() {
    if (!pendingAction) return
    startTransition(() => {
      setSessions((current) =>
        current.map((session) => {
          const edit = pendingAction.sessionEdits.find((item) => item.sessionId === session.id)
          return edit ? { ...session, ...edit.patch } : session
        }),
      )
      setPendingAction(null)
    })
  }

  function onDiscardPendingAction() {
    setPendingAction(null)
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-lockup">
          <img src={peakLogo} alt="Peak Endurance" className="brand-logo" />
        </div>

        <nav className="nav-stack">
          {appNavigation.map((item) => {
            const Icon = iconMap[item.icon]
            return (
              <NavLink key={item.id} to={item.path} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                <Icon size={18} />
                <span>{copy(item.id as Parameters<typeof t>[1])}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="sidebar-card">
          <div className="eyebrow">{copy('sourceMix')}</div>
          {connections.filter((item) => item.connected).map((item) => (
            <div key={item.source} className="source-row">
              <span className="source-dot" style={{ backgroundColor: item.color }} />
              <div>
                <strong>{item.label}</strong>
                <small>{copy('connected')}</small>
              </div>
            </div>
          ))}
        </div>

        <div className="pro-card">
          <div>
            <div className="eyebrow">{copy('freePlan')}</div>
            <strong>{remainingAi} {copy('aiLeft')}</strong>
          </div>
          <button type="button" className="ghost-button">Mejorar</button>
        </div>

        <button type="button" className="profile-chip" onClick={() => setIsAuthenticated(false)}>
          <span className="avatar">{user.name.slice(0, 1)}</span>
          <span>{user.name}</span>
        </button>
      </aside>

      <main className="main-stage">
        <header className="topbar">
          <div>
            <h1>{copy('greeting')}, {user.name}! <span className="wave">👋</span></h1>
            <p>{copy('subtitle')}</p>
          </div>

          <div className="top-actions">
            <button type="button" className="icon-button"><Search size={18} /></button>
            <button type="button" className="icon-button"><Bell size={18} /></button>
            <label className="language-switch">
              <Globe size={16} />
              <select value={language} onChange={(event) => setLanguage(event.target.value as AppLanguage)}>
                {languages.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </label>
            <div className="avatar hero-avatar">{user.name.slice(0, 1)}</div>
          </div>
        </header>

        {pendingAction ? (
          <section className="pending-banner">
            <div>
              <div className="eyebrow">{copy('pending')}</div>
              <strong>{pendingAction.headline}</strong>
              <p>{pendingAction.summary}</p>
            </div>
            <div className="pending-actions">
              <button type="button" className="primary-button" onClick={onApplyPendingAction}>{copy('confirm')}</button>
              <button type="button" className="secondary-button" onClick={onDiscardPendingAction}>{copy('discard')}</button>
            </div>
          </section>
        ) : null}

        <Routes>
          <Route
            path="/"
            element={
              <DashboardPage
                copy={copy}
                coachContext={coachContext}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                range={range}
                setRange={setRange}
                sessions={sessions}
                activities={activities}
                rangeActivities={rangeActivities}
                rangeSessions={rangeSessions}
                selectedActivity={selectedActivity}
                selectedSession={selectedSession}
                todaySession={todaySession}
                recoveryScore={recoveryScore}
                aiUsage={aiUsage}
                onCreateProposal={onCreateProposal}
                language={language}
              />
            }
          />
          <Route
            path="/calendario"
            element={
              <CalendarOnlyPage
                copy={copy}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                sessions={sessions}
                activities={activities}
                selectedActivity={selectedActivity}
              />
            }
          />
          <Route path="/entrenamientos" element={<TrainingListPage copy={copy} sessions={sessions} />} />
          <Route path="/plan" element={<PlanPage sessions={sessions} />} />
          <Route
            path="/ia-coach"
            element={
              <AiCoachPage
                copy={copy}
                aiUsage={aiUsage}
                aiSettings={aiSettings}
                coachContext={coachContext}
                onCreateProposal={onCreateProposal}
              />
            }
          />
          <Route path="/analisis" element={<AnalysisPage copy={copy} rangeActivities={rangeActivities} />} />
          <Route path="/progreso" element={<ProgressPage />} />
          <Route path="/conexiones" element={<ConnectionsPage copy={copy} connections={connections} />} />
          <Route
            path="/ajustes"
            element={
              <SettingsPage
                copy={copy}
                aiSettings={aiSettings}
                language={language}
                setLanguage={setLanguage}
                setAiSettings={setAiSettings}
                supabaseConfigured={supabaseConfigured}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <nav className="mobile-nav">
          {mobileNavigation.map((item) => {
            const Icon = iconMap[item.icon]
            return (
              <NavLink key={item.id} to={item.path} className={({ isActive }) => `mobile-item${isActive ? ' active' : ''}`}>
                <Icon size={18} />
                <span>{copy(item.id === 'mas' ? 'settings' : item.id as Parameters<typeof t>[1])}</span>
              </NavLink>
            )
          })}
        </nav>
      </main>
    </div>
  )
}

function SignInScreen({
  language,
  setLanguage,
  initialUser,
  onEnter,
}: {
  language: AppLanguage
  setLanguage: (language: AppLanguage) => void
  initialUser: AthleteUser | null
  onEnter: (user: AthleteUser) => void
}) {
  const [name, setName] = useState(initialUser?.name ?? 'Andres')
  const [email, setEmail] = useState(initialUser?.email ?? 'andres@peak.local')

  return (
    <div className="signin-shell">
      <div className="signin-panel">
        <div className="brand-lockup">
          <img src={peakLogo} alt="Peak Endurance" className="brand-logo signin-logo" />
        </div>

        <h1>{appBrand.name}</h1>
        <p>Tu panel de rendimiento para planificar, ajustar y optimizar cada semana.</p>

        <div className="signin-grid">
          <label>
            Nombre completo
            <input value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label>
            Correo
            <input value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
        </div>

        <div className="signin-actions">
          <button type="button" className="primary-button" onClick={() => onEnter({ name, email, role: 'Athlete' })}>
            {t(language, 'signIn')}
          </button>
          <button type="button" className="secondary-button" onClick={() => onEnter({ name: 'Andres', email: 'demo@peak.local', role: 'Athlete' })}>
            {t(language, 'demo')}
          </button>
        </div>

        <label className="language-switch inline-switch">
          <Globe size={16} />
          <select value={language} onChange={(event) => setLanguage(event.target.value as AppLanguage)}>
            {languages.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </label>
      </div>
    </div>
  )
}

function DashboardPage(props: {
  copy: (key: Parameters<typeof t>[1]) => string
  coachContext: ReturnType<typeof buildCoachContext>
  selectedDate: string
  setSelectedDate: (date: string) => void
  range: DateRange
  setRange: (range: DateRange) => void
  sessions: TrainingSession[]
  activities: ImportedActivity[]
  rangeActivities: ImportedActivity[]
  rangeSessions: TrainingSession[]
  selectedActivity: ImportedActivity | null
  selectedSession: TrainingSession | null
  todaySession: TrainingSession
  recoveryScore: number
  aiUsage: { used: number; limit: number; plan: 'free' | 'pro' }
  onCreateProposal: (kind: PendingAiAction['kind']) => void
  language: AppLanguage
}) {
  const loadObjective = props.rangeActivities.reduce((sum, item) => sum + item.tss, 0)
  const trainingHours = props.rangeActivities.reduce((sum, item) => sum + item.durationMinutes, 0) / 60
  const raceCountdown = Math.max(
    0,
    Math.ceil((new Date(raceDate).getTime() - new Date(props.selectedDate).getTime()) / 86400000),
  )

  return (
    <div className="dashboard-layout">
      <section className="content-column">
        <section className="hero-card fade-up">
          <div className="hero-copy">
            <div className="eyebrow">Peak IA Coach</div>
            <h2>
              Tu entrenador inteligente.
              <span className="accent-line">Planifica. Ajusta. Optimiza.</span>
            </h2>
            <p>{props.copy('allContext')}</p>
            <div className="hero-actions">
              <button type="button" className="primary-button" onClick={() => props.onCreateProposal('analyze_week')}>
                {props.copy('analyzeWeek')}
              </button>
              <button type="button" className="secondary-button" onClick={() => props.onCreateProposal('adjust_plan')}>
                {props.copy('adjustPlan')}
              </button>
              <button type="button" className="secondary-button" onClick={() => props.onCreateProposal('detect_fatigue')}>
                {props.copy('detectFatigue')}
              </button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="brain-core" />
            <div className="brain-orbit orbit-a" />
            <div className="brain-orbit orbit-b" />
            <div className="brain-panel">
              <span>Forma</span>
              <strong>87%</strong>
              <small>Listo para un bloque fuerte</small>
            </div>
          </div>
        </section>

        <section className="metric-grid fade-up">
          <MetricCard title="Forma actual" value="87%" accent="green" series={sparklineSets.form} />
          <MetricCard title="Carga semanal" value="842" accent="blue" series={sparklineSets.load} />
          <MetricCard title="Aptitud (CTL)" value="72" accent="green" series={sparklineSets.ctl} />
          <MetricCard title="Fatiga (ATL)" value="68" accent="orange" series={sparklineSets.atl} />
          <MetricCard title="Forma (TSB)" value="4" accent="blue" series={sparklineSets.tsb} />
        </section>

        <section className="calendar-panel fade-up">
          <div className="panel-head">
            <div>
              <div className="eyebrow">{props.copy('calendar')}</div>
              <strong>Tres meses en una misma línea de trabajo</strong>
            </div>
            <div className="range-controls">
              <label>
                {props.copy('range')}
                <input
                  type="date"
                  value={props.range.start}
                  onChange={(event) => props.setRange({ ...props.range, start: event.target.value })}
                />
              </label>
              <label>
                &nbsp;
                <input
                  type="date"
                  value={props.range.end}
                  onChange={(event) => props.setRange({ ...props.range, end: event.target.value })}
                />
              </label>
            </div>
          </div>
          <CalendarBoard
            months={calendarMonths}
            selectedDate={props.selectedDate}
            sessions={props.sessions}
            activities={props.activities}
            onSelectDate={(date) => startTransition(() => props.setSelectedDate(date))}
          />
        </section>
      </section>

      <aside className="rail-column fade-up">
        <section className="rail-card">
          <div className="eyebrow">{props.copy('quickRead')}</div>
          <div className="rail-stack">
            <div className="mini-ring">
              <div className="mini-ring-value">{props.recoveryScore}%</div>
            </div>
            <div className="rail-details">
              <div><span>Sueño</span><strong>7h 45m</strong></div>
              <div><span>HRV</span><strong>78 ms</strong></div>
              <div><span>FC reposo</span><strong>48 bpm</strong></div>
            </div>
          </div>
        </section>

        <section className="rail-card">
          <div className="eyebrow">{props.copy('trainingOfDay')}</div>
          <strong>{props.todaySession.title}</strong>
          <div className="split-stats">
            <span>{props.todaySession.durationMinutes} min</span>
            <span>{props.todaySession.tss} TSS</span>
          </div>
          <div className="bar-chart">
            {sparklineSets.load.map((value, index) => (
              <i key={`${value}-${index}`} style={{ height: `${18 + (value % 42)}px` }} />
            ))}
          </div>
          <button type="button" className="primary-button full-width">Iniciar entrenamiento</button>
        </section>

        <section className="rail-card">
          <div className="eyebrow">{props.copy('upcomingRace')}</div>
          <strong>Copa Peak Endurance</strong>
          <p>03 de mayo, 2026</p>
          <div className="race-countdown">
            <span>{raceCountdown}</span>
            <small>días</small>
          </div>
        </section>

        <section className="rail-card">
          <div className="eyebrow">{props.copy('weeklyState')}</div>
          <div className="progress-row">
            <span>Entrenamientos</span>
            <strong>{props.rangeActivities.length} / {props.rangeSessions.length || 1}</strong>
          </div>
          <div className="progress-row">
            <span>Horas</span>
            <strong>{trainingHours.toFixed(1)}h</strong>
          </div>
          <div className="progress-row">
            <span>TSS</span>
            <strong>{loadObjective}</strong>
          </div>
          <div className="quota-pill">
            <Bot size={16} />
            <span>{props.aiUsage.limit - props.aiUsage.used} consultas IA restantes</span>
          </div>
        </section>

        <section className="rail-card">
          <div className="eyebrow">{props.copy('context')}</div>
          <pre className="context-preview">{JSON.stringify(props.coachContext.summary, null, 2)}</pre>
        </section>
      </aside>
    </div>
  )
}

function CalendarOnlyPage(props: {
  copy: (key: Parameters<typeof t>[1]) => string
  selectedDate: string
  setSelectedDate: (date: string) => void
  sessions: TrainingSession[]
  activities: ImportedActivity[]
  selectedActivity: ImportedActivity | null
}) {
  return (
    <section className="page-card">
      <div className="panel-head">
        <div>
          <div className="eyebrow">{props.copy('calendar')}</div>
          <strong>Vista continua abril, mayo y junio</strong>
        </div>
      </div>
      <CalendarBoard
        months={calendarMonths}
        selectedDate={props.selectedDate}
        sessions={props.sessions}
        activities={props.activities}
        onSelectDate={props.setSelectedDate}
      />
      <section className="activity-detail">
        <div>
          <div className="eyebrow">Actividad real</div>
          <strong>{props.selectedActivity?.title ?? 'Sin actividad registrada'}</strong>
        </div>
        {props.selectedActivity ? <ZonePrecisionBlock activity={props.selectedActivity} /> : null}
      </section>
    </section>
  )
}

function TrainingListPage({ copy, sessions }: { copy: (key: Parameters<typeof t>[1]) => string; sessions: TrainingSession[] }) {
  return (
    <section className="page-card">
      <div className="panel-head"><strong>{copy('sessions')}</strong></div>
      <div className="session-list">
        {sessions.map((session) => (
          <article key={session.id} className="session-item">
            <div>
              <strong>{session.title}</strong>
              <p>{session.date} · {session.sport}</p>
            </div>
            <div className="session-meta">{session.durationMinutes} min · {session.tss} TSS</div>
          </article>
        ))}
      </div>
    </section>
  )
}

function PlanPage({ sessions }: { sessions: TrainingSession[] }) {
  const grouped = calendarMonths.map((month) => ({
    month,
    items: sessions.filter((session) => session.date.startsWith(month)),
  }))
  return (
    <section className="page-card">
      <div className="panel-head"><strong>Plan por bloque</strong></div>
      <div className="block-grid">
        {grouped.map((group) => (
          <article key={group.month} className="block-card">
            <div className="eyebrow">{group.month}</div>
            <strong>{group.items.length} sesiones</strong>
            <p>{group.items.map((item) => item.title).slice(0, 3).join(', ')}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function AiCoachPage(props: {
  copy: (key: Parameters<typeof t>[1]) => string
  aiUsage: { used: number; limit: number; plan: 'free' | 'pro' }
  aiSettings: AiSettings
  coachContext: ReturnType<typeof buildCoachContext>
  onCreateProposal: (kind: PendingAiAction['kind']) => void
}) {
  return (
    <section className="page-card">
      <div className="panel-head">
        <div>
          <div className="eyebrow">{props.copy('aiCoach')}</div>
          <strong>IA accionable con confirmación</strong>
        </div>
      </div>
      <div className="ai-grid">
        <article className="ai-card">
          <strong>Acciones</strong>
          <div className="hero-actions stacked">
            <button type="button" className="primary-button" onClick={() => props.onCreateProposal('analyze_week')}>{props.copy('analyzeWeek')}</button>
            <button type="button" className="secondary-button" onClick={() => props.onCreateProposal('adjust_plan')}>{props.copy('adjustPlan')}</button>
            <button type="button" className="secondary-button" onClick={() => props.onCreateProposal('detect_fatigue')}>{props.copy('detectFatigue')}</button>
          </div>
        </article>
        <article className="ai-card">
          <strong>Configuración actual</strong>
          <p>Tono: {props.aiSettings.tone}</p>
          <p>Autonomia: {props.aiSettings.autonomy}</p>
          <p>Equipo: {props.aiSettings.equipment}</p>
          <p>Uso: {props.aiUsage.used}/{props.aiUsage.limit}</p>
        </article>
        <article className="ai-card context-card">
          <strong>{props.copy('context')}</strong>
          <pre className="context-preview">{JSON.stringify(props.coachContext, null, 2)}</pre>
        </article>
      </div>
    </section>
  )
}

function AnalysisPage({
  copy,
  rangeActivities,
}: {
  copy: (key: Parameters<typeof t>[1]) => string
  rangeActivities: ImportedActivity[]
}) {
  return (
    <section className="page-card">
      <div className="panel-head"><strong>{copy('analysis')}</strong></div>
      <div className="analysis-grid">
        {rangeActivities.map((activity) => (
          <article key={activity.id} className="analysis-card">
            <div className="analysis-head">
              <strong>{activity.title}</strong>
              <span className={`precision precision-${activity.zonePrecision}`}>{copy(activity.zonePrecision === 'real' ? 'precisionReal' : activity.zonePrecision === 'estimated' ? 'precisionEstimated' : 'precisionMissing')}</span>
            </div>
            <ZonePrecisionBlock activity={activity} />
          </article>
        ))}
      </div>
    </section>
  )
}

function ProgressPage() {
  return (
    <section className="page-card">
      <div className="panel-head"><strong>Progreso</strong></div>
      <div className="metric-grid">
        <MetricCard title="Forma" value="87%" accent="green" series={sparklineSets.form} />
        <MetricCard title="Carga" value="842" accent="blue" series={sparklineSets.load} />
        <MetricCard title="Fatiga" value="68" accent="orange" series={sparklineSets.atl} />
      </div>
    </section>
  )
}

function ConnectionsPage({
  copy,
  connections,
}: {
  copy: (key: Parameters<typeof t>[1]) => string
  connections: SourceConnection[]
}) {
  return (
    <section className="page-card">
      <div className="panel-head"><strong>{copy('connections')}</strong></div>
      <div className="connection-grid">
        {connections.map((connection) => (
          <article key={connection.source} className="connection-card">
            <div className="source-row">
              <span className="source-dot" style={{ backgroundColor: connection.color }} />
              <div>
                <strong>{connection.label}</strong>
                <small>{connection.connected ? copy('connected') : 'Próximamente'}</small>
              </div>
            </div>
            <p>{connection.connected ? `Última sincronización ${connection.lastSync.slice(0, 10)}` : 'Adaptador preparado para la siguiente fase.'}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function SettingsPage(props: {
  copy: (key: Parameters<typeof t>[1]) => string
  aiSettings: AiSettings
  language: AppLanguage
  setLanguage: (language: AppLanguage) => void
  setAiSettings: (settings: AiSettings) => void
  supabaseConfigured: boolean
}) {
  return (
    <section className="page-card">
      <div className="panel-head"><strong>{props.copy('settings')}</strong></div>
      <div className="settings-grid">
        <label>
          {props.copy('language')}
          <select value={props.language} onChange={(event) => props.setLanguage(event.target.value as AppLanguage)}>
            {languages.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </label>
        <label>
          Tono IA
          <select
            value={props.aiSettings.tone}
            onChange={(event) => props.setAiSettings({ ...props.aiSettings, tone: event.target.value as AiSettings['tone'] })}
          >
            <option value="supportive">Acompañante</option>
            <option value="direct">Directo</option>
          </select>
        </label>
        <label>
          Equipo disponible
          <input
            value={props.aiSettings.equipment}
            onChange={(event) => props.setAiSettings({ ...props.aiSettings, equipment: event.target.value })}
          />
        </label>
        <label>
          Contexto extra
          <textarea
            value={props.aiSettings.extraContext}
            onChange={(event) => props.setAiSettings({ ...props.aiSettings, extraContext: event.target.value })}
          />
        </label>
      </div>
      <div className="status-callout">
        Supabase: {props.supabaseConfigured ? 'configurado' : 'pendiente de variables de entorno'}
      </div>
    </section>
  )
}

function CalendarBoard({
  months,
  selectedDate,
  sessions,
  activities,
  onSelectDate,
}: {
  months: string[]
  selectedDate: string
  sessions: TrainingSession[]
  activities: ImportedActivity[]
  onSelectDate: (date: string) => void
}) {
  return (
    <div className="months-strip">
      {months.map((month) => (
        <MonthCard
          key={month}
          month={month}
          selectedDate={selectedDate}
          sessions={sessions.filter((item) => item.date.startsWith(month))}
          activities={activities.filter((item) => item.date.startsWith(month))}
          onSelectDate={onSelectDate}
        />
      ))}
    </div>
  )
}

function MonthCard({
  month,
  selectedDate,
  sessions,
  activities,
  onSelectDate,
}: {
  month: string
  selectedDate: string
  sessions: TrainingSession[]
  activities: ImportedActivity[]
  onSelectDate: (date: string) => void
}) {
  const [year, monthValue] = month.split('-').map(Number)
  const firstDay = new Date(year, monthValue - 1, 1)
  const offset = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(year, monthValue, 0).getDate()
  const cells = Array.from({ length: offset + daysInMonth }, (_, index) => {
    const day = index - offset + 1
    if (day < 1 || day > daysInMonth) return null
    const date = `${month}-${String(day).padStart(2, '0')}`
    const session = sessions.find((item) => item.date === date)
    const activity = activities.find((item) => item.date === date)
    const isRace = date === raceDate
    return { date, day, session, activity, isRace }
  })

  return (
    <section className="month-card">
      <div className="month-title">{new Date(year, monthValue - 1, 1).toLocaleString('es-CO', { month: 'long', year: 'numeric' })}</div>
      <div className="month-weekdays">
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day) => (
          <span key={`${month}-${day}`}>{day}</span>
        ))}
      </div>
      <div className="month-grid">
        {cells.map((cell, index) =>
          cell ? (
            <button
              type="button"
              key={cell.date}
              className={`day-cell${cell.date === selectedDate ? ' active' : ''}${cell.isRace ? ' race' : ''}`}
              onClick={() => onSelectDate(cell.date)}
            >
              <strong>{cell.day}</strong>
              <small>{cell.session?.title ?? 'Libre'}</small>
              {cell.activity ? <span className="activity-pill">{cell.activity.sourceType}</span> : null}
            </button>
          ) : (
            <span key={`${month}-${index}`} className="day-cell empty" />
          ),
        )}
      </div>
    </section>
  )
}

function MetricCard({
  title,
  value,
  accent,
  series,
}: {
  title: string
  value: string
  accent: 'green' | 'blue' | 'orange'
  series: number[]
}) {
  return (
    <article className={`metric-card accent-${accent}`}>
      <div className="eyebrow">{title}</div>
      <strong>{value}</strong>
      <svg viewBox="0 0 100 40" className="sparkline" preserveAspectRatio="none">
        <path d={toSparklinePath(series)} />
      </svg>
    </article>
  )
}

function ZonePrecisionBlock({ activity }: { activity: ImportedActivity }) {
  return (
    <div className="zone-stack">
      {Object.entries(activity.zoneBreakdown).map(([zone, value]) => (
        <div key={zone} className="zone-row">
          <span>{zone.toUpperCase()}</span>
          <div className="zone-bar"><i style={{ width: `${Math.max(6, value)}%` }} /></div>
          <strong>{value}m</strong>
        </div>
      ))}
    </div>
  )
}

function toSparklinePath(series: number[]) {
  const max = Math.max(...series)
  const min = Math.min(...series)
  return series
    .map((value, index) => {
      const x = (index / (series.length - 1)) * 100
      const normalized = max === min ? 20 : 36 - ((value - min) / (max - min)) * 28
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${normalized.toFixed(2)}`
    })
    .join(' ')
}

export default App
