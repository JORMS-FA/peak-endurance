// lemonsqueezy-webhook edge function
// Receives Lemon Squeezy webhook events and updates the subscriptions table.
// POST — no auth, validates HMAC signature.
// Events: subscription_created, subscription_updated, subscription_cancelled,
//         subscription_payment_success, subscription_payment_failed

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

async function verifySignature(payload: string, signature: string, secret: string): Promise<boolean> {
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
    new TextEncoder().encode(payload),
  )

  const expectedHex = Array.from(new Uint8Array(expectedSig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  return expectedHex === signature
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  const webhookSecret = Deno.env.get('LEMONSQUEEZY_WEBHOOK_SECRET')
  if (!webhookSecret) {
    return json({ error: 'Webhook secret not configured' }, 500)
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseKey)

  const body = await req.text()
  const signature = req.headers.get('x-signature') ?? ''

  // Verify HMAC signature
  const valid = await verifySignature(body, signature, webhookSecret)
  if (!valid) {
    console.error('[lemonsqueezy-webhook] Invalid signature')
    return json({ error: 'Invalid signature' }, 401)
  }

  const event = JSON.parse(body)
  const eventName = event.meta?.event_name
  const customData = event.meta?.custom_data ?? {}
  const supabaseUid = customData.supabase_uid

  console.log(`[lemonsqueezy-webhook] Event: ${eventName}, UID: ${supabaseUid}`)

  if (!supabaseUid) {
    console.warn('[lemonsqueezy-webhook] No supabase_uid in custom_data')
    // Try to find user by email
    const customerEmail = event.data?.attributes?.user_email
    if (customerEmail) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', customerEmail)
        .maybeSingle()
      if (profile) {
        customData.supabase_uid = profile.id
      }
    }
  }

  const profileId = customData.supabase_uid ?? supabaseUid
  if (!profileId) {
    console.error('[lemonsqueezy-webhook] Could not identify user')
    return json({ received: true, warning: 'no user identified' })
  }

  try {
    const attrs = event.data?.attributes ?? {}

    switch (eventName) {
      case 'subscription_created':
      case 'subscription_updated': {
        const status = attrs.status // active, on_trial, paused, past_due, cancelled, expired
        const tier = (status === 'active' || status === 'on_trial') ? 'pro' : 'free'

        await supabase.from('subscriptions').upsert({
          profile_id: profileId,
          tier,
          status: status === 'on_trial' ? 'trialing' : status === 'active' ? 'active' : status,
          stripe_customer_id: String(attrs.customer_id ?? ''), // reusing column for LS customer ID
          stripe_subscription_id: String(attrs.id ?? event.data?.id ?? ''), // reusing for LS sub ID
          stripe_price_id: String(attrs.variant_id ?? ''),
          current_period_start: attrs.renews_at ? new Date(attrs.created_at).toISOString() : null,
          current_period_end: attrs.renews_at ? new Date(attrs.renews_at).toISOString() : null,
          cancel_at_period_end: attrs.cancelled ?? false,
          canceled_at: attrs.ends_at ? new Date(attrs.ends_at).toISOString() : null,
          ai_quota_limit: tier === 'pro' ? 500 : 20,
        }, { onConflict: 'profile_id' })

        // Initialize/update AI usage counter
        if (tier === 'pro') {
          await supabase.from('ai_usage_counters').upsert({
            profile_id: profileId,
            used_queries: 0,
            window_start: new Date().toISOString().slice(0, 10),
            quota_limit: 500,
          }, { onConflict: 'profile_id' })
        }

        console.log(`[lemonsqueezy-webhook] User ${profileId} → tier: ${tier}, status: ${status}`)
        break
      }

      case 'subscription_cancelled': {
        await supabase.from('subscriptions').update({
          cancel_at_period_end: true,
          canceled_at: new Date().toISOString(),
        }).eq('profile_id', profileId)

        console.log(`[lemonsqueezy-webhook] User ${profileId} cancelled (will expire at period end)`)
        break
      }

      case 'subscription_expired': {
        await supabase.from('subscriptions').update({
          tier: 'free',
          status: 'expired',
          cancel_at_period_end: false,
          ai_quota_limit: 20,
        }).eq('profile_id', profileId)

        await supabase.from('ai_usage_counters').update({
          quota_limit: 20,
        }).eq('profile_id', profileId)

        console.log(`[lemonsqueezy-webhook] User ${profileId} expired → Free`)
        break
      }

      case 'subscription_payment_success': {
        // Payment successful, ensure subscription is active
        await supabase.from('subscriptions').update({
          status: 'active',
          tier: 'pro',
          current_period_end: attrs.renews_at ? new Date(attrs.renews_at).toISOString() : null,
        }).eq('profile_id', profileId)

        console.log(`[lemonsqueezy-webhook] Payment success for ${profileId}`)
        break
      }

      case 'subscription_payment_failed': {
        await supabase.from('subscriptions').update({
          status: 'past_due',
        }).eq('profile_id', profileId)

        console.log(`[lemonsqueezy-webhook] Payment failed for ${profileId}`)
        break
      }

      default:
        console.log(`[lemonsqueezy-webhook] Unhandled event: ${eventName}`)
    }

    return json({ received: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[lemonsqueezy-webhook] Error:', msg)
    return json({ error: msg }, 500)
  }
})
