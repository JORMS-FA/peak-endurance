// ─── Core App Types ───────────────────────────────────────────────────────────

export type AppLanguage = 'es' | 'en'
export type ThemeMode = 'dark' | 'light' | 'midnight' | 'forest'

// ─── Auth ─────────────────────────────────────────────────────────────────────

export type AuthProfile = {
  id: string
  email: string | null
  display_name: string | null
  created_at: string | null
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
  effort: string
  starred: boolean
  sport: 'running' | 'riding'
}

// ─── Navigation ───────────────────────────────────────────────────────────────

export type NavItem = {
  id: string
  path: string
  icon: string
  label_es: string
  label_en: string
}
