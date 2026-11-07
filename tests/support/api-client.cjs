const { loadE2EConfig } = require('./config.cjs');

function appendQuery(url, query = {}) {
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    const values = Array.isArray(value) ? value : [value];
    for (const item of values) {
      if (item === undefined || item === null) continue;
      if (!['string', 'number', 'boolean'].includes(typeof item)) {
        throw new TypeError(`Query parameter "${key}" must be a string, number, boolean, or array of those values.`);
      }
      url.searchParams.append(key, String(item));
    }
  }
}

async function request({ path, method = 'GET', token, body, query, headers, timeoutMs = 10000 }) {
  if (typeof path !== 'string' || !path.startsWith('/') || path.startsWith('//') || path.includes('#')) {
    throw new TypeError('path must be a relative API path beginning with a single slash.');
  }
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 120000) {
    throw new RangeError('timeoutMs must be an integer between 1 and 120000.');
  }

  const { apiUrl } = loadE2EConfig();
  const url = new URL(path, apiUrl);
  appendQuery(url, query);

  const requestHeaders = new Headers(headers);
  if (!requestHeaders.has('accept')) requestHeaders.set('accept', 'application/json');
  if (token) requestHeaders.set('authorization', `Bearer ${token}`);
  if (body !== undefined && !requestHeaders.has('content-type')) {
    requestHeaders.set('content-type', 'application/json');
  }

  const response = await fetch(url, {
    method: method.toUpperCase(),
    headers: requestHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  });
  const raw = await response.text();
  const responseHeaders = Object.fromEntries(response.headers.entries());
  let data = null;
  const contentType = response.headers.get('content-type') || '';
  if (/application\/(?:[^;]+\+)?json/i.test(contentType)) {
    try {
      data = JSON.parse(raw);
    } catch {
      data = null;
    }
  }

  return { status: response.status, headers: responseHeaders, data, raw };
}

module.exports = { request };
