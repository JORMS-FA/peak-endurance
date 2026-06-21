// strava-sync edge function
//
// Pulls the user's recent Strava activities, computes a heuristic TSS, and
// upserts them into `imported_activities`. Auto-refreshes the access token if
// it has expired.
//
// Body (POST):
//   { days?: number }  // how many days back to sync (default 60, max 180)
//
// Returns:
//   { synced: number, total: number, skipped: number, since: string }

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

// ─── Sport mapping ──────────────────────────────────────────────────────────
function mapSport(stravaType: string | undefined): string {
  if (!stravaType) return 'other'
  const t = stravaType.toLowerCase()
  if (t === 'run' || t === 'trailrun' || t === 'virtualrun') return 'run'
  if (
    t === 'ride' ||
    t === 'virtualride' ||
    t === 'mountainbikeride' ||
    t === 'gravelride' ||
    t === 'ebikeride' ||
    t === 'ebikemountainride'
  ) return 'bike'
  if (t === 'swim') return 'swim'
  if (
    t === 'weighttraining' ||
    t === 'workout' ||
    t === 'crossfit' ||
    t === 'yoga' ||
    t === 'pilates'
  ) return 'gym'
  return 'other'
}

// ─── Heuristic TSS (HR-based, with safe fallbacks) ──────────────────────────
//
// hrTSS = (duration_seconds / 3600) * IF^2 * 100
// IF (intensity factor) = avg_hr / threshold_hr
// threshold_hr ≈ 0.85 * max_hr_estimate (default 185)
//
// If avg_hr is null and suffer_score is present, we use suffer_score as TSS.
// If both are missing, we fall back to a duration-based estimate at IF≈0.65
// (typical Z2 effort).
//
function computeTss(activity: {
  moving_time?: number
  elapsed_time?: number
  average_heartrate?: number | null
  max_heartrate?: number | null
  suffer_score?: number | null
}): number {
  const duration = activity.moving_time || activity.elapsed_time || 0
  if (duration <= 0) return 0
  const hours = duration / 3600

  // Path 1: HR-based
  const avgHr = activity.average_heartrate
  if (avgHr && avgHr > 60) {
    const maxHr = activity.max_heartrate && activity.max_heartrate > avgHr
      ? activity.max_heartrate
      : 185 // generic estimate
    const thresholdHr = 0.85 * maxHr
    const intensityFactor = avgHr / thresholdHr
    const tss = hours * intensityFactor * intensityFactor * 100
    return Math.round(Math.max(0, Math.min(tss, 600)))
  }

  // Path 2: Strava's suffer_score (only available with subscription)
  if (typeof activity.suffer_score === 'number' && activity.suffer_score > 0) {
    return Math.round(Math.min(activity.suffer_score, 600))
  }

  // Path 3: duration-only conservative estimate (Z2 ~ IF 0.65)
  return Math.round(hours * 0.65 * 0.65 * 100)
}

// ─── Token refresh ──────────────────────────────────────────────────────────
async function refreshIfNeeded(
  supabase: ReturnType<typeof createClient>,
  profileId: string,
  clientId: string,
  clientSecret: string,
): Promise<{ accessToken: string; sourceConnectionId: string | null } | null> {
  const { data: token, error } = await supabase
    .from('strava_tokens')
    .select('access_token, refresh_token, expires_at')
    .eq('profile_id', profileId)
    .single()

  if (error || !token) return null

  const expiresAt = new Date(token.expires_at).getTime()
  const now = Date.now()

  let accessToken = token.access_token

  if (expiresAt - now < 60_000) {
    // Less than a minute left → refresh
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
      console.error('[strava-sync] refresh failed:', await refreshRes.text())
      return null
    }
    const refreshed = await refreshRes.json()
    accessToken = refreshed.access_token
    const newExpiresAt = new Date(now + refreshed.expires_in * 1000).toISOString()
    await supabase
      .from('strava_tokens')
      .update({
        access_token: refreshed.access_token,
        refresh_token: refreshed.refresh_token,
        expires_at: newExpiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq('profile_id', profileId)
  }

  // Find or create the source_connections row tied to this Strava token,
  // so imported_activities.source_connection_id is populated.
  const { data: stravaSource } = await supabase
    .from('activity_sources')
    .select('id')
    .eq('source_type', 'strava')
    .single()

  let sourceConnectionId: string | null = null
  if (stravaSource) {
    const { data: existingConn } = await supabase
      .from('source_connections')
      .select('id')
      .eq('profile_id', profileId)
      .eq('source_id', stravaSource.id)
      .maybeSingle()

    if (existingConn) {
      sourceConnectionId = existingConn.id
    } else {
      const { data: created } = await supabase
        .from('source_connections')
        .insert({
          profile_id: profileId,
          source_id: stravaSource.id,
          status: 'connected',
        })
        .select('id')
        .single()
      sourceConnectionId = created?.id ?? null
    }
  }

  return { accessToken, sourceConnectionId }
}

// ─── Strava activities fetcher with pagination ──────────────────────────────
type StravaActivity = {
  id: number
  name: string
  type?: string
  sport_type?: string
  start_date_local: string
  elapsed_time: number
  moving_time: number
  distance: number
  total_elevation_gain: number | null
  average_heartrate: number | null
  max_heartrate: number | null
  suffer_score: number | null
}

async function fetchStravaActivities(
  accessToken: string,
  sinceUnix: number,
): Promise<StravaActivity[]> {
  const all: StravaActivity[] = []
  let page = 1
  const perPage = 100
  while (true) {
    const url = new URL('https://www.strava.com/api/v3/athlete/activities')
    url.searchParams.set('after', String(sinceUnix))
    url.searchParams.set('per_page', String(perPage))
    url.searchParams.set('page', String(page))

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!res.ok) {
      const txt = await res.text()
      throw new Error(`Strava API ${res.status}: ${txt}`)
    }
    const batch: StravaActivity[] = await res.json()
    if (!Array.isArray(batch) || batch.length === 0) break
    all.push(...batch)
    if (batch.length < perPage) break
    page++
    if (page > 5) break // hard cap: 500 activities per sync
  }
  return all
}

// ─── Main handler ───────────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseKey)

  const clientId = Deno.env.get('STRAVA_CLIENT_ID')
  const clientSecret = Deno.env.get('STRAVA_CLIENT_SECRET')
  if (!clientId || !clientSecret) return json({ error: 'Strava config missing' }, 500)

  // ── auth ──
  const auth = req.headers.get('Authorization')
  if (!auth) return json({ error: 'Unauthorized' }, 401)
  const userRes = await supabase.auth.getUser(auth.replace('Bearer ', ''))
  if (userRes.error || !userRes.data?.user) return json({ error: 'Unauthorized' }, 401)
  const user = userRes.data.user

  let body: { days?: number } = {}
  try { body = await req.json() } catch { /* empty body is fine */ }
  const days = Math.min(Math.max(body.days ?? 60, 1), 180)
  const sinceMs = Date.now() - days * 24 * 60 * 60 * 1000
  const sinceUnix = Math.floor(sinceMs / 1000)

  // ── token ──
  const tokenInfo = await refreshIfNeeded(supabase, user.id, clientId, clientSecret)
  if (!tokenInfo) return json({ error: 'Strava not connected' }, 400)

  // ── fetch activities ──
  let activities: StravaActivity[]
  try {
    activities = await fetchStravaActivities(tokenInfo.accessToken, sinceUnix)
  } catch (err) {
    console.error('[strava-sync] fetch error:', err)
    return json({ error: 'Failed to fetch activities from Strava' }, 502)
  }

  // ── upsert ──
  let synced = 0
  let skipped = 0

  for (const a of activities) {
    if (!a.id || !a.start_date_local) {
      skipped++
      continue
    }
    const sport = mapSport(a.sport_type ?? a.type)
    const tss = computeTss(a)
    const distanceKm = a.distance ? a.distance / 1000 : 0
    const durationMin = a.moving_time ? Math.round(a.moving_time / 60) : null
    const activityDate = a.start_date_local.slice(0, 10)

    const { error } = await supabase.from('imported_activities').upsert(
      {
        profile_id: user.id,
        source_connection_id: tokenInfo.sourceConnectionId,
        external_activity_id: String(a.id),
        source_type: 'strava',
        activity_date: activityDate,
        title: a.name ?? 'Activity',
        sport,
        duration_minutes: durationMin,
        distance_km: distanceKm,
        elevation_gain_m: a.total_elevation_gain ? Math.round(a.total_elevation_gain) : null,
        avg_hr: a.average_heartrate ? Math.round(a.average_heartrate) : null,
        max_hr: a.max_heartrate ? Math.round(a.max_heartrate) : null,
        tss,
        zone_precision: a.average_heartrate ? 'estimated' : 'insufficient',
        raw_payload: a as unknown as Record<string, unknown>,
      },
      { onConflict: 'source_type,external_activity_id' },
    )
    if (error) {
      console.error('[strava-sync] upsert error:', error.message)
      skipped++
    } else {
      synced++
    }
  }

  return json({
    synced,
    skipped,
    total: activities.length,
    since: new Date(sinceMs).toISOString(),
  })
})
