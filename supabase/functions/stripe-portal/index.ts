// stripe-portal edge function
// Opens the Stripe Customer Portal for subscription management.
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

  const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
  const appUrl = Deno.env.get('APP_URL') || 'https://peak-endurance.vercel.app'

  if (!stripeSecretKey) {
    return json({ error: 'Stripe not configured' }, 500)
  }

  // Authenticate
  const authHeader = req.headers.get('authorization') ?? ''
  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return json({ error: 'Unauthorized' }, 401)
  }

  try {
    // Get stripe customer ID
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('profile_id', user.id)
      .maybeSingle()

    if (!sub?.stripe_customer_id) {
      return json({ error: 'No active subscription found' }, 404)
    }

    // Create portal session
    const portalRes = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        customer: sub.stripe_customer_id,
        return_url: `${appUrl}/app/ajustes`,
      }),
    })

    if (!portalRes.ok) {
      const err = await portalRes.text()
      console.error('[stripe-portal] Portal session failed:', err)
      return json({ error: 'Failed to create portal session' }, 500)
    }

    const portal = await portalRes.json()
    return json({ url: portal.url })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[stripe-portal] Error:', msg)
    return json({ error: msg }, 500)
  }
})
