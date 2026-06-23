import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export type SportFilter = 'all' | 'run' | 'bike' | 'swim' | 'gym' | 'other'

export type Activity = {
  id: string
  date: string // YYYY-MM-DD
  title: string
  sport: string
  duration_minutes: number | null
  distance_km: number | null
  tss: number | null
  avg_hr: number | null
  elevation_gain_m: number | null
  source_type: string | null
  stravaId: string | null
  mapPolyline: string | null
  maxHr: number | null
  avgSpeed: number | null
}

export function useActivities(opts: { days?: number; sport?: SportFilter } = {}) {
  const { days = 30, sport = 'all' } = opts
  const { status: authStatus, session } = useAuth()
  const [data, setData] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    if (!supabase || authStatus !== 'authenticated' || !session?.user?.id) {
      setData([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const since = new Date()
      since.setDate(since.getDate() - days)
      const sinceIso = since.toISOString().slice(0, 10)

      let query = supabase
        .from('imported_activities')
        .select(
          'id, activity_date, title, sport, duration_minutes, distance_km, tss, avg_hr, elevation_gain_m, source_type, raw_payload',
        )
        .eq('profile_id', session.user.id)
        .gte('activity_date', sinceIso)
        .order('activity_date', { ascending: false })
        .limit(50)

      if (sport !== 'all') {
        query = query.eq('sport', sport)
      }

      const { data: rows, error: qErr } = await query
      if (qErr) throw qErr

      const mapped: Activity[] = (rows ?? []).map((r) => {
        const raw = (r.raw_payload ?? {}) as Record<string, unknown>
        return {
          id: r.id as string,
          date: r.activity_date as string,
          title: (r.title as string) ?? 'Activity',
          sport: (r.sport as string) ?? 'other',
          duration_minutes: r.duration_minutes as number | null,
          distance_km: r.distance_km !== null && r.distance_km !== undefined
            ? Number(r.distance_km)
            : null,
          tss: r.tss as number | null,
          avg_hr: r.avg_hr as number | null,
          elevation_gain_m: r.elevation_gain_m as number | null,
          source_type: (r.source_type as string) ?? null,
          stravaId: raw.id ? String(raw.id) : null,
          mapPolyline: (raw.map as { summary_polyline?: string } | undefined)?.summary_polyline ?? null,
          maxHr: typeof raw.max_heartrate === 'number' ? raw.max_heartrate : null,
          avgSpeed: typeof raw.average_speed === 'number' ? raw.average_speed : null,
        }
      })

      setData(mapped)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load activities'
      setError(msg)
      setData([])
    } finally {
      setLoading(false)
    }
  }, [authStatus, session?.user?.id, days, sport])

  useEffect(() => {
    void refetch()
  }, [refetch])

  return { data, loading, error, refetch }
}
