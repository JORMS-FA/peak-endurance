import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import { sidebarNav } from '../lib/navigation'

export type SearchResultItem = {
  id: string
  type: 'activity' | 'page' | 'session' | 'connection' | 'user'
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

  const searchUsers = useCallback(async (): Promise<SearchResultItem[]> => {
    // Strip a leading "@" so users can type "@jorman" to look up a handle.
    const raw = query.trim()
    if (raw.length < 2) return []
    const needle = raw.startsWith('@') ? raw.slice(1) : raw
    if (needle.length < 2) return []
    if (!supabase) return []

    // Prefer the dedicated RPC if the migration has been applied.
    try {
      const { data, error } = await supabase.rpc('search_profiles_by_username', {
        query: needle,
        max_results: 8,
      })
      if (!error && Array.isArray(data)) {
        return (data as Array<{
          id: string
          username: string | null
          display_name: string | null
          avatar_url: string | null
          followers_count: number
        }>).map((u) => ({
          id: `user-${u.id}`,
          type: 'user' as const,
          label: u.display_name ?? u.username ?? 'Atleta',
          description: u.username ? `@${u.username}` : undefined,
          path: `/app/perfil/${u.username ?? u.id}`,
        }))
      }
    } catch {
      // RPC missing or transient error — fall back to a direct table read.
    }

    const { data: rows } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url')
      .or(`username.ilike.${needle}%,display_name.ilike.%${needle}%`)
      .limit(8)
    return (rows ?? []).map((u) => ({
      id: `user-${u.id}`,
      type: 'user' as const,
      label: u.display_name ?? u.username ?? 'Atleta',
      description: u.username ? `@${u.username}` : undefined,
      path: `/app/perfil/${u.username ?? u.id}`,
    }))
  }, [query])

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
      const [activities, sessions, users] = await Promise.all([
        searchActivities(),
        searchSessions(),
        searchUsers(),
      ])
      const combined: SearchResultItem[] = [
        ...pages,
        ...users,
        ...activities,
        ...sessions,
      ]
      setResults(combined)
      setLoading(false)
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, searchPages, searchActivities, searchSessions, searchUsers])

  return { results, loading }
}
