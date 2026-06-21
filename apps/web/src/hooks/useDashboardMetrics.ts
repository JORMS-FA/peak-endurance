import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

// ─── Types ──────────────────────────────────────────────────────────────────
export type DailyTss = { date: string; tss: number }

export type RecentActivity = {
  id: string
  date: string // YYYY-MM-DD
  title: string
  sport: string
  duration_minutes: number | null
  distance_km: number | null
  tss: number | null
  avg_hr: number | null
}

export type DashboardMetrics = {
  ctl: number   // Chronic Training Load (42d EMA)
  atl: number   // Acute Training Load (7d EMA)
  tsb: number   // Training Stress Balance (Form) = CTL - ATL
  formPct: number // -100..+100 normalisation for the "Forma %" card
  weeklyTss: number   // sum of last 7 days
  weeklyHours: number // sum of last 7 days (hours)
  weeklyDistance: number // sum of last 7 days (km)
  daily: DailyTss[] // last 90 days, oldest → newest
  weeklySeries: { day: string; tss: number; iso: string }[] // L..D current week
  recent: RecentActivity[] // last 5 activities
}

const DEFAULT_METRICS: DashboardMetrics = {
  ctl: 0,
  atl: 0,
  tsb: 0,
  formPct: 0,
  weeklyTss: 0,
  weeklyHours: 0,
  weeklyDistance: 0,
  daily: [],
  weeklySeries: [],
  recent: [],
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function isoDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function daysAgo(n: number): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - n)
  return d
}

/**
 * Build a continuous daily series of TSS for the last `daysWindow` days,
 * filling missing days with 0.
 */
function buildDaily(activities: { activity_date: string; tss: number | null }[], daysWindow: number): DailyTss[] {
  const totals = new Map<string, number>()
  for (const a of activities) {
    const d = a.activity_date
    if (!d) continue
    const tss = a.tss ?? 0
    totals.set(d, (totals.get(d) ?? 0) + tss)
  }

  const out: DailyTss[] = []
  for (let i = daysWindow - 1; i >= 0; i--) {
    const d = isoDate(daysAgo(i))
    out.push({ date: d, tss: totals.get(d) ?? 0 })
  }
  return out
}

/**
 * Standard PMC EMA. CTL_today = CTL_yesterday + (TSS_today - CTL_yesterday) / TC.
 * TC = 42 for CTL, 7 for ATL. Seed with 0 (cold-start convention).
 */
function pmcFromDaily(daily: DailyTss[]): { ctl: number; atl: number; tsb: number } {
  let ctl = 0
  let atl = 0
  for (const d of daily) {
    ctl = ctl + (d.tss - ctl) / 42
    atl = atl + (d.tss - atl) / 7
  }
  const tsb = ctl - atl
  return { ctl, atl, tsb }
}

/**
 * Map TSB to a -100..+100 form percentage: very negative = fatigued, very
 * positive = fresh. Clamped to ±20 TSB then scaled.
 */
function formPctFromTsb(tsb: number): number {
  const clamped = Math.max(-20, Math.min(20, tsb))
  return Math.round((clamped / 20) * 100)
}

/** Mon..Sun labels for the current calendar week. */
function buildWeeklySeries(daily: DailyTss[]): { day: string; tss: number; iso: string }[] {
  const labelsEs = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  // Monday-based: getDay() returns 0 for Sun, 1 for Mon, ..., 6 for Sat
  const dow = today.getDay() // 0..6 (Sun..Sat)
  const offsetToMonday = (dow + 6) % 7 // distance from Mon
  const monday = new Date(today)
  monday.setDate(today.getDate() - offsetToMonday)

  const dailyMap = new Map(daily.map((d) => [d.date, d.tss]))
  const series: { day: string; tss: number; iso: string }[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const iso = isoDate(d)
    series.push({ day: labelsEs[i], iso, tss: dailyMap.get(iso) ?? 0 })
  }
  return series
}

// ─── Hook ───────────────────────────────────────────────────────────────────
export function useDashboardMetrics() {
  const { status: authStatus, session } = useAuth()
  const [metrics, setMetrics] = useState<DashboardMetrics>(DEFAULT_METRICS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasData, setHasData] = useState(false)

  const refetch = useCallback(async () => {
    if (!supabase || authStatus !== 'authenticated' || !session?.user?.id) {
      setMetrics(DEFAULT_METRICS)
      setLoading(false)
      setHasData(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const since = isoDate(daysAgo(90))
      const { data, error: queryError } = await supabase
        .from('imported_activities')
        .select('id, activity_date, title, sport, duration_minutes, distance_km, tss, avg_hr')
        .eq('profile_id', session.user.id)
        .gte('activity_date', since)
        .order('activity_date', { ascending: false })

      if (queryError) throw queryError

      const activities = data ?? []
      setHasData(activities.length > 0)

      const daily = buildDaily(
        activities.map((a) => ({ activity_date: a.activity_date as string, tss: a.tss })),
        90,
      )
      const { ctl, atl, tsb } = pmcFromDaily(daily)
      const formPct = formPctFromTsb(tsb)

      const last7 = daily.slice(-7)
      const weeklyTss = last7.reduce((s, d) => s + d.tss, 0)

      const since7 = isoDate(daysAgo(6))
      const weeklyActs = activities.filter((a) => (a.activity_date as string) >= since7)
      const weeklyHours = weeklyActs.reduce((s, a) => s + ((a.duration_minutes ?? 0) / 60), 0)
      const weeklyDistance = weeklyActs.reduce((s, a) => s + Number(a.distance_km ?? 0), 0)

      const weeklySeries = buildWeeklySeries(daily)

      const recent: RecentActivity[] = activities.slice(0, 5).map((a) => ({
        id: a.id as string,
        date: a.activity_date as string,
        title: (a.title as string) ?? 'Activity',
        sport: (a.sport as string) ?? 'other',
        duration_minutes: a.duration_minutes as number | null,
        distance_km: a.distance_km !== null && a.distance_km !== undefined
          ? Number(a.distance_km)
          : null,
        tss: a.tss as number | null,
        avg_hr: a.avg_hr as number | null,
      }))

      setMetrics({
        ctl: Math.round(ctl),
        atl: Math.round(atl),
        tsb: Math.round(tsb),
        formPct,
        weeklyTss: Math.round(weeklyTss),
        weeklyHours: Math.round(weeklyHours * 10) / 10,
        weeklyDistance: Math.round(weeklyDistance * 10) / 10,
        daily,
        weeklySeries,
        recent,
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load metrics'
      setError(msg)
      setMetrics(DEFAULT_METRICS)
      setHasData(false)
    } finally {
      setLoading(false)
    }
  }, [authStatus, session?.user?.id])

  useEffect(() => {
    void refetch()
  }, [refetch])

  return { metrics, loading, error, hasData, refetch }
}
