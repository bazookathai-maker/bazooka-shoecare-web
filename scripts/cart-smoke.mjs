/**
 * Local cart smoke test against Vite proxy (no checkout).
 * Usage: node scripts/cart-smoke.mjs
 */
const BASE = 'http://localhost:5173/api/cart';

function header(res, name) {
  return res.headers.get(name) || res.headers.get(name.toLowerCase()) || '';
}

async function request(path, { method = 'GET', body, token, nonce } = {}) {
  const headers = { Accept: 'application/json' };
  if (body) headers['Content-Type'] = 'application/json';
  if (token) headers['Cart-Token'] = token;
  if (nonce) headers.Nonce = nonce;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  const nextToken = header(res, 'Cart-Token') || token || '';
  const nextNonce = header(res, 'Nonce') || nonce || '';
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }

  return { ok: res.ok, status: res.status, data, token: nextToken, nonce: nextNonce };
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const results = [];

function check(name, cond, detail = '') {
  results.push({ name, pass: Boolean(cond), detail });
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
}

async function main() {
  let token = '';
  let nonce = '';

  // 1) GET empty/session cart
  let res = await request('');
  token = res.token;
  nonce = res.nonce;
  check('GET /cart', res.ok && Boolean(token), `status=${res.status} token=${Boolean(token)}`);

  // 2) Resolve a real product id
  const prodRes = await fetch('http://localhost:5173/api/products?per_page=1', {
    cache: 'no-store',
  });
  const products = await prodRes.json();
  const productId = Number(products?.[0]?.id);
  check('Load Woo product id', Number.isFinite(productId), `id=${productId}`);

  // 3) Add
  res = await request('/add-item', {
    method: 'POST',
    body: { id: productId, quantity: 1 },
    token,
    nonce,
  });
  token = res.token || token;
  nonce = res.nonce || nonce;
  const key = res.data?.items?.[0]?.key;
  check(
    'POST /add-item',
    res.ok && res.data?.items_count >= 1 && Boolean(key),
    `status=${res.status} count=${res.data?.items_count}`,
  );

  // 4) Qty +
  res = await request('/update-item', {
    method: 'POST',
    body: { key, quantity: 2 },
    token,
    nonce,
  });
  token = res.token || token;
  nonce = res.nonce || nonce;
  check(
    'POST /update-item (+)',
    res.ok && res.data?.items?.[0]?.quantity === 2,
    `qty=${res.data?.items?.[0]?.quantity} total=${res.data?.totals?.total_price}`,
  );

  // 5) Persist with token
  res = await request('', { token, nonce });
  token = res.token || token;
  nonce = res.nonce || nonce;
  check(
    'Persistence GET with Cart-Token',
    res.ok && res.data?.items_count >= 2,
    `count=${res.data?.items_count}`,
  );

  // 6) Remove
  res = await request('/remove-item', {
    method: 'POST',
    body: { key },
    token,
    nonce,
  });
  check(
    'POST /remove-item',
    res.ok && (res.data?.items_count === 0 || res.data?.items?.length === 0),
    `count=${res.data?.items_count}`,
  );

  const failed = results.filter((r) => !r.pass);
  console.log('\n---');
  console.log(`Passed ${results.length - failed.length}/${results.length}`);
  if (failed.length) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error('Smoke test crashed:', err.message);
  process.exitCode = 1;
});
