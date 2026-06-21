// stripe-checkout edge function
// Creates a Stripe Checkout session for subscription upgrade.
// POST body: { priceId: 'monthly' | 'yearly' }
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
  const priceMonthly = Deno.env.get('STRIPE_PRICE_ID_PRO_MONTHLY')
  const priceYearly = Deno.env.get('STRIPE_PRICE_ID_PRO_YEARLY')
  const appUrl = Deno.env.get('APP_URL') || 'https://peak-endurance.vercel.app'

  if (!stripeSecretKey) {
    return json({ error: 'Stripe not configured on server' }, 500)
  }

  // Authenticate
  const authHeader = req.headers.get('authorization') ?? ''
  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return json({ error: 'Unauthorized' }, 401)
  }

  try {
    const { priceId } = await req.json() as { priceId: 'monthly' | 'yearly' }

    const stripePriceId = priceId === 'yearly' ? priceYearly : priceMonthly
    if (!stripePriceId) {
      return json({ error: 'Price not configured' }, 500)
    }

    // Check if user already has a Stripe customer
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('profile_id', user.id)
      .maybeSingle()

    let customerId = sub?.stripe_customer_id

    // Create Stripe customer if not exists
    if (!customerId) {
      const customerRes = await fetch('https://api.stripe.com/v1/customers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stripeSecretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          email: user.email ?? '',
          'metadata[supabase_uid]': user.id,
        }),
      })

      if (!customerRes.ok) {
        const err = await customerRes.text()
        console.error('[stripe-checkout] Customer creation failed:', err)
        return json({ error: 'Failed to create customer' }, 500)
      }

      const customer = await customerRes.json()
      customerId = customer.id

      // Upsert subscription row with customer ID
      await supabase.from('subscriptions').upsert({
        profile_id: user.id,
        stripe_customer_id: customerId,
        tier: 'free',
        status: 'active',
      }, { onConflict: 'profile_id' })
    }

    // Create checkout session
    const sessionParams = new URLSearchParams({
      'customer': customerId,
      'mode': 'subscription',
      'line_items[0][price]': stripePriceId,
      'line_items[0][quantity]': '1',
      'success_url': `${appUrl}/app/ajustes?upgrade=success`,
      'cancel_url': `${appUrl}/app/ajustes?upgrade=cancelled`,
      'subscription_data[trial_period_days]': '7',
      'metadata[supabase_uid]': user.id,
    })

    const sessionRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: sessionParams,
    })

    if (!sessionRes.ok) {
      const err = await sessionRes.text()
      console.error('[stripe-checkout] Session creation failed:', err)
      return json({ error: 'Failed to create checkout session' }, 500)
    }

    const session = await sessionRes.json()
    return json({ url: session.url })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[stripe-checkout] Error:', msg)
    return json({ error: msg }, 500)
  }
})
