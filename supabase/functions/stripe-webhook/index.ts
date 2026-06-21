// stripe-webhook edge function
// Receives Stripe webhook events and keeps the subscriptions table in sync.
// NO auth required — validates Stripe signature instead.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

// Simple Stripe signature verification using Web Crypto API
async function verifyStripeSignature(
  payload: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  const parts = signature.split(',')
  const timestamp = parts.find((p) => p.startsWith('t='))?.slice(2)
  const v1Signature = parts.find((p) => p.startsWith('v1='))?.slice(3)

  if (!timestamp || !v1Signature) return false

  // Check timestamp tolerance (5 minutes)
  const now = Math.floor(Date.now() / 1000)
  if (Math.abs(now - parseInt(timestamp)) > 300) return false

  const signedPayload = `${timestamp}.${payload}`
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )

  const expectedSig = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(signedPayload),
  )

  const expectedHex = Array.from(new Uint8Array(expectedSig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  return expectedHex === v1Signature
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
  const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')

  if (!webhookSecret || !stripeSecretKey) {
    return json({ error: 'Webhook not configured' }, 500)
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseKey)

  const body = await req.text()
  const signature = req.headers.get('stripe-signature') ?? ''

  // Verify signature
  const valid = await verifyStripeSignature(body, signature, webhookSecret)
  if (!valid) {
    console.error('[stripe-webhook] Invalid signature')
    return json({ error: 'Invalid signature' }, 400)
  }

  const event = JSON.parse(body)
  console.log(`[stripe-webhook] Event: ${event.type}`)

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const customerId = session.customer
        const subscriptionId = session.subscription
        const uid = session.metadata?.supabase_uid

        if (!uid) {
          console.error('[stripe-webhook] No supabase_uid in session metadata')
          break
        }

        // Fetch the subscription details from Stripe
        const subRes = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
          headers: { 'Authorization': `Bearer ${stripeSecretKey}` },
        })
        const stripeSub = await subRes.json()

        await supabase.from('subscriptions').upsert({
          profile_id: uid,
          tier: 'pro',
          status: 'active',
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          stripe_price_id: stripeSub.items?.data?.[0]?.price?.id ?? null,
          current_period_start: new Date(stripeSub.current_period_start * 1000).toISOString(),
          current_period_end: new Date(stripeSub.current_period_end * 1000).toISOString(),
          cancel_at_period_end: false,
          ai_quota_limit: 500,
        }, { onConflict: 'profile_id' })

        // Initialize or reset AI usage counter
        await supabase.from('ai_usage_counters').upsert({
          profile_id: uid,
          used_queries: 0,
          window_start: new Date().toISOString().slice(0, 10),
          quota_limit: 500,
        }, { onConflict: 'profile_id' })

        console.log(`[stripe-webhook] User ${uid} upgraded to Pro`)
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object
        const customerId = sub.customer

        // Find user by stripe_customer_id
        const { data: subRow } = await supabase
          .from('subscriptions')
          .select('profile_id')
          .eq('stripe_customer_id', customerId)
          .maybeSingle()

        if (!subRow) break

        const status = sub.status === 'active' ? 'active'
          : sub.status === 'past_due' ? 'past_due'
          : sub.status === 'canceled' ? 'cancelled'
          : sub.status

        await supabase.from('subscriptions').update({
          status,
          stripe_price_id: sub.items?.data?.[0]?.price?.id ?? null,
          current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          cancel_at_period_end: sub.cancel_at_period_end ?? false,
          canceled_at: sub.canceled_at ? new Date(sub.canceled_at * 1000).toISOString() : null,
        }).eq('profile_id', subRow.profile_id)

        console.log(`[stripe-webhook] Subscription updated for ${subRow.profile_id}: ${status}`)
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object
        const customerId = sub.customer

        const { data: subRow } = await supabase
          .from('subscriptions')
          .select('profile_id')
          .eq('stripe_customer_id', customerId)
          .maybeSingle()

        if (!subRow) break

        await supabase.from('subscriptions').update({
          tier: 'free',
          status: 'cancelled',
          cancel_at_period_end: false,
          canceled_at: new Date().toISOString(),
          ai_quota_limit: 20,
        }).eq('profile_id', subRow.profile_id)

        // Reset quota to free tier
        await supabase.from('ai_usage_counters').update({
          quota_limit: 20,
        }).eq('profile_id', subRow.profile_id)

        console.log(`[stripe-webhook] User ${subRow.profile_id} downgraded to Free`)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object
        const customerId = invoice.customer

        const { data: subRow } = await supabase
          .from('subscriptions')
          .select('profile_id')
          .eq('stripe_customer_id', customerId)
          .maybeSingle()

        if (!subRow) break

        await supabase.from('subscriptions').update({
          status: 'past_due',
        }).eq('profile_id', subRow.profile_id)

        console.log(`[stripe-webhook] Payment failed for ${subRow.profile_id}`)
        break
      }

      default:
        console.log(`[stripe-webhook] Unhandled event: ${event.type}`)
    }

    return json({ received: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[stripe-webhook] Error processing event:', msg)
    return json({ error: msg }, 500)
  }
})
