/**
 * Prove who returns 403 — headers only, no mutations.
 * Usage: node scripts/prove-403-source.mjs
 */
const URLS = [
  'https://bazookashoecare.com/wp-json',
  'https://bazookashoecare.com/wp-json/wc/store/v1',
  'https://bazookashoecare.com/wp-json/wc/store/v1/cart',
  'https://bazookashoecare.com/wp-json/wc/store/v1/checkout',
  'https://www.bazookashoecare.com/wp-json',
  'https://www.bazookashoecare.com/wp-json/wc/store/v1/cart',
];

const INTERESTING = [
  'server',
  'x-powered-by',
  'cf-ray',
  'cf-cache-status',
  'cf-mitigated',
  'x-vercel-id',
  'x-vercel-cache',
  'x-vercel-error',
  'x-matched-path',
  'x-wp-total',
  'x-wp-totalpages',
  'x-robots-tag',
  'link',
  'allow',
  'content-type',
  'content-security-policy',
  'strict-transport-security',
  'x-frame-options',
  'x-content-type-options',
  'access-control-allow-origin',
  'access-control-expose-headers',
  'cart-token',
  'nonce',
  'x-wc-store-api-nonce',
  'via',
  'x-cache',
  'x-proxy-cache',
  'x-sucuri-id',
  'x-sucuri-cache',
  'x-hostinger',
  'x-litespeed-cache',
  'x-ddos-protection',
  'x-forbidden-reason',
  'www-authenticate',
  'retry-after',
  'location',
  'age',
  'cache-control',
  'date',
];

function pickHeaders(headers) {
  const all = {};
  for (const [k, v] of headers.entries()) {
    all[k.toLowerCase()] = v;
  }
  const interesting = {};
  for (const key of INTERESTING) {
    if (all[key] != null) interesting[key] = all[key];
  }
  // Also keep any header that looks like vercel/cf/wp/security
  for (const [k, v] of Object.entries(all)) {
    if (
      /vercel|cf-|cloudflare|wordpress|wp-|woo|sucuri|wordfence|imunify|hostinger|litespeed|security|forbidden|bot|firewall/i.test(
        k,
      )
    ) {
      interesting[k] = v;
    }
  }
  return { interesting, all };
}

async function probe(url) {
  const res = await fetch(url, {
    method: 'GET',
    redirect: 'manual',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    },
    cache: 'no-store',
  });

  const { interesting, all } = pickHeaders(res.headers);
  const text = await res.text();
  const bodyPreview = text.slice(0, 800);

  let bodyJson = null;
  try {
    bodyJson = JSON.parse(text);
  } catch {
    // keep preview only
  }

  return {
    url,
    finalUrlHint: res.url,
    status: res.status,
    statusText: res.statusText,
    redirected: res.redirected,
    type: res.type,
    headers_interesting: interesting,
    headers_all_keys: Object.keys(all).sort(),
    headers_all: all,
    body_preview: bodyPreview,
    body_json: bodyJson,
    body_looks_like: bodyJson
      ? 'json'
      : /vercel security checkpoint/i.test(text)
        ? 'vercel_security_html'
        : /<!DOCTYPE html/i.test(text)
          ? 'html'
          : 'text',
  };
}

const report = [];
for (const url of URLS) {
  try {
    report.push(await probe(url));
  } catch (err) {
    report.push({
      url,
      fetch_error: String(err && err.message ? err.message : err),
    });
  }
}

console.log(JSON.stringify(report, null, 2));
