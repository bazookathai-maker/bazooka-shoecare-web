/**
 * Server-only WooCommerce Store API cart proxy.
 * Forwards Cart-Token / Nonce session headers — no consumer secrets required.
 * Uses WOOCOMMERCE_URL (or default WordPress host) so the browser never hits
 * Vercel /wp-json (403 / Failed to fetch).
 */

const SENSITIVE_PLACEHOLDER = /^\[SENSITIVE]$/i;
const DEFAULT_WOO_HOST = 'https://bazookashoecare.com';

const ALLOWED_CART_SUBPATHS = new Set([
  '',
  '/add-item',
  '/update-item',
  '/remove-item',
  '/remove-items',
  '/update-customer',
  '/select-shipping-rate',
  '/extensions',
]);

function trimSlash(url) {
  return String(url || '').replace(/\/$/, '');
}

function cleanEnvValue(value) {
  const raw = String(value || '').trim();
  if (!raw || SENSITIVE_PLACEHOLDER.test(raw)) return '';
  return raw;
}

export function resolveWooStoreBaseUrl(wooUrl) {
  const raw = trimSlash(wooUrl);
  if (!raw) return '';
  if (/\/wp-json\/wc\/store\/v1$/i.test(raw)) return raw;
  if (/\/wp-json$/i.test(raw)) return `${raw}/wc/store/v1`;
  return `${raw}/wp-json/wc/store/v1`;
}

function resolveWooHost() {
  const url = cleanEnvValue(process.env.WOOCOMMERCE_URL);
  if (/^https?:\/\//i.test(url)) return url;
  return DEFAULT_WOO_HOST;
}

function normalizeCartSubPath(subPath) {
  const raw = String(subPath || '').split('?')[0].trim();
  if (!raw || raw === '/') return '';
  const withSlash = raw.startsWith('/') ? raw : `/${raw}`;
  return withSlash.replace(/\/+$/, '') || '';
}

function getHeader(req, name) {
  const headers = req.headers || {};
  const direct = headers[name] || headers[name.toLowerCase()];
  if (Array.isArray(direct)) return direct[0] || '';
  if (direct) return String(direct);
  return '';
}

async function readRawBody(req) {
  if (req.body != null) {
    if (Buffer.isBuffer(req.body)) return req.body;
    if (typeof req.body === 'string') return Buffer.from(req.body, 'utf8');
    if (typeof req.body === 'object') {
      return Buffer.from(JSON.stringify(req.body), 'utf8');
    }
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

function setCorsAndCache(res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader(
    'Access-Control-Expose-Headers',
    'Cart-Token, Nonce, X-WC-Store-API-Nonce, Authorization',
  );
}

/**
 * Proxy a Store API cart request to WordPress.
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 * @param {string} subPath e.g. '' | '/add-item'
 */
export async function proxyWooStoreCart(req, res, subPath = '') {
  setCorsAndCache(res);

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  const normalized = normalizeCartSubPath(subPath);
  if (!ALLOWED_CART_SUBPATHS.has(normalized)) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ message: 'ไม่พบเส้นทางตะกร้า' }));
    return;
  }

  const storeBase = resolveWooStoreBaseUrl(resolveWooHost());
  const incomingUrl = new URL(req.url || '/', 'http://localhost');
  // Drop internal routing query keys; keep cache-bust `_` etc. for GET cart.
  incomingUrl.searchParams.delete('path');
  incomingUrl.searchParams.delete('resource');
  const search = incomingUrl.search || '';
  const target = `${storeBase}/cart${normalized}${search}`;

  const headers = {
    Accept: 'application/json',
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
  };

  const cartToken =
    getHeader(req, 'cart-token') || getHeader(req, 'Cart-Token');
  if (cartToken) headers['Cart-Token'] = cartToken;

  const nonce =
    getHeader(req, 'nonce') ||
    getHeader(req, 'Nonce') ||
    getHeader(req, 'x-wc-store-api-nonce');
  if (nonce) {
    headers.Nonce = nonce;
    headers['X-WC-Store-API-Nonce'] = nonce;
  }

  const method = String(req.method || 'GET').toUpperCase();
  const init = { method, headers, cache: 'no-store' };

  if (method !== 'GET' && method !== 'HEAD') {
    const body = await readRawBody(req);
    if (body.length) {
      init.body = body;
      if (!getHeader(req, 'content-type')) {
        headers['Content-Type'] = 'application/json';
      } else {
        headers['Content-Type'] = getHeader(req, 'content-type');
      }
    }
  }

  let upstream;
  try {
    upstream = await fetch(target, init);
  } catch (err) {
    res.statusCode = 502;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(
      JSON.stringify({
        message:
          err instanceof Error
            ? err.message
            : 'เชื่อมต่อ WooCommerce Store API ไม่สำเร็จ',
      }),
    );
    return;
  }

  const outToken =
    upstream.headers.get('Cart-Token') || upstream.headers.get('cart-token');
  if (outToken) res.setHeader('Cart-Token', outToken);

  const outNonce =
    upstream.headers.get('Nonce') ||
    upstream.headers.get('nonce') ||
    upstream.headers.get('X-WC-Store-API-Nonce');
  if (outNonce) {
    res.setHeader('Nonce', outNonce);
    res.setHeader('X-WC-Store-API-Nonce', outNonce);
  }

  const contentType = upstream.headers.get('content-type') || '';
  if (contentType) res.setHeader('Content-Type', contentType);
  else res.setHeader('Content-Type', 'application/json; charset=utf-8');

  res.statusCode = upstream.status;
  const buf = Buffer.from(await upstream.arrayBuffer());
  res.end(buf);
}
