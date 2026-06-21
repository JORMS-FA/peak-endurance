import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export type ApiKeyData = {
  provider: string
  keyHint: string | null
  status: string
  lastValidatedAt: string | null
}

export function useApiKey() {
  const { profile, status: authStatus } = useAuth()
  const [keyData, setKeyData] = useState<ApiKeyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [validating, setValidating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (authStatus !== 'authenticated' || !profile || !supabase) {
      setLoading(false)
      return
    }

    try {
      const { data } = await supabase
        .from('user_api_keys')
        .select('provider, key_hint, status, last_validated_at')
        .eq('profile_id', profile.id)
        .maybeSingle()

      if (data) {
        setKeyData({
          provider: data.provider,
          keyHint: data.key_hint,
          status: data.status,
          lastValidatedAt: data.last_validated_at,
        })
      } else {
        setKeyData(null)
      }
    } catch (err) {
      console.warn('[useApiKey] fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [authStatus, profile])

  useEffect(() => {
    void fetch()
  }, [fetch])

  const saveKey = useCallback(async (key: string, provider: string = 'google_ai'): Promise<boolean> => {
    if (!supabase || !profile) return false
    setSaving(true)
    setError(null)

    try {
      // Validate first
      setValidating(true)
      const { data: validation, error: valError } = await supabase.functions.invoke('ai-validate-key', {
        body: { key, provider },
      })
      setValidating(false)

      if (valError || !validation?.valid) {
        setError(validation?.error ?? valError?.message ?? 'Invalid API key')
        setSaving(false)
        return false
      }

      // Save to DB
      const { error: upsertError } = await supabase
        .from('user_api_keys')
        .upsert({
          profile_id: profile.id,
          provider,
          encrypted_key: key,
          key_hint: key.slice(-4),
          status: 'active',
          last_validated_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'profile_id,provider' })

      if (upsertError) {
        setError(upsertError.message)
        setSaving(false)
        return false
      }

      await fetch()
      setSaving(false)
      return true
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save key'
      setError(msg)
      setSaving(false)
      return false
    }
  }, [profile, fetch])

  const deleteKey = useCallback(async (): Promise<boolean> => {
    if (!supabase || !profile) return false
    setSaving(true)
    setError(null)

    try {
      const { error: delError } = await supabase
        .from('user_api_keys')
        .delete()
        .eq('profile_id', profile.id)

      if (delError) {
        setError(delError.message)
        setSaving(false)
        return false
      }

      setKeyData(null)
      setSaving(false)
      return true
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete key'
      setError(msg)
      setSaving(false)
      return false
    }
  }, [profile])

  const hasKey = keyData !== null && keyData.status === 'active'

  return {
    keyData,
    hasKey,
    loading,
    saving,
    validating,
    error,
    saveKey,
    deleteKey,
    refetch: fetch,
  }
}
