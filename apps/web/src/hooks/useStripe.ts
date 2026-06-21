// usePayment hook — Uses Lemon Squeezy for subscription management
import { useCallback, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useStripe() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkout = useCallback(async (_priceId?: 'monthly' | 'yearly') => {
    if (!supabase) return
    setLoading(true)
    setError(null)

    try {
      const { data, error: fnError } = await supabase.functions.invoke('lemonsqueezy-checkout', {
        body: {},
      })

      if (fnError) {
        setError(fnError.message)
        setLoading(false)
        return
      }

      if (data?.url) {
        window.location.href = data.url
      } else {
        setError(data?.error ?? 'Failed to create checkout session')
        setLoading(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setLoading(false)
    }
  }, [])

  // Lemon Squeezy manages subscriptions via their customer portal
  // We redirect to the LS customer portal URL stored in subscription data
  const openPortal = useCallback(async () => {
    if (!supabase) return
    setLoading(true)
    setError(null)

    try {
      // Get the customer portal URL from Lemon Squeezy
      const { data, error: fnError } = await supabase.functions.invoke('lemonsqueezy-portal', {
        body: {},
      })

      if (fnError) {
        setError(fnError.message)
        setLoading(false)
        return
      }

      if (data?.url) {
        window.open(data.url, '_blank')
      } else {
        setError(data?.error ?? 'Failed to open customer portal')
        setLoading(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setLoading(false)
    }
  }, [])

  return { checkout, openPortal, loading, error }
}
