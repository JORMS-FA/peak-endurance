import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { HealthMetric } from '../lib/types'

type HealthMetricsState = {
  /** Metric row for the current calendar day, if any. */
  today: HealthMetric | null
  /** Most recent metric row available (may differ from today). */
  latest: HealthMetric | null
  hasToday: boolean
  loading: boolean
  error: string | null
}

function isoToday(): string {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function useHealthMetrics() {
  const { status: authStatus, session } = useAuth()
  const [state, setState] = useState<HealthMetricsState>({
    today: null,
    latest: null,
    hasToday: false,
    loading: true,
    error: null,
  })

  const refetch = useCallback(async () => {
    if (!supabase || authStatus !== 'authenticated' || !session?.user?.id) {
      setState({ today: null, latest: null, hasToday: false, loading: false, error: null })
      return
    }
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const todayIso = isoToday()
      // Pull the last 7 days of metrics; today + latest both derive from this.
      const since = new Date()
      since.setHours(0, 0, 0, 0)
      since.setDate(since.getDate() - 6)
      const sinceIso = `${since.getFullYear()}-${String(since.getMonth() + 1).padStart(2, '0')}-${String(since.getDate()).padStart(2, '0')}`

      const { data, error: qErr } = await supabase
        .from('health_metrics')
        .select('id, profile_id, date, sleep_hours, hrv_ms, recovery_pct, source')
        .eq('profile_id', session.user.id)
        .gte('date', sinceIso)
        .order('date', { ascending: false })
        .limit(7)

      if (qErr) throw qErr

      const rows: HealthMetric[] = (data ?? []).map((r) => ({
        id: r.id as string,
        profile_id: r.profile_id as string,
        date: r.date as string,
        sleep_hours: r.sleep_hours !== null && r.sleep_hours !== undefined ? Number(r.sleep_hours) : null,
        hrv_ms: r.hrv_ms !== null && r.hrv_ms !== undefined ? Number(r.hrv_ms) : null,
        recovery_pct: r.recovery_pct !== null && r.recovery_pct !== undefined ? Number(r.recovery_pct) : null,
        source: (r.source as string | null) ?? null,
      }))

      const latest = rows[0] ?? null
      const today = rows.find((r) => r.date === todayIso) ?? null

      setState({ today, latest, hasToday: today !== null, loading: false, error: null })
    } catch (err) {
      const msg = err instanceof Error
        ? err.message
        : err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Failed to load health metrics'
      setState({ today: null, latest: null, hasToday: false, loading: false, error: msg })
    }
  }, [authStatus, session?.user?.id])

  useEffect(() => {
    void refetch()
  }, [refetch])

  return { ...state, refetch }
}
