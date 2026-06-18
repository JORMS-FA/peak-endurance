export type AppLanguage = 'es' | 'en'
export type SourceType = 'strava' | 'garmin' | 'coros' | 'igpsport' | 'coospo'
export type ZonePrecision = 'real' | 'estimated' | 'insufficient'
export type SessionStatus = 'planned' | 'completed' | 'recovery' | 'race'
export type AiActionKind = 'analyze_week' | 'adjust_plan' | 'detect_fatigue'

export type AuthProfile = {
  id: string
  email: string
  displayName: string
  avatarUrl: string | null
}

export type AthleteUser = {
  name: string
  email: string
  role: string
}

export type SourceConnection = {
  source: SourceType
  label: string
  status: 'connected' | 'coming_soon'
  lastSync: string
  connected: boolean
  color: string
}

export type TrainingSession = {
  id: string
  date: string
  title: string
  sport: string
  durationMinutes: number
  tss: number
  status: SessionStatus
  intensity: 'low' | 'moderate' | 'high' | 'rest'
  notes: string
}

export type ImportedActivity = {
  id: string
  sourceType: SourceType
  title: string
  date: string
  sport: string
  durationMinutes: number
  distanceKm: number
  tss: number
  avgHr: number
  maxHr: number
  elevationGain: number
  zoneBreakdown: Record<'z1' | 'z2' | 'z3' | 'z4' | 'z5', number>
  zonePrecision: ZonePrecision
}

export type AiSettings = {
  tone: 'direct' | 'supportive'
  autonomy: 'proposal-only' | 'confirm-required'
  equipment: string
  extraContext: string
}

export type AiUsage = {
  used: number
  limit: number
  plan: 'free' | 'pro'
}

export type DateRange = {
  start: string
  end: string
}

export type PendingAiAction = {
  id: string
  kind: AiActionKind
  headline: string
  summary: string
  reason: string
  impact: string
  needsConfirmation: boolean
  sessionEdits: Array<{
    sessionId: string
    patch: Partial<TrainingSession>
  }>
}

export type StravaSegment = {
  id: string
  name: string
  distanceKm: number
  elevationGain: number
  effort: string
  starred: boolean
  sport: 'running' | 'riding'
}

export type HermesStatus = {
  connected: boolean
  stravaConnected: boolean
  weeklyReportEnabled: boolean
}
