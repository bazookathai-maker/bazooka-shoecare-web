/**
 * Local integration checks for products + create-order APIs.
 * Does not print secrets.
 */
const BASE = process.env.TEST_BASE || 'http://localhost:5173';

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function getJson(path, init) {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.headers || {}),
    },
  });
  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  return { res, body };
}

async function main() {
  const results = [];

  // 1) /api/products list
  {
    const { res, body } = await getJson('/api/products');
    assert(res.ok, `/api/products status ${res.status} ${JSON.stringify(body)}`);
    assert(Array.isArray(body?.products), 'products array missing');
    assert(body.products.length > 0, 'products empty');
    const sample = body.products[0];
    assert(sample?.id, 'product id missing');
    assert(sample?.name, 'product name missing');
    assert(sample?.prices || sample?.price != null, 'product price missing');
    results.push({
      check: '/api/products list',
      pass: true,
      count: body.products.length,
      firstId: sample.id,
    });
    globalThis.__products = body.products;
  }

  // 2) /api/products?id=
  {
    const id = String(globalThis.__products[0].id);
    const { res, body } = await getJson(`/api/products?id=${id}`);
    assert(res.ok, `/api/products?id status ${res.status}`);
    assert(body?.product?.id == id || body?.product?.id == Number(id), 'detail id mismatch');
    assert(body.product.name, 'detail name missing');
    results.push({
      check: '/api/products?id',
      pass: true,
      id: body.product.id,
      nameLen: String(body.product.name).length,
    });
  }

  // 3) SPA /products HTML loads
  {
    const res = await fetch(`${BASE}/products`);
    assert(res.ok, `/products page status ${res.status}`);
    const html = await res.text();
    assert(/<div id="root"|root/i.test(html), 'SPA root missing');
    results.push({ check: 'GET /products HTML', pass: true });
  }

  // 4) Client bundle must not contain secrets
  {
    const html = await (await fetch(`${BASE}/`)).text();
    const scriptMatch = html.match(/\/assets\/index-[^"]+\.js/);
    // In DEV, modules are separate — scan the products API client module
    const modRes = await fetch(`${BASE}/src/api/woocommerce.js`);
    assert(modRes.ok, 'cannot fetch woocommerce.js module');
    const mod = await modRes.text();
    assert(!/WOOCOMMERCE_CONSUMER_KEY/.test(mod), 'KEY name leaked in client module');
    assert(!/WOOCOMMERCE_CONSUMER_SECRET/.test(mod), 'SECRET name leaked in client module');
    assert(!/\bck_[a-zA-Z0-9]+/.test(mod), 'ck_ token leaked');
    assert(!/\bcs_[a-zA-Z0-9]+/.test(mod), 'cs_ token leaked');
    assert(mod.includes('/api/products'), 'client should call /api/products');
    assert(mod.includes('/api/create-order'), 'client should call /api/create-order');
    results.push({
      check: 'client module secret scan',
      pass: true,
      scriptHint: scriptMatch?.[0] || 'dev-modules',
    });
  }

  // 5) create-order still reachable
  {
    const { res, body } = await getJson('/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
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
        line_items: [{ product_id: globalThis.__products[0].id, quantity: 1 }],
        shippingTotal: 0,
      }),
    });
    // Without real consumer keys locally, expect config/auth error — but route must exist.
    assert(res.status !== 404, 'create-order route missing (404)');
    assert(res.status !== 405, 'create-order method not allowed');
    const msg = String(body?.message || '');
    results.push({
      check: '/api/create-order reachable',
      pass: true,
      status: res.status,
      messagePreview: msg.slice(0, 80),
      created: Boolean(body?.order?.order_id),
    });
  }

  // 6) Compare count with public Store API (source of truth for catalog size)
  {
    const storeRes = await fetch(
      'https://bazookashoecare.com/wp-json/wc/store/v1/products?per_page=100',
    );
    const storeProducts = await storeRes.json();
    const apiCount = globalThis.__products.length;
    const storeCount = Array.isArray(storeProducts) ? storeProducts.length : -1;
    assert(apiCount === storeCount, `count mismatch api=${apiCount} store=${storeCount}`);
    results.push({
      check: 'product count matches Woo Store API',
      pass: true,
      count: apiCount,
    });
  }

  console.log(JSON.stringify({ ok: true, results }, null, 2));
}

main().catch((err) => {
  console.error(JSON.stringify({ ok: false, error: String(err?.message || err) }, null, 2));
  process.exit(1);
});
