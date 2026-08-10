/**
 * Read-only-ish: detect payment_methods from cart (no checkout POST).
 * Uses Vite proxy by default.
 */
const BASE = process.env.PROBE_BASE || 'http://localhost:5173/api';

function header(res, name) {
  return res.headers.get(name) || res.headers.get(name.toLowerCase()) || '';
}

async function request(path, { method = 'GET', body, token, nonce } = {}) {
  const headers = { Accept: 'application/json', 'Cache-Control': 'no-cache' };
  if (body) headers['Content-Type'] = 'application/json';
  if (token) headers['Cart-Token'] = token;
  if (nonce) headers.Nonce = nonce;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text.slice(0, 300) };
  }
  return {
    status: res.status,
    data,
    token: header(res, 'Cart-Token') || token || '',
    nonce: header(res, 'Nonce') || nonce || '',
  };
}

const r0 = await request('/cart');
let token = r0.token;
let nonce = r0.nonce;
console.log('GET /cart', r0.status, 'payment_methods=', r0.data?.payment_methods);

const prod = await request('/products?per_page=1');
const productId = Number(prod.data?.[0]?.id);
console.log('product', prod.status, productId);

const add = await request('/cart/add-item', {
  method: 'POST',
  body: { id: productId, quantity: 1 },
  token,
  nonce,
});
token = add.token || token;
nonce = add.nonce || nonce;
console.log('POST /add-item', add.status);
console.log('payment_methods=', JSON.stringify(add.data?.payment_methods));
console.log('needs_payment=', add.data?.needs_payment);

const getCheckout = await request('/checkout', { token, nonce });
console.log('GET /checkout', getCheckout.status);
console.log(
  'checkout.payment_methods=',
  JSON.stringify(getCheckout.data?.payment_methods),
);
