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

// ─── Conversational chat with the AI coach ────────────────────────────────────

export type CreatedSession = {
  id: string
  session_date: string
  sport: string
  title: string
  intensity: string | null
  duration_minutes: number | null
  tss: number | null
  notes: string | null
}

export type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
  createdSession?: CreatedSession | null
}

export function useAiChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const send = useCallback(
    async (message: string, context: Record<string, unknown>) => {
      if (!supabase) {
        setError('Supabase not configured')
        return
      }
      const text = message.trim()
      if (!text) return

      // Optimistically append the user message and capture history.
      let history: { role: 'user' | 'assistant'; content: string }[] = []
      setMessages((prev) => {
        history = prev.map((m) => ({ role: m.role, content: m.content }))
        return [...prev, { role: 'user', content: text }]
      })

      setLoading(true)
      setError(null)
      try {
        const { data, error: fnError } = await supabase.functions.invoke('ai-coach', {
          body: { action: 'chat', message: text, history, context },
        })

        if (fnError) {
          setError(fnError.message ?? 'Function error')
          return
        }
        if (data?.error) {
          setError(data.message ?? data.error)
          return
        }

        const reply: string = data?.result?.reply ?? '…'
        const createdSession: CreatedSession | null = data?.result?.created_session ?? null
        setMessages((prev) => [...prev, { role: 'assistant', content: reply, createdSession }])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  const clear = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return { messages, send, loading, error, clear }
}
