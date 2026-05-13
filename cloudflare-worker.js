// Cloudflare Worker — proxy seguro para MAT-IA → Anthropic API
// Deploy en: https://dash.cloudflare.com → Workers → Create Worker
// Agregar secret: ANTHROPIC_API_KEY (Settings → Variables → Secret)

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = ['https://www.64bits.com.ar', 'https://64bits.com.ar'];

    if (request.method === 'OPTIONS') {
      return preflight(allowed.includes(origin) ? origin : allowed[0]);
    }

    if (request.method !== 'POST') {
      return respond({ error: 'Method not allowed' }, 405, allowed[0]);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return respond({ error: 'Invalid JSON' }, 400, allowed[0]);
    }

    const { messages, system } = body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return respond({ error: 'messages must be a non-empty array' }, 400, allowed[0]);
    }

    let apiRes;
    try {
      apiRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 512,
          system: system || '',
          messages,
        }),
      });
    } catch (err) {
      return respond({ error: 'Upstream fetch failed', detail: err.message }, 502, allowed[0]);
    }

    const data = await apiRes.json();
    const cors = allowed.includes(origin) ? origin : allowed[0];
    return respond(data, apiRes.status, cors);
  },
};

function respond(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

function preflight(origin) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}
