// ─── Core App Types ───────────────────────────────────────────────────────────

export type AppLanguage = 'es' | 'en'
export type ThemeMode = 'dark' | 'light' | 'midnight' | 'forest'
export type AccentColor = 'rgb' | 'green' | 'orange' | 'yellow' | 'blue' | 'purple' | 'red' | 'pink' | 'cyan' | 'white'

// ─── Auth ─────────────────────────────────────────────────────────────────────

export type AuthProfile = {
  id: string
  email: string | null
  display_name: string | null
  avatar_url: string | null
  username: string | null
  location: string | null
  bio: string | null
  created_at: string | null
  onboarding_completed: boolean
  subscription_tier: string | null
  subscription_expires_at: string | null
  subscription_status: string | null
}

// ─── Training ─────────────────────────────────────────────────────────────────

export type SessionStatus = 'planned' | 'completed' | 'skipped'
export type SessionIntensity = 'low' | 'moderate' | 'high' | 'rest'
export type SportType = 'run' | 'bike' | 'swim' | 'gym' | 'rest' | 'race' | 'other'

export type TrainingSession = {
  id: string
  user_id: string
  date: string
  title: string
  sport: SportType
  duration_minutes: number
  tss: number
  status: SessionStatus
  intensity: SessionIntensity
  notes: string
  created_at: string
}

// ─── Activities (from connected sources) ──────────────────────────────────────

export type SourceType = 'strava' | 'garmin' | 'coros' | 'manual'
export type ZonePrecision = 'real' | 'estimated' | 'insufficient'

export type Activity = {
  id: string
  user_id: string
  source: SourceType
  external_id: string | null
  title: string
  date: string
  sport: SportType
  duration_minutes: number
  distance_km: number
  tss: number
  avg_hr: number | null
  max_hr: number | null
  elevation_gain: number
  zone_precision: ZonePrecision
  zones: Record<string, number> | null
  created_at: string
}

// ─── Connections ──────────────────────────────────────────────────────────────

export type ConnectionStatus = 'connected' | 'disconnected' | 'coming_soon'

export type SourceConnection = {
  id: string
  source: SourceType
  label: string
  status: ConnectionStatus
  last_sync: string | null
  color: string
}

// ─── AI Coach ─────────────────────────────────────────────────────────────────

export type AiActionKind = 'analyze_week' | 'adjust_plan' | 'detect_fatigue'

export type AiSettings = {
  tone: 'direct' | 'supportive'
  autonomy: 'proposal-only' | 'confirm-required'
  equipment: string
  extra_context: string
}

export type PendingAiAction = {
  id: string
  kind: AiActionKind
  headline: string
  summary: string
  reason: string
  impact: string
  needs_confirmation: boolean
  session_edits: Array<{
    session_id: string
    patch: Partial<TrainingSession>
  }>
}

// ─── Segments ─────────────────────────────────────────────────────────────────

export type StravaSegment = {
  id: string
  name: string
  distance_km: number
  elevation_gain: number
  average_grade: number | null
  effort: string | null
  starred: boolean
  sport: 'running' | 'riding'
  pr_time: string | null
  kom: string | null
  city: string | null
  state: string | null
  country: string | null
}

export type SegmentsResult = {
  segments: StravaSegment[]
  total: number
}

// ─── Navigation ───────────────────────────────────────────────────────────────

export type NavItem = {
  id: string
  path: string
  icon: string
  label_es: string
  label_en: string
}

// ─── Health (recovery / readiness) ────────────────────────────────────────────

export type HealthSourceType = 'oura' | 'garmin' | 'whoop' | 'apple_health' | 'google_fit'

export type HealthSource = {
  id: string
  profile_id: string
  source_type: HealthSourceType
  connected_at: string | null
  last_sync_at: string | null
}

export type HealthMetric = {
  id: string
  profile_id: string
  date: string // YYYY-MM-DD
  sleep_hours: number | null
  hrv_ms: number | null
  recovery_pct: number | null
  source: string | null
}

// ─── Dashboard widgets (personalizable layout) ────────────────────────────────

export type WidgetKey =
  | 'coach'
  | 'recovery'
  | 'connect_banner'
  | 'metrics'
  | 'level'
  | 'pmc_chart'
  | 'weekly_load'
  | 'sport_distribution'
  | 'today_session'
  | 'quick_read'
  | 'recent_activities'

export type DashboardWidget = {
  id: string
  profile_id: string
  widget_key: WidgetKey
  position: number
  visible: boolean
}

