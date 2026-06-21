import { useCallback, useEffect, useState } from 'react'
import {
  disconnectStrava,
  getStravaStatus,
  startStravaAuth,
  syncStravaActivities,
  type StravaStatus,
  type StravaSyncResult,
} from '../lib/strava'
import { useAuth } from './useAuth'

type StravaState = {
  status: StravaStatus | null
  loading: boolean
  error: string | null
}

export function useStravaConnection() {
  const { status: authStatus } = useAuth()
  const [state, setState] = useState<StravaState>({ status: null, loading: true, error: null })

  const refetch = useCallback(async () => {
    if (authStatus !== 'authenticated') {
      setState({ status: null, loading: false, error: null })
      return
    }
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const data = await getStravaStatus()
      setState({ status: data, loading: false, error: null })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setState({ status: null, loading: false, error: msg })
    }
  }, [authStatus])

  useEffect(() => {
    void refetch()
  }, [refetch])

  return { ...state, refetch }
}

export function useStravaConnect() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const connect = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { url } = await startStravaAuth()
      // Hand off to Strava's OAuth page.
      window.location.assign(url)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to start Strava OAuth'
      setError(msg)
      setLoading(false)
    }
  }, [])

  return { connect, loading, error }
}

export function useStravaDisconnect(onDone?: () => void) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const disconnect = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      await disconnectStrava()
      onDone?.()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to disconnect'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [onDone])

  return { disconnect, loading, error }
}

export function useStravaSync() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<StravaSyncResult | null>(null)

  const sync = useCallback(async (days = 60) => {
    setLoading(true)
    setError(null)
    try {
      const res = await syncStravaActivities(days)
      setResult(res)
      return res
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sync failed'
      setError(msg)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { sync, loading, error, result }
}
