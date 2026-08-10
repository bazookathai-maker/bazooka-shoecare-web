/**
 * Local Add-to-Cart → Cart → Checkout API checks (no secrets printed).
 */
const BASE = process.env.TEST_BASE || 'http://localhost:5173';

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function req(path, { method = 'GET', body, token, nonce } = {}) {
  const headers = {
    Accept: 'application/json',
    'Cache-Control': 'no-cache',
  };
  if (body != null) headers['Content-Type'] = 'application/json';
  if (token) headers['Cart-Token'] = token;
  if (nonce) headers.Nonce = nonce;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  const nextToken = res.headers.get('Cart-Token') || res.headers.get('cart-token') || token || '';
  const nextNonce = res.headers.get('Nonce') || res.headers.get('nonce') || nonce || '';

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  return { res, data, token: nextToken, nonce: nextNonce };
}

async function main() {
  const results = [];

  // Products still works
  {
    const { res, data } = await req('/api/products');
    assert(res.ok, `products ${res.status}`);
    assert(Array.isArray(data?.products) && data.products.length > 0, 'no products');
    results.push({ check: '/api/products', pass: true, count: data.products.length });
    globalThis.__pid = data.products[0].id;
  }

  // GET cart
  let session = { token: '', nonce: '' };
  {
    const { res, data, token, nonce } = await req('/api/cart');
    assert(res.ok, `GET cart ${res.status} ${JSON.stringify(data)}`);
    assert(data && typeof data === 'object', 'cart body missing');
    session = { token, nonce };
    assert(Boolean(token), 'Cart-Token missing from response');
    results.push({
      check: 'GET /api/cart',
      pass: true,
      items: Array.isArray(data.items) ? data.items.length : -1,
      hasToken: Boolean(token),
    });
  }

  // Add item
  {
    const { res, data, token, nonce } = await req('/api/cart/add-item', {
      method: 'POST',
      body: { id: Number(globalThis.__pid), quantity: 1 },
      token: session.token,
      nonce: session.nonce,
    });
    assert(res.ok, `add-item ${res.status} ${JSON.stringify(data)?.slice?.(0, 200) || data}`);
    const count = Number(data?.items_count) || (data?.items?.length ?? 0);
    assert(count >= 1, 'cart empty after add');
    session = { token: token || session.token, nonce: nonce || session.nonce };
    results.push({
      check: 'POST /api/cart/add-item',
      pass: true,
      items_count: count,
      lineKey: data?.items?.[0]?.key ? '[set]' : null,
    });
    globalThis.__key = data?.items?.[0]?.key;
  }

  // GET cart again (session)
  {
    const { res, data } = await req('/api/cart', {
      token: session.token,
      nonce: session.nonce,
    });
    assert(res.ok, `GET cart again ${res.status}`);
    assert((data?.items?.length || 0) >= 1, 'session lost items');
    results.push({ check: 'GET /api/cart session', pass: true, items: data.items.length });
  }

  // update-customer (checkout prep)
  {
    const { res, data, token, nonce } = await req('/api/cart/update-customer', {
      method: 'POST',
      token: session.token,
      nonce: session.nonce,
      body: {
        billing_address: {
          first_name: 'Test',
          last_name: 'User',
          company: '',
          address_1: '1 Test Rd',
          address_2: '',
          city: 'Bangkok',
          state: 'TH-10',
          postcode: '10110',
          country: 'TH',
          email: 'test@example.com',
          phone: '0812345678',
        },
        shipping_address: {
          first_name: 'Test',
          last_name: 'User',
          company: '',
          address_1: '1 Test Rd',
          address_2: '',
          city: 'Bangkok',
          state: 'TH-10',
          postcode: '10110',
          country: 'TH',
          phone: '0812345678',
        },
      },
    });
    assert(res.ok, `update-customer ${res.status} ${JSON.stringify(data)?.slice?.(0, 240)}`);
    session = { token: token || session.token, nonce: nonce || session.nonce };
    results.push({
      check: 'POST /api/cart/update-customer',
      pass: true,
      shipping_state: data?.shipping_address?.state || null,
    });
  }

  // create-order still reachable (may 500 without local KEY/SECRET)
  {
    const { res, data } = await req('/api/create-order', {
      method: 'POST',
      body: {
        paymentMethod: 'bacs',
        billing: {
          first_name: 'Test',
          last_name: 'User',
          address_1: '1 Test Rd',
          city: 'Bangkok',
          state: 'TH-10',
          postcode: '10110',
          country: 'TH',
          email: 'test@example.com',
          phone: '0812345678',
        },
        shipping: {
          first_name: 'Test',
          last_name: 'User',
          address_1: '1 Test Rd',
          city: 'Bangkok',
          state: 'TH-10',
          postcode: '10110',
          country: 'TH',
          phone: '0812345678',
        },
        line_items: [{ product_id: globalThis.__pid, quantity: 1 }],
        shippingTotal: 0,
      },
    });
    assert(res.status !== 404, 'create-order missing');
    results.push({
      check: '/api/create-order reachable',
      pass: true,
      status: res.status,
      created: Boolean(data?.order?.order_id),
      messagePreview: String(data?.message || '').slice(0, 80),
    });
  }

  // Client module: cart uses /api, no secrets
  {
    const mod = await (await fetch(`${BASE}/src/api/woocommerce.js`)).text();
    assert(mod.includes("return '/api'") || mod.includes('return "/api"'), 'store root not /api');
    assert(!/wp-json\/wc\/store\/v1/.test(mod) || mod.includes('VITE_WC_STORE_API_URL'), 'hardcoded prod wp-json may remain in comments only');
    assert(!mod.includes('WOOCOMMERCE_CONSUMER_KEY'), 'KEY leaked');
    assert(!mod.includes('WOOCOMMERCE_CONSUMER_SECRET'), 'SECRET leaked');
    assert(mod.includes('/api/products'), 'products api path missing');
    assert(mod.includes('/api/create-order'), 'create-order path missing');
    // Ensure resolveStoreApiRoot no longer points at window.location.origin/wp-json
    assert(!mod.includes('window.location.origin}/wp-json'), 'still using origin/wp-json');
    results.push({ check: 'client cart root /api + no secrets', pass: true });
  }

  console.log(JSON.stringify({ ok: true, results }, null, 2));
}

main().catch((err) => {
  console.error(JSON.stringify({ ok: false, error: String(err?.message || err) }, null, 2));
  process.exit(1);
});
