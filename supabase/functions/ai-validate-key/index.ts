// ai-validate-key edge function
// Validates a user-provided API key for any supported provider.
// POST body: { key: string, provider?: 'google_ai' | 'openai' | 'anthropic' }
// Returns: { valid: boolean, error?: string }

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

async function validateGoogleAI(key: string): Promise<{ valid: boolean; error?: string }> {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${key.trim()}`)
  if (res.ok) return { valid: true }

  const errorBody = await res.text()
  let errorMessage = 'Invalid API key'
  try {
    const parsed = JSON.parse(errorBody)
    errorMessage = parsed?.error?.message ?? errorMessage
  } catch { /* ignore */ }
  return { valid: false, error: errorMessage }
}

async function validateOpenAI(key: string): Promise<{ valid: boolean; error?: string }> {
  const res = await fetch('https://api.openai.com/v1/models', {
    headers: { 'Authorization': `Bearer ${key.trim()}` },
  })
  if (res.ok) return { valid: true }

  const errorBody = await res.text()
  let errorMessage = 'Invalid API key'
  try {
    const parsed = JSON.parse(errorBody)
    errorMessage = parsed?.error?.message ?? errorMessage
  } catch { /* ignore */ }
  return { valid: false, error: errorMessage }
}

async function validateAnthropic(key: string): Promise<{ valid: boolean; error?: string }> {
  // Anthropic doesn't have a list-models endpoint, so we make a minimal request
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key.trim(),
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1,
      messages: [{ role: 'user', content: 'Hi' }],
    }),
  })

  if (res.ok) return { valid: true }

  const errorBody = await res.text()
  let errorMessage = 'Invalid API key'
  try {
    const parsed = JSON.parse(errorBody)
    // 401 = invalid key, 429 = rate limited (key is valid), 400 = other issues
    if (res.status === 429) return { valid: true } // Rate limited means key works
    errorMessage = parsed?.error?.message ?? errorMessage
  } catch { /* ignore */ }
  return { valid: false, error: errorMessage }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  // Authenticate user
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseKey)

  const authHeader = req.headers.get('authorization') ?? ''
  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return json({ error: 'Unauthorized' }, 401)
  }

  try {
    const { key, provider = 'google_ai' } = await req.json()
    if (!key || typeof key !== 'string' || key.trim().length < 10) {
      return json({ valid: false, error: 'Invalid key format' })
    }

    let result: { valid: boolean; error?: string }

    switch (provider) {
      case 'openai':
        result = await validateOpenAI(key)
        break
      case 'anthropic':
        result = await validateAnthropic(key)
        break
      case 'google_ai':
      default:
        result = await validateGoogleAI(key)
        break
    }

    return json(result)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return json({ valid: false, error: msg })
  }
})
