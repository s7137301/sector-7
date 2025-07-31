// --- CONFIGURATION ---
const ALLOWED_ORIGIN = 'https://sector-7.pages.dev';
const SITEVERIFY_URL = 'https://challenges.cloudflare.com/api/v0/siteverify';

// --- UTILITIES ---
function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      ...extraHeaders,
    },
  });
}

// --- MAIN HANDLER ---
async function handleRequest(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  if (request.method !== 'POST') {
    return jsonResponse({ success: false, errors: ['Method Not Allowed: Use POST'] }, 405);
  }

  if (request.headers.get('Content-Type') !== 'application/json') {
    return jsonResponse({ success: false, errors: ['Expected application/json'] }, 400);
  }

  try {
    const body = await request.json();
    const token = body.token;

    if (!token) {
      return jsonResponse({ success: false, errors: ['Missing Turnstile token'] }, 400);
    }

    if (!TURNSTILE_SECRET_KEY) {
      return jsonResponse({ success: false, errors: ['Server misconfigured: Missing secret key'] }, 500);
    }

    const ip = request.headers.get('CF-Connecting-IP');
    const formData = new FormData();
    formData.append('secret', TURNSTILE_SECRET_KEY);
    formData.append('response', token);
    if (ip) formData.append('remoteip', ip);

    const verifyRes = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      body: formData,
    });

    const rawText = await verifyRes.text();

    let outcome;
    try {
      outcome = JSON.parse(rawText);
    } catch {
      return jsonResponse({ success: false, errors: ['Invalid response from Turnstile API'] }, 502);
    }

    if (outcome.success) {
      return jsonResponse({ success: true, message: 'Token verified' });
    } else {
      return jsonResponse({ success: false, errors: outcome['error-codes'] || ['Verification failed'] }, 400);
    }

  } catch (err) {
    return jsonResponse({ success: false, errors: ['Unexpected server error'] }, 500);
  }
}

// --- LISTENER ---
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});
