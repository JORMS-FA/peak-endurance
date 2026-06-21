// lemonsqueezy-checkout edge function
// Creates a Lemon Squeezy checkout URL for subscription upgrade.
// POST body: { variantId?: string }
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
  const lsStoreId = Deno.env.get('LEMONSQUEEZY_STORE_ID')
  const lsVariantId = Deno.env.get('LEMONSQUEEZY_VARIANT_ID_PRO')
  const appUrl = Deno.env.get('APP_URL') || 'https://peak-endurance.vercel.app'

  if (!lsApiKey || !lsStoreId) {
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
    const body = await req.json().catch(() => ({}))
    const variantId = body.variantId || lsVariantId

    if (!variantId) {
      return json({ error: 'No variant ID configured' }, 500)
    }

    // Get user profile for email
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, display_name')
      .eq('id', user.id)
      .maybeSingle()

    // Create checkout via Lemon Squeezy API
    const checkoutRes = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lsApiKey}`,
        'Content-Type': 'application/vnd.api+json',
        'Accept': 'application/vnd.api+json',
      },
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          attributes: {
            checkout_data: {
              email: profile?.email || user.email || '',
              name: profile?.display_name || '',
              custom: {
                supabase_uid: user.id,
              },
            },
            checkout_options: {
              dark: true,
              embed: false,
              logo: true,
            },
            product_options: {
              redirect_url: `${appUrl}/app/ajustes?upgrade=success`,
            },
          },
          relationships: {
            store: {
              data: {
                type: 'stores',
                id: lsStoreId,
              },
            },
            variant: {
              data: {
                type: 'variants',
                id: variantId,
              },
            },
          },
        },
      }),
    })

    if (!checkoutRes.ok) {
      const errText = await checkoutRes.text()
      console.error('[lemonsqueezy-checkout] Error:', errText)
      return json({ error: 'Failed to create checkout' }, 500)
    }

    const checkout = await checkoutRes.json()
    const checkoutUrl = checkout.data?.attributes?.url

    if (!checkoutUrl) {
      return json({ error: 'No checkout URL returned' }, 500)
    }

    return json({ url: checkoutUrl })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[lemonsqueezy-checkout] Error:', msg)
    return json({ error: msg }, 500)
  }
})
