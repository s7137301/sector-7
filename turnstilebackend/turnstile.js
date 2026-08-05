// --- CONFIGURATION ---
const ALLOWED_ORIGINS = new Set(['https://sector-7.org', 'https://sector-7.pages.dev', 'http://127.0.0.1:8080']);
const SITEVERIFY_URL = 'https://challenges.cloudflare.com/api/v0/siteverify';
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const REPLAY_WINDOW_MS = 10 * 60_000;
const RATE_LIMITS = new Map();
const TOKEN_CACHE = new Map();

function getOriginResponseHeader(request) {
  const origin = request.headers.get('Origin') || '';
  return ALLOWED_ORIGINS.has(origin) ? origin : 'https://sector-7.org';
}

function jsonResponse(data, status = 200, request, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': getOriginResponseHeader(request),
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
      ...extraHeaders,
    },
  });
}

function applyRateLimit(ip) {
  const now = Date.now();
  const bucket = RATE_LIMITS.get(ip) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };

  if (now > bucket.resetAt) {
    bucket.count = 0;
    bucket.resetAt = now + RATE_LIMIT_WINDOW_MS;
  }

  bucket.count += 1;
  RATE_LIMITS.set(ip, bucket);

  return bucket.count <= RATE_LIMIT_MAX_REQUESTS;
}

function isReplayToken(token) {
  if (!token) return false;
  const cached = TOKEN_CACHE.get(token);
  if (cached && (Date.now() - cached) < REPLAY_WINDOW_MS) {
    return true;
  }
  TOKEN_CACHE.set(token, Date.now());
  return false;
}

// --- MAIN HANDLER ---
async function handleRequest(request) {
  const origin = getOriginResponseHeader(request);

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  if (request.method !== 'POST') {
    return jsonResponse({ success: false, errors: ['Method Not Allowed: Use POST'] }, 405, request);
  }

  if (request.headers.get('Content-Type') !== 'application/json') {
    return jsonResponse({ success: false, errors: ['Expected application/json'] }, 400, request);
  }

  try {
    const body = await request.json();
    const token = body.token || body['cf-turnstile-response'];
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';

    if (!applyRateLimit(ip)) {
      return jsonResponse({ success: false, errors: ['Too many verification attempts'] }, 429, request);
    }

    if (!token) {
      return jsonResponse({ success: false, errors: ['Missing Turnstile token'] }, 400, request);
    }

    if (isReplayToken(token)) {
      return jsonResponse({ success: false, errors: ['Token replay detected'] }, 429, request);
    }

    if (!TURNSTILE_SECRET_KEY) {
      return jsonResponse({ success: false, errors: ['Server misconfigured: Missing secret key'] }, 500, request);
    }

    const formData = new FormData();
    formData.append('secret', TURNSTILE_SECRET_KEY);
    formData.append('response', token);
    if (ip && ip !== 'unknown') formData.append('remoteip', ip);

    const verifyRes = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      body: formData,
    });

    const rawText = await verifyRes.text();

    let outcome;
    try {
      outcome = JSON.parse(rawText);
    } catch {
      return jsonResponse({ success: false, errors: ['Invalid response from Turnstile API'] }, 502, request);
    }

    if (outcome.success) {
      return jsonResponse({ success: true, message: 'Token verified' }, 200, request);
    }

    return jsonResponse({ success: false, errors: outcome['error-codes'] || ['Verification failed'] }, 400, request);
  } catch (err) {
    console.warn('turnstile-verifier-error', { message: 'Unexpected verification failure' });
    return jsonResponse({ success: false, errors: ['Unexpected server error'] }, 500, request);
  }
}

// --- LISTENER ---
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});
