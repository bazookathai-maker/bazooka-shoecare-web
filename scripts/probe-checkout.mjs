/**
 * Probe payment methods and attempt a test checkout (bacs/cod only).
 * Usage: node scripts/probe-checkout.mjs
 */
const BASE = 'https://bazookashoecare.com/wp-json/wc/store/v1';

function header(res, name) {
  return res.headers.get(name) || res.headers.get(name.toLowerCase()) || '';
}

async function request(path, { method = 'GET', body, token, nonce } = {}) {
  const headers = {
    Accept: 'application/json',
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
  };
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
    data = { parse_error: true, raw: text.slice(0, 400) };
  }

  return {
    status: res.status,
    ok: res.ok,
    data,
    token: header(res, 'Cart-Token') || token || '',
    nonce: header(res, 'Nonce') || nonce || '',
  };
}

function maskAddress(addr = {}) {
  return {
    first_name: addr.first_name ? '[set]' : '',
    last_name: addr.last_name ? '[set]' : '',
    address_1: addr.address_1 ? '[set]' : '',
    city: addr.city || '',
    state: addr.state || '',
    postcode: addr.postcode || '',
    country: addr.country || '',
    email: addr.email ? '[set]' : undefined,
    phone: addr.phone ? '[set]' : undefined,
  };
}

async function main() {
  let token = '';
  let nonce = '';

  let r = await request('/cart');
  token = r.token;
  nonce = r.nonce;
  console.log('GET /cart', r.status, 'methods=', r.data?.payment_methods);

  // products
  const prod = await request('/products?per_page=5');
  console.log('GET /products', prod.status, Array.isArray(prod.data) ? prod.data.length : prod.data);
  const productId = Array.isArray(prod.data)
    ? Number(prod.data.find((p) => p?.is_in_stock !== false)?.id || prod.data[0]?.id)
    : NaN;
  if (!Number.isFinite(productId)) throw new Error('No product id');

  r = await request('/cart/add-item', {
    method: 'POST',
    body: { id: productId, quantity: 1 },
    token,
    nonce,
  });
  token = r.token || token;
  nonce = r.nonce || nonce;
  console.log('POST /add-item', r.status, 'count=', r.data?.items_count);
  console.log('cart.payment_methods=', JSON.stringify(r.data?.payment_methods));
  console.log('cart.needs_payment=', r.data?.needs_payment);
  console.log('cart.totals=', r.data?.totals);

  const customer = {
    billing_address: {
      first_name: 'Test',
      last_name: 'Order',
      address_1: '123 Test Road',
      address_2: '',
      city: 'Chatuchak',
      state: 'TH-10',
      postcode: '10900',
      country: 'TH',
      email: 'test-order@example.com',
      phone: '0812345678',
    },
    shipping_address: {
      first_name: 'Test',
      last_name: 'Order',
      address_1: '123 Test Road',
      address_2: '',
      city: 'Chatuchak',
      state: 'TH-10',
      postcode: '10900',
      country: 'TH',
      phone: '0812345678',
    },
  };

  r = await request('/cart/update-customer', {
    method: 'POST',
    body: customer,
    token,
    nonce,
  });
  token = r.token || token;
  nonce = r.nonce || nonce;
  console.log('POST /update-customer', r.status);
  console.log('after update payment_methods=', JSON.stringify(r.data?.payment_methods));
  console.log(
    'shipping inner rates count=',
    r.data?.shipping_rates?.[0]?.shipping_rates?.length,
  );
  const rate = r.data?.shipping_rates?.[0]?.shipping_rates?.[0];
  if (rate?.rate_id != null) {
    r = await request('/cart/select-shipping-rate', {
      method: 'POST',
      body: { package_id: 0, rate_id: rate.rate_id },
      token,
      nonce,
    });
    token = r.token || token;
    nonce = r.nonce || nonce;
    console.log('POST /select-shipping-rate', r.status, rate.rate_id);
  }

  const checkoutGet = await request('/checkout', { token, nonce });
  console.log('GET /checkout', checkoutGet.status);
  console.log(
    'checkout.payment_methods=',
    JSON.stringify(checkoutGet.data?.payment_methods),
  );
  if (checkoutGet.data && typeof checkoutGet.data === 'object') {
    console.log('checkout keys=', Object.keys(checkoutGet.data));
  }

  const methods = [
    ...(Array.isArray(r.data?.payment_methods) ? r.data.payment_methods : []),
    ...(Array.isArray(checkoutGet.data?.payment_methods)
      ? checkoutGet.data.payment_methods
      : []),
  ];
  const unique = [...new Set(methods)];
  console.log('ALL_METHODS', unique);

  const preferred = ['bacs', 'cod'].find((id) => unique.includes(id));
  console.log('PREFERRED_TEST_METHOD', preferred || '(none of bacs/cod)');

  // Dry-run: only attempt checkout if preferred exists (user asked to detect first)
  if (preferred) {
    const total = r.data?.totals?.total_price;
    const minor = Number(r.data?.totals?.currency_minor_unit ?? 2);
    const expected =
      total != null ? (Number(total) / 10 ** minor).toFixed(minor) : undefined;

    const payload = {
      ...customer,
      customer_note: 'Phase 3.1 test order — please ignore',
      payment_method: preferred,
      payment_data: [],
    };
    // Store API often wants expected total in payment_data or as extensions
    // Check docs: some versions use "extensions" ; WC Blocks uses optional fields

    console.log('checkout payload (masked)=', {
      billing_address: maskAddress(payload.billing_address),
      shipping_address: maskAddress(payload.shipping_address),
      customer_note: payload.customer_note,
      payment_method: payload.payment_method,
      payment_data: payload.payment_data,
      cart_total_raw: total,
      expected_major: expected,
    });

    // Don't auto-create order in probe unless ALLOW_ORDER=1
    if (process.env.ALLOW_ORDER === '1') {
      const out = await request('/checkout', {
        method: 'POST',
        body: payload,
        token,
        nonce,
      });
      console.log('POST /checkout', out.status);
      console.log(
        'order fields',
        out.data && {
          order_id: out.data.order_id,
          order_number: out.data.order_number,
          order_key: out.data.order_key ? '[set]' : null,
          status: out.data.status,
          payment_result: out.data.payment_result,
          message: out.data.message,
          code: out.data.code,
        },
      );
      if (!out.ok) console.log('error body', out.data);
    } else {
      console.log('Skip POST /checkout (set ALLOW_ORDER=1 to place test order)');
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
