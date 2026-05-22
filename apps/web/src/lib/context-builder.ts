import type {
  AiSettings,
  AiUsage,
  DateRange,
  ImportedActivity,
  SourceConnection,
  TrainingSession,
} from './types'

export function buildCoachContext(input: {
  selectedDate: string
  range: DateRange
  sessions: TrainingSession[]
  activities: ImportedActivity[]
  connections: SourceConnection[]
  aiSettings: AiSettings
  aiUsage: AiUsage
  language: 'es' | 'en'
}) {
  const sessionsInRange = input.sessions.filter(
    (session) => session.date >= input.range.start && session.date <= input.range.end,
  )
  const activitiesInRange = input.activities.filter(
    (activity) => activity.date >= input.range.start && activity.date <= input.range.end,
  )
  const selectedSession = input.sessions.find((session) => session.date === input.selectedDate) ?? null
  const selectedActivity = input.activities.find((activity) => activity.date === input.selectedDate) ?? null
  const totalTss = activitiesInRange.reduce((sum, item) => sum + item.tss, 0)
  const totalHours = activitiesInRange.reduce((sum, item) => sum + item.durationMinutes, 0) / 60

  return {
    selectedDate: input.selectedDate,
    selectedSession,
    selectedActivity,
    range: input.range,
    sessionsInRange,
    activitiesInRange,
    connectedSources: input.connections.filter((item) => item.connected).map((item) => item.label),
    aiSettings: input.aiSettings,
    aiUsage: input.aiUsage,
    language: input.language,
    summary: {
      totalTss,
      totalHours: Number(totalHours.toFixed(1)),
      plannedSessions: sessionsInRange.length,
      completedActivities: activitiesInRange.length,
    },
  }
}
