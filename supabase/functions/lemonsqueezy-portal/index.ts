// lemonsqueezy-portal edge function
// Returns the Lemon Squeezy customer portal URL for managing subscriptions.
// POST (authenticated) — no body required.
// Returns: { url: string }

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseKey)

  const lsApiKey = Deno.env.get('LEMONSQUEEZY_API_KEY')

  if (!lsApiKey) {
    return json({ error: 'Lemon Squeezy not configured' }, 500)
  }

  // Authenticate
  const authHeader = req.headers.get('authorization') ?? ''
  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return json({ error: 'Unauthorized' }, 401)
  }

  try {
    // Get subscription with LS customer ID
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id, stripe_subscription_id')
      .eq('profile_id', user.id)
      .maybeSingle()

    if (!sub?.stripe_subscription_id) {
      return json({ error: 'No active subscription found' }, 404)
    }

    // Fetch the subscription from LS to get the customer portal URL
    const subRes = await fetch(
      `https://api.lemonsqueezy.com/v1/subscriptions/${sub.stripe_subscription_id}`,
      {
        headers: {
          'Authorization': `Bearer ${lsApiKey}`,
          'Accept': 'application/vnd.api+json',
        },
      },
    )

    if (!subRes.ok) {
      console.error('[lemonsqueezy-portal] Failed to fetch subscription')
      return json({ error: 'Failed to get portal URL' }, 500)
    }

    const subData = await subRes.json()
    const portalUrl = subData.data?.attributes?.urls?.customer_portal

    if (!portalUrl) {
      return json({ error: 'Customer portal URL not available' }, 404)
    }

    return json({ url: portalUrl })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[lemonsqueezy-portal] Error:', msg)
    return json({ error: msg }, 500)
  }
})
