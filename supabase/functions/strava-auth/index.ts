import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseKey)

  const clientId = Deno.env.get('STRAVA_CLIENT_ID')
  const clientSecret = Deno.env.get('STRAVA_CLIENT_SECRET')
  const redirectUri = Deno.env.get('STRAVA_REDIRECT_URI')
  const appUrl = Deno.env.get('APP_URL') || 'http://localhost:4173'

  if (!clientId || !clientSecret || !redirectUri) {
    return json({ error: 'Strava config missing on server' }, 500)
  }

  try {
    if (req.method === 'GET') {
      const url = new URL(req.url)
      if (url.pathname.includes('/callback')) {
        return handleCallback(url, supabase, clientId, clientSecret, redirectUri, appUrl)
      }
      return json({ error: 'Not found' }, 404)
    }

    // POST — body-routed: { action: 'auth' | 'status' | 'refresh' | 'disconnect' }
    const body = await req.json()
    switch (body.action) {
      case 'auth':
        return handleAuth(req, supabase, clientId, redirectUri)
      case 'login':
        return handleLoginStart(supabase, clientId, redirectUri)
      case 'status':
        return handleStatus(req, supabase)
      case 'refresh':
        return handleRefresh(req, supabase, clientId, clientSecret)
      case 'disconnect':
        return handleDisconnect(req, supabase)
      default:
        return json({ error: 'Unknown action' }, 400)
    }
  } catch (err) {
    console.error('strava-auth error:', err)
    return json({ error: 'Internal error' }, 500)
  }
})

async function handleAuth(
  req: Request,
  supabase: ReturnType<typeof createClient>,
  clientId: string,
  redirectUri: string,
) {
  const user = await getUser(req, supabase)
  if (!user) return json({ error: 'Unauthorized' }, 401)

  const state = crypto.randomUUID()
  const { error: insertError } = await supabase.from('strava_oauth_states').insert({
    state,
    profile_id: user.id,
    created_at: new Date().toISOString(),
  })
  if (insertError) {
    console.error('Failed to store state:', insertError)
    return json({ error: 'Failed to initiate OAuth' }, 500)
  }

  const stravaUrl = new URL('https://www.strava.com/oauth/authorize')
  stravaUrl.searchParams.set('client_id', clientId)
  stravaUrl.searchParams.set('redirect_uri', redirectUri)
  stravaUrl.searchParams.set('response_type', 'code')
  stravaUrl.searchParams.set('approval_prompt', 'auto')
  stravaUrl.searchParams.set('scope', 'read,activity:read')
  stravaUrl.searchParams.set('state', state)

  return json({ url: stravaUrl.toString() })
}

async function handleCallback(
  url: URL,
  supabase: ReturnType<typeof createClient>,
  clientId: string,
  clientSecret: string,
  redirectUri: string,
  appUrl: string,
): Promise<Response> {
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  if (!code || !state) {
    return new Response('Missing code or state', { status: 400 })
  }

  const { data: stateData, error: stateError } = await supabase
    .from('strava_oauth_states')
    .select('profile_id, purpose')
    .eq('state', state)
    .single()

  if (stateError || !stateData) {
    console.error('Invalid state:', stateError)
    return new Response('Invalid state', { status: 400 })
  }

  await supabase.from('strava_oauth_states').delete().eq('state', state)

  const tokenRes = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
    }),
  })

  if (!tokenRes.ok) {
    const text = await tokenRes.text()
    console.error('Strava token exchange failed:', text)
    return new Response('Token exchange failed', { status: 502 })
  }

  const tokens = await tokenRes.json()
  const athlete = tokens.athlete
  const athleteName = athlete ? `${athlete.firstname ?? ''} ${athlete.lastname ?? ''}`.trim() || null : null
  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString()

  // ── Login flow: no existing profile; create/sign-in a user from Strava ──
  if (stateData.purpose === 'login') {
    return handleLoginCallback(supabase, appUrl, {
      athleteId: String(athlete?.id ?? ''),
      athleteName,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt,
      avatar: athlete?.profile ?? null,
    })
  }

  // ── Connect flow: attach tokens to the already-logged-in profile ──
  await supabase.from('strava_tokens').upsert(
    {
      profile_id: stateData.profile_id,
      athlete_id: String(athlete?.id ?? ''),
      athlete_name: athleteName,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: expiresAt,
      scopes: 'read,activity:read',
    },
    { onConflict: 'profile_id' },
  )

  return new Response(null, {
    status: 302,
    headers: { Location: `${appUrl}/app/conexiones?strava=success` },
  })
}

async function handleLoginStart(
  supabase: ReturnType<typeof createClient>,
  clientId: string,
  redirectUri: string,
) {
  const state = crypto.randomUUID()
  const { error } = await supabase.from('strava_oauth_states').insert({
    state,
    profile_id: null,
    purpose: 'login',
    created_at: new Date().toISOString(),
  })
  if (error) {
    console.error('Failed to store login state:', error)
    return json({ error: 'Failed to initiate Strava login' }, 500)
  }

  const stravaUrl = new URL('https://www.strava.com/oauth/authorize')
  stravaUrl.searchParams.set('client_id', clientId)
  stravaUrl.searchParams.set('redirect_uri', redirectUri)
  stravaUrl.searchParams.set('response_type', 'code')
  stravaUrl.searchParams.set('approval_prompt', 'auto')
  stravaUrl.searchParams.set('scope', 'read,activity:read')
  stravaUrl.searchParams.set('state', state)
  return json({ url: stravaUrl.toString() })
}

async function handleLoginCallback(
  supabase: ReturnType<typeof createClient>,
  appUrl: string,
  s: {
    athleteId: string
    athleteName: string | null
    accessToken: string
    refreshToken: string
    expiresAt: string
    avatar: string | null
  },
): Promise<Response> {
  if (!s.athleteId) {
    return Response.redirect(`${appUrl}/login?error=strava`, 302)
  }
  // Strava does not expose email — use a stable synthetic address.
  const email = `strava-${s.athleteId}@users.peakendurance.app`

  // Create the user (ignore "already exists"); then mint a magic link to
  // establish a session and redirect the browser to it.
  await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: {
      full_name: s.athleteName ?? `Strava ${s.athleteId}`,
      avatar_url: s.avatar,
      provider: 'strava',
      strava_athlete_id: s.athleteId,
    },
  })

  const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: { redirectTo: `${appUrl}/app/conexiones?strava=success` },
  })

  if (linkErr || !linkData?.properties?.action_link || !linkData.user) {
    console.error('generateLink failed:', linkErr)
    return Response.redirect(`${appUrl}/login?error=strava_session`, 302)
  }

  // Persist the Strava tokens for this (new) user so they're connected.
  await supabase.from('strava_tokens').upsert(
    {
      profile_id: linkData.user.id,
      athlete_id: s.athleteId,
      athlete_name: s.athleteName,
      access_token: s.accessToken,
      refresh_token: s.refreshToken,
      expires_at: s.expiresAt,
      scopes: 'read,activity:read',
    },
    { onConflict: 'profile_id' },
  )

  return Response.redirect(linkData.properties.action_link, 302)
}

async function handleStatus(
  req: Request,
  supabase: ReturnType<typeof createClient>,
) {
  const user = await getUser(req, supabase)
  if (!user) return json({ error: 'Unauthorized' }, 401)

  const { data: token } = await supabase
    .from('strava_tokens')
    .select('athlete_id, athlete_name, expires_at, scopes')
    .eq('profile_id', user.id)
    .single()

  if (!token) {
    return json({ connected: false, athlete: null })
  }

  const isExpired = new Date(token.expires_at) < new Date()

  // Having a token row means connected; the access token is auto-refreshed on
  // demand (sync/refresh), so an expired access token is NOT "disconnected".
  return json({
    connected: Boolean(token.athlete_id),
    athlete: token.athlete_id
      ? { id: token.athlete_id, name: token.athlete_name }
      : null,
    expiresAt: token.expires_at,
    scopes: token.scopes,
    needsRefresh: isExpired,
  })
}

async function handleRefresh(
  req: Request,
  supabase: ReturnType<typeof createClient>,
  clientId: string,
  clientSecret: string,
) {
  const user = await getUser(req, supabase)
  if (!user) return json({ error: 'Unauthorized' }, 401)

  const { data: token } = await supabase
    .from('strava_tokens')
    .select('refresh_token')
    .eq('profile_id', user.id)
    .single()

  if (!token) return json({ error: 'No token to refresh' }, 400)

  const refreshRes = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      refresh_token: token.refresh_token,
    }),
  })

  if (!refreshRes.ok) {
    const text = await refreshRes.text()
    console.error('Strava refresh failed:', text)
    return json({ error: 'Refresh failed' }, 502)
  }

  const tokens = await refreshRes.json()
  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString()

  await supabase
    .from('strava_tokens')
    .update({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq('profile_id', user.id)

  return json({ success: true, expiresAt })
}

async function handleDisconnect(
  req: Request,
  supabase: ReturnType<typeof createClient>,
) {
  const user = await getUser(req, supabase)
  if (!user) return json({ error: 'Unauthorized' }, 401)

  // Best-effort token revoke at Strava (ignore errors).
  const { data: token } = await supabase
    .from('strava_tokens')
    .select('access_token')
    .eq('profile_id', user.id)
    .maybeSingle()

  if (token?.access_token) {
    try {
      await fetch('https://www.strava.com/oauth/deauthorize', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token.access_token}` },
      })
    } catch (err) {
      console.warn('[strava-auth] deauthorize warning:', err)
    }
  }

  await supabase.from('strava_tokens').delete().eq('profile_id', user.id)
  return json({ success: true })
}

async function getUser(
  req: Request,
  supabase: ReturnType<typeof createClient>,
) {
  const auth = req.headers.get('Authorization')
  if (!auth) return null
  const { data, error } = await supabase.auth.getUser(auth.replace('Bearer ', ''))
  if (error || !data?.user) return null
  return data.user
}
