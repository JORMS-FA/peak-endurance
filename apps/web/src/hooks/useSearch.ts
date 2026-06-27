import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import { sidebarNav } from '../lib/navigation'

export type SearchResultItem = {
  id: string
  type: 'activity' | 'page' | 'session' | 'connection'
  label: string
  description?: string
  path: string
}

export function useSearch(query: string) {
  const { profile, status: authStatus } = useAuth()
  const [results, setResults] = useState<SearchResultItem[]>([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  const searchPages = useCallback((): SearchResultItem[] => {
    return sidebarNav
      .filter((item) => {
        const label = `${item.label_es} ${item.label_en} ${item.id}`
        return label.toLowerCase().includes(query.toLowerCase())
      })
      .map((item) => ({
        id: `page-${item.id}`,
        type: 'page' as const,
        label: item.label_es,
        description: item.label_en,
        path: item.path,
      }))
  }, [query])

  const searchActivities = useCallback(async (): Promise<SearchResultItem[]> => {
    if (authStatus !== 'authenticated' || !profile || !supabase || query.length < 2) return []
    const { data } = await supabase
      .from('imported_activities')
      .select('id, title, sport, date')
      .eq('user_id', profile.id)
      .ilike('title', `%${query}%`)
      .order('date', { ascending: false })
      .limit(5)
    return (data ?? []).map((a) => ({
      id: `activity-${a.id}`,
      type: 'activity' as const,
      label: a.title ?? 'Actividad',
      description: `${a.sport} · ${a.date ? new Date(a.date).toLocaleDateString() : ''}`,
      path: `/app/entrenamientos/${a.id}`,
    }))
  }, [authStatus, profile, query])

  const searchSessions = useCallback(async (): Promise<SearchResultItem[]> => {
    if (authStatus !== 'authenticated' || !profile || !supabase || query.length < 2) return []
    const { data } = await supabase
      .from('training_sessions')
      .select('id, title, sport, date')
      .eq('user_id', profile.id)
      .ilike('title', `%${query}%`)
      .order('date', { ascending: false })
      .limit(5)
    return (data ?? []).map((s) => ({
      id: `session-${s.id}`,
      type: 'session' as const,
      label: s.title ?? 'Sesión',
      description: `${s.sport} · ${s.date ? new Date(s.date).toLocaleDateString() : ''}`,
      path: `/app/entrenamientos/${s.id}`,
    }))
  }, [authStatus, profile, query])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim()) {
      setResults([])
      setLoading(false)
      return
    }
    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      const pages = searchPages()
      const [activities, sessions] = await Promise.all([
        searchActivities(),
        searchSessions(),
      ])
      const combined: SearchResultItem[] = [
        ...pages,
        ...activities,
        ...sessions,
      ]
      setResults(combined)
      setLoading(false)
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, searchPages, searchActivities, searchSessions])

  return { results, loading }
}
