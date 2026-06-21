import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export type TodaySession = {
  id: string
  title: string
  sport: string
  duration_minutes: number | null
  intensity: string | null
  status: string
  notes: string | null
}

function isoToday(): string {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function useTodaySession() {
  const { status: authStatus, session } = useAuth()
  const [data, setData] = useState<TodaySession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    if (!supabase || authStatus !== 'authenticated' || !session?.user?.id) {
      setData(null)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const today = isoToday()
      const { data: row, error: qErr } = await supabase
        .from('training_sessions')
        .select('id, title, sport, duration_minutes, intensity, status, notes')
        .eq('profile_id', session.user.id)
        .eq('session_date', today)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (qErr) throw qErr
      setData((row as TodaySession | null) ?? null)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load today session'
      setError(msg)
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [authStatus, session?.user?.id])

  useEffect(() => {
    void refetch()
  }, [refetch])

  return { data, loading, error, refetch }
}
