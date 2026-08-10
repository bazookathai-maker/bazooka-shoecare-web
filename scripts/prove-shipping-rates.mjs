/**
 * Phase 2.2E proof: raw Store API shipping before/after update-customer.
 * Does not use mapCart / extractShippingPackages / React.
 *
 * Usage: node scripts/prove-shipping-rates.mjs
 */
const BASE = 'https://bazookashoecare.com/wp-json/wc/store/v1';

function header(res, name) {
  return res.headers.get(name) || res.headers.get(name.toLowerCase()) || '';
}

function tokenFingerprint(token) {
  if (!token) return '(none)';
  try {
    const payload = token.split('.')[1];
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      '=',
    );
    const json = JSON.parse(Buffer.from(padded, 'base64').toString('utf8'));
    return {
      masked: `${token.slice(0, 10)}…${token.slice(-6)}`,
      iat: json.iat ?? null,
      exp: json.exp ?? null,
      user_id: json.user_id ?? null,
    };
  } catch {
    return { masked: `${token.slice(0, 10)}…`, iat: null };
  }
}

function shippingEvidence(cart) {
  return {
    shipping_rates: cart?.shipping_rates ?? null,
    shipping_address: cart?.shipping_address ?? null,
    billing_address: cart?.billing_address ?? null,
    needs_shipping: cart?.needs_shipping ?? null,
    has_calculated_shipping: cart?.has_calculated_shipping ?? null,
    items_weight: cart?.items_weight ?? null,
    errors: cart?.errors ?? null,
    items_count: cart?.items_count ?? null,
    totals_shipping: cart?.totals?.total_shipping ?? null,
  };
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

  const url =
    path === '' || path === '/'
      ? `${BASE}/cart?_=${Date.now()}`
      : `${BASE}/cart${path}`;

  const res = await fetch(url, {
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
    data = { parse_error: true, raw: text.slice(0, 500) };
  }

  return {
    ok: res.ok,
    status: res.status,
    data,
    requestToken: token || '',
    responseToken: nextToken,
    nonce: nextNonce,
    tokenMatchedRequest:
      Boolean(token) && Boolean(nextToken) ? token === nextToken : null,
  };
}

async function main() {
  let token = '';
  let nonce = '';

  // Resolve a real product
  const productsRes = await fetch(`${BASE}/products?per_page=1`, {
    cache: 'no-store',
  });
  const products = await productsRes.json();
  const productId = Number(products?.[0]?.id);
  if (!Number.isFinite(productId)) {
    throw new Error('No Woo product id');
  }

  // Session + add item
  let get1 = await request('');
  token = get1.responseToken;
  nonce = get1.nonce;

  let add = await request('/add-item', {
    method: 'POST',
    body: { id: productId, quantity: 1 },
    token,
    nonce,
  });
  token = add.responseToken || token;
  nonce = add.nonce || nonce;

  // GET cart BEFORE update-customer (same token)
  const tokenBeforeGet = token;
  const beforeGet = await request('', { token, nonce });
  token = beforeGet.responseToken || token;
  nonce = beforeGet.nonce || nonce;

  const payload = {
    billing_address: {
      first_name: 'Proof',
      last_name: 'Shipping',
      address_1: '123 Test Road',
      address_2: '',
      city: 'Chatuchak',
      state: 'TH-10',
      postcode: '10900',
      country: 'TH',
      email: 'proof-shipping@example.com',
      phone: '0812345678',
    },
    shipping_address: {
      first_name: 'Proof',
      last_name: 'Shipping',
      address_1: '123 Test Road',
      address_2: '',
      city: 'Chatuchak',
      state: 'TH-10',
      postcode: '10900',
      country: 'TH',
    },
  };

  const tokenBeforeUpdate = token;
  const update = await request('/update-customer', {
    method: 'POST',
    body: payload,
    token,
    nonce,
  });
  token = update.responseToken || token;
  nonce = update.nonce || nonce;

  const tokenBeforeAfterGet = token;
  const afterGet = await request('', { token, nonce });
  token = afterGet.responseToken || token;

  const report = {
    product_id: productId,
    payload,
    cart_tokens: {
      after_add_item: tokenFingerprint(tokenBeforeGet),
      get_before_update: {
        request: tokenFingerprint(tokenBeforeGet),
        response: tokenFingerprint(beforeGet.responseToken),
        request_equals_response: beforeGet.requestToken === beforeGet.responseToken,
      },
      post_update_customer: {
        request: tokenFingerprint(tokenBeforeUpdate),
        response: tokenFingerprint(update.responseToken),
        request_equals_response: update.requestToken === update.responseToken,
        same_as_get_before: tokenBeforeUpdate === tokenBeforeGet,
      },
      get_after_update: {
        request: tokenFingerprint(tokenBeforeAfterGet),
        response: tokenFingerprint(afterGet.responseToken),
        request_equals_response: afterGet.requestToken === afterGet.responseToken,
        same_as_update_request: tokenBeforeAfterGet === tokenBeforeUpdate,
      },
      all_three_same_session:
        tokenBeforeGet === tokenBeforeUpdate &&
        tokenBeforeUpdate === tokenBeforeAfterGet,
    },
    raw_before_update: {
      status: beforeGet.status,
      evidence: shippingEvidence(beforeGet.data),
    },
    raw_after_update_customer: {
      status: update.status,
      evidence: shippingEvidence(update.data),
    },
    raw_get_after_update: {
      status: afterGet.status,
      evidence: shippingEvidence(afterGet.data),
    },
  };

  console.log(JSON.stringify(report, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
