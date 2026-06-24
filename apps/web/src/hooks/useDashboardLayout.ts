import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { WidgetKey } from '../lib/types'

export type WidgetLayout = {
  widget_key: WidgetKey
  position: number
  visible: boolean
}

// Default order when the user has never customized their dashboard.
// Mirrors the current visual order so the default experience is unchanged.
// `recovery` is included by default; the render layer hides its inner content
// when no health source is connected.
const DEFAULT_LAYOUT: { widget_key: WidgetKey; visible: boolean }[] = [
  { widget_key: 'coach', visible: true },
  { widget_key: 'recovery', visible: true },
  { widget_key: 'connect_banner', visible: true },
  { widget_key: 'metrics', visible: true },
  { widget_key: 'level', visible: true },
  { widget_key: 'pmc_chart', visible: true },
  { widget_key: 'weekly_load', visible: true },
  { widget_key: 'sport_distribution', visible: true },
  { widget_key: 'today_session', visible: true },
  { widget_key: 'quick_read', visible: true },
  { widget_key: 'recent_activities', visible: true },
]

function seedDefault(): WidgetLayout[] {
  return DEFAULT_LAYOUT.map((w, i) => ({ ...w, position: i }))
}

type DashboardLayoutState = {
  widgets: WidgetLayout[]
  loading: boolean
  error: string | null
  customizeMode: boolean
}

export function useDashboardLayout() {
  const { status: authStatus, session } = useAuth()
  const [state, setState] = useState<DashboardLayoutState>({
    widgets: seedDefault(),
    loading: true,
    error: null,
    customizeMode: false,
  })

  const refetch = useCallback(async () => {
    if (!supabase || authStatus !== 'authenticated' || !session?.user?.id) {
      setState({ widgets: seedDefault(), loading: false, error: null, customizeMode: false })
      return
    }
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const { data, error: qErr } = await supabase
        .from('dashboard_widgets')
        .select('widget_key, position, visible')
        .eq('profile_id', session.user.id)
        .order('position', { ascending: true })

      if (qErr) throw qErr

      if (!data || data.length === 0) {
        setState({ widgets: seedDefault(), loading: false, error: null, customizeMode: false })
        return
      }

      // Merge stored rows with defaults so newly-introduced widgets still appear.
      const storedKeys = new Set(data.map((r) => r.widget_key as WidgetKey))
      const widgets: WidgetLayout[] = data.map((r) => ({
        widget_key: r.widget_key as WidgetKey,
        position: r.position as number,
        visible: r.visible as boolean,
      }))
      let nextPos = widgets.length
      for (const def of DEFAULT_LAYOUT) {
        if (!storedKeys.has(def.widget_key)) {
          widgets.push({ ...def, position: nextPos++ })
        }
      }
      widgets.sort((a, b) => a.position - b.position)
      setState({ widgets, loading: false, error: null, customizeMode: false })
    } catch (err) {
      const msg = err instanceof Error
        ? err.message
        : err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Failed to load dashboard layout'
      setState({ widgets: seedDefault(), loading: false, error: msg, customizeMode: false })
    }
  }, [authStatus, session?.user?.id])

  useEffect(() => {
    void refetch()
  }, [refetch])

  /** Upsert the full layout for the profile. */
  const persist = useCallback(
    async (next: WidgetLayout[]) => {
      if (!supabase || authStatus !== 'authenticated' || !session?.user?.id) return false
      try {
        const rows = next.map((w, i) => ({
          profile_id: session.user.id,
          widget_key: w.widget_key,
          position: i,
          visible: w.visible,
        }))
        const { error: upErr } = await supabase
          .from('dashboard_widgets')
          .upsert(rows, { onConflict: 'profile_id,widget_key' })
        if (upErr) throw upErr
        return true
      } catch (err) {
        const msg = err instanceof Error
          ? err.message
          : err && typeof err === 'object' && 'message' in err
            ? String((err as { message: unknown }).message)
            : 'Failed to save dashboard layout'
        setState((prev) => ({ ...prev, error: msg }))
        return false
      }
    },
    [authStatus, session?.user?.id],
  )

  const setCustomizeMode = useCallback((on: boolean) => {
    setState((prev) => ({ ...prev, customizeMode: on }))
  }, [])

  /** Swap a widget with the one above it. */
  const moveUp = useCallback(
    (key: WidgetKey) => {
      setState((prev) => {
        const idx = prev.widgets.findIndex((w) => w.widget_key === key)
        if (idx <= 0) return prev
        const next = [...prev.widgets]
        ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
        const reindexed = next.map((w, i) => ({ ...w, position: i }))
        void persist(reindexed)
        return { ...prev, widgets: reindexed }
      })
    },
    [persist],
  )

  /** Swap a widget with the one below it. */
  const moveDown = useCallback(
    (key: WidgetKey) => {
      setState((prev) => {
        const idx = prev.widgets.findIndex((w) => w.widget_key === key)
        if (idx < 0 || idx >= prev.widgets.length - 1) return prev
        const next = [...prev.widgets]
        ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
        const reindexed = next.map((w, i) => ({ ...w, position: i }))
        void persist(reindexed)
        return { ...prev, widgets: reindexed }
      })
    },
    [persist],
  )

  /** Toggle a widget's visibility. */
  const toggleVisible = useCallback(
    (key: WidgetKey) => {
      setState((prev) => {
        const next = prev.widgets.map((w) =>
          w.widget_key === key ? { ...w, visible: !w.visible } : w,
        )
        const reindexed = next.map((w, i) => ({ ...w, position: i }))
        void persist(reindexed)
        return { ...prev, widgets: reindexed }
      })
    },
    [persist],
  )

  return {
    widgets: state.widgets,
    loading: state.loading,
    error: state.error,
    customizeMode: state.customizeMode,
    setCustomizeMode,
    moveUp,
    moveDown,
    toggleVisible,
    refetch,
  }
}
