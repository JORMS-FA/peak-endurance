import { useCallback, useState } from 'react'
import { supabase } from '../lib/supabase'

export type AiAction = 'analyze_week' | 'adjust_plan' | 'detect_fatigue'

export type AiCoachResult = {
  action: AiAction
  result: Record<string, unknown>
}

export type AiCoachError = {
  error: string
  message?: string
  used?: number
  limit?: number
}

export function useAiCoach() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AiCoachResult | null>(null)
  const [error, setError] = useState<AiCoachError | null>(null)

  const execute = useCallback(async (action: AiAction, context: Record<string, unknown>) => {
    if (!supabase) {
      setError({ error: 'Supabase not configured' })
      return null
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const { data, error: fnError } = await supabase.functions.invoke('ai-coach', {
        body: { action, context },
      })

      if (fnError) {
        setError({ error: fnError.message ?? 'Function error' })
        return null
      }

      if (data?.error) {
        setError(data as AiCoachError)
        return null
      }

      const response = data as AiCoachResult
      setResult(response)
      return response
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setError({ error: msg })
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setResult(null)
    setError(null)
  }, [])

  return { execute, loading, result, error, reset }
}
