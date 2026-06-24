import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { HealthSource, HealthSourceType } from '../lib/types'

type HealthSourcesState = {
  sources: HealthSource[]
  hasSources: boolean
  loading: boolean
  error: string | null
}

export function useHealthSources() {
  const { status: authStatus, session } = useAuth()
  const [state, setState] = useState<HealthSourcesState>({
    sources: [],
    hasSources: false,
    loading: true,
    error: null,
  })

  const refetch = useCallback(async () => {
    if (!supabase || authStatus !== 'authenticated' || !session?.user?.id) {
      setState({ sources: [], hasSources: false, loading: false, error: null })
      return
    }
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const { data, error: qErr } = await supabase
        .from('health_sources')
        .select('id, profile_id, source_type, connected_at, last_sync_at')
        .eq('profile_id', session.user.id)
        .order('connected_at', { ascending: false })

      if (qErr) throw qErr

      const sources: HealthSource[] = (data ?? []).map((r) => ({
        id: r.id as string,
        profile_id: r.profile_id as string,
        source_type: r.source_type as HealthSourceType,
        connected_at: r.connected_at as string | null,
        last_sync_at: r.last_sync_at as string | null,
      }))

      setState({ sources, hasSources: sources.length > 0, loading: false, error: null })
    } catch (err) {
      const msg = err instanceof Error
        ? err.message
        : err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Failed to load health sources'
      setState({ sources: [], hasSources: false, loading: false, error: msg })
    }
  }, [authStatus, session?.user?.id])

  useEffect(() => {
    void refetch()
  }, [refetch])

  return { ...state, refetch }
}
