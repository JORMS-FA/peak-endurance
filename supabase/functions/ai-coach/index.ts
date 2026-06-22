// ai-coach edge function
// Handles AI coaching requests using Google Gemini API.
// Free users: uses their own BYOK key (Gemini Flash)
// Pro users: uses project server-side key (Gemini Pro) with quota tracking
//
// POST body: { action: 'analyze_week' | 'adjust_plan' | 'detect_fatigue', context: object }
// Returns: { result: object } or error

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

type AiAction = 'analyze_week' | 'adjust_plan' | 'detect_fatigue'

interface AiContext {
  ctl: number
  atl: number
  tsb: number
  weeklyHours: number
  weeklyDistance: number
  recentActivities: Array<{
    date: string
    sport: string
    duration_minutes: number
    tss: number
    title: string
  }>
  plannedSessions?: Array<{
    id: string
    date: string
    sport: string
    title: string
    duration_minutes: number
    tss: number
  }>
}

function buildPrompt(action: AiAction, ctx: AiContext): string {
  const base = `You are an expert endurance sports coach AI for Peak Endurance app.
You analyze athlete data and provide actionable recommendations.
Always respond in the same language the user context suggests (Spanish if metrics use Spanish labels, English otherwise).
IMPORTANT: Respond ONLY with valid JSON, no markdown, no code blocks.`

  const contextBlock = `
Athlete metrics:
- CTL (fitness): ${ctx.ctl}
- ATL (fatigue): ${ctx.atl}
- TSB (form): ${ctx.tsb}
- Weekly hours: ${ctx.weeklyHours}
- Weekly distance: ${ctx.weeklyDistance} km
- Recent activities (last 7-14 days): ${JSON.stringify(ctx.recentActivities?.slice(0, 10) ?? [])}
${ctx.plannedSessions ? `- Planned sessions: ${JSON.stringify(ctx.plannedSessions.slice(0, 7))}` : ''}`

  switch (action) {
    case 'analyze_week':
      return `${base}

${contextBlock}

Analyze this athlete's current week. Compare planned vs executed if available.
Respond as JSON:
{
  "summary": "2-3 sentence overview of the week",
  "status": "on_track" | "behind" | "overreaching" | "recovering",
  "deviations": ["list of notable deviations from plan or norms"],
  "recommendations": ["3-5 actionable recommendations for next week"],
  "risk_level": "low" | "medium" | "high"
}`

    case 'adjust_plan':
      return `${base}

${contextBlock}

Based on the athlete's real fatigue (TSB=${ctx.tsb}, ATL=${ctx.atl}), propose adjustments to upcoming sessions.
Only modify sessions that conflict with current fatigue state.
Respond as JSON:
{
  "summary": "Brief explanation of why adjustments are needed",
  "adjustments": [
    {
      "session_date": "YYYY-MM-DD",
      "original_description": "what was planned",
      "proposed_change": "what you suggest instead",
      "reason": "why this change helps"
    }
  ],
  "general_advice": "1-2 sentences of general guidance"
}`

    case 'detect_fatigue':
      return `${base}

${contextBlock}

Evaluate the athlete's fatigue accumulation over the data provided.
Determine if they are at risk of overtraining.
Respond as JSON:
{
  "risk_level": "low" | "medium" | "high",
  "form_trend": "improving" | "stable" | "declining",
  "signals": ["list of fatigue signals detected"],
  "recommendations": ["2-4 recovery or training recommendations"],
  "rest_day_needed": true | false,
  "summary": "2-3 sentence assessment"
}`
  }
}

type ChatMessage = { role: 'user' | 'assistant'; content: string }

interface ChatProfile {
  display_name?: string | null
  sports?: string[] | null
  running_bests?: Record<string, string> | null
  experience_level?: string | null
  weekly_hours?: number | null
  max_hr?: number | null
  resting_hr?: number | null
}

function buildChatPrompt(
  message: string,
  history: ChatMessage[],
  ctx: AiContext,
  profile: ChatProfile,
  todayIso: string,
): string {
  const convo = (history ?? [])
    .slice(-10)
    .map((m) => `${m.role === 'user' ? 'Atleta' : 'Coach'}: ${m.content}`)
    .join('\n')

  return `Eres el coach de IA de Peak Endurance, experto en deportes de resistencia.
Hablas en español, cercano pero profesional y conciso.
La fecha de hoy es ${todayIso} (UTC). Úsala para resolver expresiones como "mañana", "el lunes", "este fin de semana".

Perfil del atleta:
- Nombre: ${profile.display_name ?? 'Atleta'}
- Deportes: ${(profile.sports ?? ['run']).join(', ')}
- Nivel: ${profile.experience_level ?? 'intermediate'}
- Horas/semana: ${profile.weekly_hours ?? 'n/d'}
- FC máx: ${profile.max_hr ?? 'n/d'} · FC reposo: ${profile.resting_hr ?? 'n/d'}
- Mejores marcas running: ${JSON.stringify(profile.running_bests ?? {})}

Estado actual:
- CTL (forma física): ${ctx.ctl}
- ATL (fatiga): ${ctx.atl}
- TSB (frescura): ${ctx.tsb}
- Horas última semana: ${ctx.weeklyHours}
- Distancia última semana: ${ctx.weeklyDistance} km
- Actividades recientes: ${JSON.stringify((ctx.recentActivities ?? []).slice(0, 8))}

Conversación previa:
${convo || '(sin mensajes previos)'}

Nuevo mensaje del atleta:
"${message}"

Responde SOLO con JSON válido (sin markdown, sin bloques de código) con esta forma:
{
  "reply": "tu respuesta conversacional para el atleta",
  "create_session": null
}

Si el atleta pide crear o programar un entrenamiento, rellena "create_session" con:
{
  "session_date": "YYYY-MM-DD",
  "sport": "run" | "bike" | "swim" | "gym",
  "title": "título corto del entrenamiento",
  "intensity": "easy" | "tempo" | "threshold" | "intervals" | "long" | "recovery",
  "duration_minutes": número,
  "tss": número estimado,
  "notes": "estructura detallada: calentamiento, series, recuperación, enfriamiento"
}
Si NO pide crear un entrenamiento, deja "create_session": null.
En "reply" confirma en lenguaje natural lo que programaste cuando crees una sesión.`
}

function sanitizeSession(raw: unknown): {
  session_date: string
  sport: string
  title: string
  intensity: string | null
  duration_minutes: number | null
  tss: number | null
  notes: string | null
} | null {
  if (!raw || typeof raw !== 'object') return null
  const s = raw as Record<string, unknown>
  const date = typeof s.session_date === 'string' ? s.session_date.slice(0, 10) : ''
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null
  const sportRaw = String(s.sport ?? 'run').toLowerCase()
  const sport = ['run', 'bike', 'swim', 'gym'].includes(sportRaw) ? sportRaw : 'run'
  const title = typeof s.title === 'string' && s.title.trim() ? s.title.trim().slice(0, 120) : 'Entrenamiento'
  const intensity = typeof s.intensity === 'string' ? s.intensity.slice(0, 30) : null
  const dur = Number(s.duration_minutes)
  const tss = Number(s.tss)
  return {
    session_date: date,
    sport,
    title,
    intensity,
    duration_minutes: Number.isFinite(dur) && dur > 0 ? Math.round(dur) : null,
    tss: Number.isFinite(tss) && tss > 0 ? Math.round(Math.min(tss, 600)) : null,
    notes: typeof s.notes === 'string' ? s.notes.slice(0, 2000) : null,
  }
}

async function callGemini(apiKey: string, model: string, prompt: string): Promise<unknown> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
        responseMimeType: 'application/json',
      },
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    let msg = `Gemini API error (${res.status})`
    try {
      const parsed = JSON.parse(errText)
      msg = parsed?.error?.message ?? msg
    } catch { /* ignore */ }
    throw new Error(msg)
  }

  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Empty response from Gemini')

  try {
    return JSON.parse(text)
  } catch {
    return { raw_response: text }
  }
}

async function callOpenAI(apiKey: string, model: string, prompt: string): Promise<unknown> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2048,
      response_format: { type: 'json_object' },
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    let msg = `OpenAI API error (${res.status})`
    try {
      const parsed = JSON.parse(errText)
      msg = parsed?.error?.message ?? msg
    } catch { /* ignore */ }
    throw new Error(msg)
  }

  const data = await res.json()
  const text = data?.choices?.[0]?.message?.content
  if (!text) throw new Error('Empty response from OpenAI')

  try {
    return JSON.parse(text)
  } catch {
    return { raw_response: text }
  }
}

async function callAnthropic(apiKey: string, model: string, prompt: string): Promise<unknown> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt + '\n\nRespond ONLY with valid JSON.' }],
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    let msg = `Anthropic API error (${res.status})`
    try {
      const parsed = JSON.parse(errText)
      msg = parsed?.error?.message ?? msg
    } catch { /* ignore */ }
    throw new Error(msg)
  }

  const data = await res.json()
  const text = data?.content?.[0]?.text
  if (!text) throw new Error('Empty response from Anthropic')

  try {
    return JSON.parse(text)
  } catch {
    return { raw_response: text }
  }
}

type Provider = 'google_ai' | 'openai' | 'anthropic'

async function callAI(provider: Provider, apiKey: string, model: string, prompt: string): Promise<unknown> {
  switch (provider) {
    case 'google_ai':
      return callGemini(apiKey, model, prompt)
    case 'openai':
      return callOpenAI(apiKey, model, prompt)
    case 'anthropic':
      return callAnthropic(apiKey, model, prompt)
    default:
      return callGemini(apiKey, model, prompt)
  }
}

function getDefaultModel(provider: Provider): string {
  switch (provider) {
    case 'google_ai': return 'gemini-2.0-flash'
    case 'openai': return 'gpt-4o-mini'
    case 'anthropic': return 'claude-sonnet-4-20250514'
    default: return 'gemini-2.0-flash'
  }
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

  // Authenticate
  const authHeader = req.headers.get('authorization') ?? ''
  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return json({ error: 'Unauthorized' }, 401)
  }

  try {
    const body = await req.json() as {
      action: AiAction | 'chat'
      context: AiContext
      message?: string
      history?: ChatMessage[]
    }
    const action = body.action
    const context = body.context ?? ({} as AiContext)

    if (!['analyze_week', 'adjust_plan', 'detect_fatigue', 'chat'].includes(action)) {
      return json({ error: 'Invalid action' }, 400)
    }

    // Determine API key source and model based on subscription tier
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('plan_key, ai_quota_limit')
      .eq('profile_id', user.id)
      .maybeSingle()

    let apiKey: string
    let model: string
    let provider: Provider = 'google_ai'

    const isPro = sub?.plan_key === 'pro'

    if (isPro) {
      // Pro user: use project key, check quota
      const { data: usage } = await supabase
        .from('ai_usage_counters')
        .select('used_queries')
        .eq('profile_id', user.id)
        .maybeSingle()

      const usedQueries = usage?.used_queries ?? 0
      const limit = sub?.ai_quota_limit ?? 500

      if (usedQueries >= limit) {
        return json({
          error: 'quota_exceeded',
          message: 'Monthly AI quota exceeded. Resets on the 1st.',
          used: usedQueries,
          limit,
        }, 429)
      }

      apiKey = Deno.env.get('GOOGLE_AI_API_KEY') ?? ''
      if (!apiKey) {
        return json({ error: 'Server AI key not configured' }, 500)
      }
      provider = 'google_ai'
      model = 'gemini-2.0-flash'

      // Increment usage
      await supabase.rpc('increment_ai_usage', { p_profile_id: user.id })
    } else {
      // Free user: must use BYOK
      const { data: keyRow } = await supabase
        .from('user_api_keys')
        .select('encrypted_key, provider, model_preference, status')
        .eq('profile_id', user.id)
        .eq('status', 'active')
        .maybeSingle()

      if (!keyRow?.encrypted_key) {
        return json({
          error: 'no_api_key',
          message: 'Configure your API key in Settings to use the AI Coach on the free plan.',
        }, 402)
      }

      apiKey = keyRow.encrypted_key
      provider = (keyRow.provider ?? 'google_ai') as Provider
      model = keyRow.model_preference ?? getDefaultModel(provider)

      // Track free user usage (soft limit 20/month)
      const { data: usage } = await supabase
        .from('ai_usage_counters')
        .select('used_queries')
        .eq('profile_id', user.id)
        .maybeSingle()

      const usedQueries = usage?.used_queries ?? 0
      if (usedQueries >= 20) {
        return json({
          error: 'quota_exceeded',
          message: 'Free plan limit reached (20 queries/month). Upgrade to Pro for 500 queries.',
          used: usedQueries,
          limit: 20,
        }, 429)
      }

      await supabase.rpc('increment_ai_usage', { p_profile_id: user.id })
    }

    // ── Chat action ──────────────────────────────────────────────────────────
    if (action === 'chat') {
      const message = (body.message ?? '').toString().slice(0, 2000)
      if (!message.trim()) return json({ error: 'Empty message' }, 400)

      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, sports, running_bests, experience_level, weekly_hours, max_hr, resting_hr')
        .eq('id', user.id)
        .maybeSingle()

      const todayIso = new Date().toISOString().slice(0, 10)
      const prompt = buildChatPrompt(message, body.history ?? [], context, (profile ?? {}) as ChatProfile, todayIso)
      const aiRaw = await callAI(provider, apiKey, model, prompt) as Record<string, unknown>

      const reply = typeof aiRaw?.reply === 'string' ? aiRaw.reply : 'Listo.'
      let createdSession: Record<string, unknown> | null = null

      const candidate = sanitizeSession(aiRaw?.create_session)
      if (candidate) {
        const { data: inserted } = await supabase
          .from('training_sessions')
          .insert({
            profile_id: user.id,
            session_date: candidate.session_date,
            sport: candidate.sport,
            title: candidate.title,
            intensity: candidate.intensity,
            duration_minutes: candidate.duration_minutes,
            tss: candidate.tss,
            notes: candidate.notes,
            status: 'planned',
          })
          .select('id, session_date, sport, title, intensity, duration_minutes, tss, notes')
          .single()
        createdSession = inserted ?? null
      }

      await supabase.from('ai_coach_history').insert({
        profile_id: user.id,
        action_type: 'chat',
        request_context: { message, context },
        response: { reply, created_session: createdSession },
      })

      return json({ result: { reply, created_session: createdSession }, action })
    }

    // ── Structured analysis actions ───────────────────────────────────────────
    const prompt = buildPrompt(action, context)
    const result = await callAI(provider, apiKey, model, prompt)

    // Store the AI response as history
    await supabase.from('ai_coach_history').insert({
      profile_id: user.id,
      action_type: action,
      request_context: context,
      response: result,
    })

    return json({ result, action })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[ai-coach] Error:', msg)
    return json({ error: msg }, 500)
  }
})
