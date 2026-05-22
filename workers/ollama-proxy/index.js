const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    const url = new URL(request.url)
    if (request.method !== 'POST' || url.pathname !== '/api/chat') {
      return new Response('Not found', { status: 404, headers: corsHeaders })
    }

    if (!env.OLLAMA_API_KEY || !env.OLLAMA_BASE_URL) {
      return new Response(
        JSON.stringify({ error: 'Missing OLLAMA_API_KEY or OLLAMA_BASE_URL' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const upstream = await fetch(`${env.OLLAMA_BASE_URL.replace(/\/+$/, '')}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.OLLAMA_API_KEY}`,
      },
      body: await request.text(),
    })

    return new Response(await upstream.text(), {
      status: upstream.status,
      headers: {
        ...corsHeaders,
        'Content-Type': upstream.headers.get('Content-Type') || 'application/json',
      },
    })
  },
}
