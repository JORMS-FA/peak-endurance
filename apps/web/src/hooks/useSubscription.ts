import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export type SubscriptionTier = 'free' | 'pro' | 'premium'

export type SubscriptionData = {
  tier: SubscriptionTier
  status: string
  aiQuotaLimit: number
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
}

export type AiUsage = {
  usedQueries: number
  limit: number
  windowStart: string | null
}

export function useSubscription() {
  const { profile, status: authStatus } = useAuth()
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [usage, setUsage] = useState<AiUsage | null>(null)
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (authStatus !== 'authenticated' || !profile || !supabase) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      // Fetch subscription from subscriptions table
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('profile_id', profile.id)
        .maybeSingle()

      // Use profile's subscription_tier as fallback
      const profileTier = (profile as { subscription_tier?: string | null })?.subscription_tier ?? null

      const tier: SubscriptionTier = sub?.tier
        ? (sub.tier as SubscriptionTier)
        : profileTier && ['free', 'pro', 'premium'].includes(profileTier)
          ? (profileTier as SubscriptionTier)
          : 'free'

      if (sub) {
        setSubscription({
          tier,
          status: sub.status ?? 'active',
          aiQuotaLimit: sub.ai_quota_limit ?? (tier === 'premium' ? 10000 : tier === 'pro' ? 500 : 20),
          stripeCustomerId: sub.stripe_customer_id ?? null,
          stripeSubscriptionId: sub.stripe_subscription_id ?? null,
          currentPeriodEnd: sub.current_period_end ?? null,
          cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
        })
      } else if (profileTier && profileTier !== 'free') {
        setSubscription({
          tier,
          status: 'active',
          aiQuotaLimit: tier === 'premium' ? 10000 : 500,
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          currentPeriodEnd: (profile as { subscription_expires_at?: string | null })?.subscription_expires_at ?? null,
          cancelAtPeriodEnd: false,
        })
      } else {
        setSubscription({
          tier: 'free',
          status: 'active',
          aiQuotaLimit: 20,
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false,
        })
      }

      // Fetch AI usage
      const { data: usageRow } = await supabase
        .from('ai_usage_counters')
        .select('*')
        .eq('profile_id', profile.id)
        .maybeSingle()

      const limit = sub?.ai_quota_limit ?? (tier === 'premium' ? 10000 : tier === 'pro' ? 500 : 20)
      setUsage({
        usedQueries: usageRow?.used_queries ?? 0,
        limit,
        windowStart: usageRow?.window_start ?? null,
      })
    } catch (err) {
      console.warn('[useSubscription] Error:', err)
    } finally {
      setLoading(false)
    }
  }, [authStatus, profile])

  useEffect(() => {
    void fetch()
  }, [fetch])

  const isPro = subscription?.tier === 'pro' || subscription?.tier === 'premium'
  const isPremium = subscription?.tier === 'premium'
  const isSubscriber = subscription?.tier !== 'free' && subscription?.tier !== null
  const isActive = subscription?.status === 'active'

  return {
    subscription,
    usage,
    loading,
    isPro,
    isPremium,
    isSubscriber,
    isActive,
    refetch: fetch,
  }
}
