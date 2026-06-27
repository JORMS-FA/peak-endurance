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

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseKey)

  const clientId = Deno.env.get('STRAVA_CLIENT_ID')
  const clientSecret = Deno.env.get('STRAVA_CLIENT_SECRET')

  if (!clientId || !clientSecret) {
    return json({ error: 'Strava config missing' }, 500)
  }

  try {
    const auth = req.headers.get('Authorization')
    if (!auth) return json({ error: 'Unauthorized' }, 401)
    const { data: { user }, error: authError } = await supabase.auth.getUser(auth.replace('Bearer ', ''))
    if (authError || !user) return json({ error: 'Unauthorized' }, 401)

    const body = await req.json()
    const sportFilter = body?.sport ?? undefined

    // Get Strava tokens
    const { data: token, error: tokenError } = await supabase
      .from('strava_tokens')
      .select('access_token, refresh_token, expires_at')
      .eq('profile_id', user.id)
      .maybeSingle()

    if (tokenError || !token) {
      return json({ segments: [], total: 0 })
    }

    let accessToken = token.access_token

    // Check if token expired
    if (new Date(token.expires_at) < new Date()) {
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
        return json({ segments: [], total: 0 })
      }

      const tokens = await refreshRes.json()
      accessToken = tokens.access_token
      const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString()
      await supabase
        .from('strava_tokens')
        .update({ access_token: accessToken, refresh_token: tokens.refresh_token, expires_at: expiresAt, updated_at: new Date().toISOString() })
        .eq('profile_id', user.id)
    }

    // Fetch starred segments from Strava API
    const segmentsUrl = new URL('https://www.strava.com/api/v3/athletes')
    const { data: tokenInfo } = await supabase
      .from('strava_tokens')
      .select('athlete_id')
      .eq('profile_id', user.id)
      .maybeSingle()

    const athleteId = tokenInfo?.athlete_id
    if (!athleteId) {
      return json({ segments: [], total: 0 })
    }

    const res = await fetch(`https://www.strava.com/api/v3/segments/starred`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!res.ok) {
      console.error('Strava segments API error:', res.status, await res.text())
      return json({ segments: [], total: 0 })
    }

    const rawSegments: Array<Record<string, unknown>> = await res.json()

    const segments = rawSegments.map((s: Record<string, unknown>) => {
      const athletePr = s.athlete_pr_effort as Record<string, unknown> | null
      return {
        id: String(s.id ?? ''),
        name: String(s.name ?? ''),
        distance_km: ((s.distance as number) ?? 0) / 1000,
        elevation_gain: (s.elevation_gain as number) ?? 0,
        average_grade: (s.average_grade as number) ?? null,
        effort: athletePr?.elapsed_time ? formatPace(athletePr.elapsed_time as number) : null,
        starred: true,
        sport: (s.activity_type as string)?.toLowerCase()?.includes('ride') ? 'riding' : 'running',
        pr_time: athletePr?.elapsed_time ? formatTime(athletePr.elapsed_time as number) : null,
        kom: null,
        city: (s.city as string) ?? null,
        state: (s.state as string) ?? null,
        country: (s.country as string) ?? null,
      }
    })

    const filtered = sportFilter
      ? segments.filter((s) => s.sport === sportFilter)
      : segments

    return json({ segments: filtered, total: filtered.length })
  } catch (err) {
    console.error('strava-segments error:', err)
    return json({ segments: [], total: 0 })
  }
})

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const sec = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  return `${m}:${String(sec).padStart(2, '0')}`
}

function formatPace(seconds: number): string {
  const min = Math.floor(seconds / 60)
  const sec = seconds % 60
  return `${min}:${String(sec).padStart(2, '0')} /km`
}
