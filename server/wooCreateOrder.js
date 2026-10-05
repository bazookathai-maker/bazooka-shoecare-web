/**
 * Shared WooCommerce REST order creation (server-only).
 * Reads WOOCOMMERCE_URL, WOOCOMMERCE_CONSUMER_KEY, WOOCOMMERCE_CONSUMER_SECRET.
 * Never import this module from browser/client code.
 */

const ALLOWED_PAYMENT_METHODS = new Set(['stripe_promptpay']);
const BLOCKED_PAYMENT_METHODS = new Set([
  'bacs',
  'cod',
  'xendit_gateway',
  'omise_promptpay',
  'omise',
  'omise_mobilebanking',
  'omise_truemoney',
  'omise_rabbit_linepay',
  'omise_googlepay',
  'omise_shopeepay',
  'omise_wechat_pay',
]);

const PAYMENT_TITLES = {
  stripe_promptpay: 'พร้อมเพย์ (Stripe)',
};

export const OMISE_CHARGE_META_KEY = '_omise_charge_id';
export const OMISE_PAID_META_KEY = '_omise_paid';
export const STRIPE_PAID_META_KEY = '_stripe_paid';

function trimSlash(url) {
  return String(url || '').replace(/\/$/, '');
}

/**
 * Normalize host/base into .../wp-json/wc/v3
 * Accepts: https://host | https://host/wp-json | https://host/wp-json/wc/v3
 */
export function resolveWooRestOrdersUrl(wooUrl) {
  const raw = trimSlash(wooUrl);
  if (!raw) return '';
  if (/\/wp-json\/wc\/v3$/i.test(raw)) return `${raw}/orders`;
  if (/\/wp-json$/i.test(raw)) return `${raw}/wc/v3/orders`;
  return `${raw}/wp-json/wc/v3/orders`;
}

const SENSITIVE_PLACEHOLDER = /^\[SENSITIVE]$/i;

function cleanEnvValue(value) {
  const raw = String(value || '').trim();
  if (!raw || SENSITIVE_PLACEHOLDER.test(raw)) return '';
  return raw;
}

function getServerCredentials() {
  const url = cleanEnvValue(process.env.WOOCOMMERCE_URL);
  const key = cleanEnvValue(process.env.WOOCOMMERCE_CONSUMER_KEY);
  const secret = cleanEnvValue(process.env.WOOCOMMERCE_CONSUMER_SECRET);
  return { url, key, secret };
}

export function isWooServerConfigured() {
  const { url, key, secret } = getServerCredentials();
  return Boolean(url && key && secret);
}

function toAddress(address, { includeEmail = false } = {}) {
  const src = address && typeof address === 'object' ? address : {};
  const out = {
    first_name: String(src.first_name || '').trim(),
    last_name: String(src.last_name || '').trim(),
    company: String(src.company || '').trim(),
    address_1: String(src.address_1 || '').trim(),
    address_2: String(src.address_2 || '').trim(),
    city: String(src.city || '').trim(),
    state: String(src.state || '').trim(),
    postcode: String(src.postcode || '').trim(),
    country: String(src.country || 'TH').trim() || 'TH',
    phone: String(src.phone || '').trim(),
  };
  if (includeEmail) {
    out.email = String(src.email || '').trim();
  }
  return out;
}

function buildOrderPayload(input) {
  const paymentMethod = String(
    input.paymentMethod || input.payment_method || 'stripe_promptpay',
  ).trim();

  if (
    BLOCKED_PAYMENT_METHODS.has(paymentMethod) ||
    paymentMethod.startsWith('omise') ||
    paymentMethod === 'bacs' ||
    paymentMethod === 'cod' ||
    paymentMethod === 'xendit_gateway'
  ) {
    const err = new Error(
      'วิธีชำระเงินนี้ถูกปิดแล้ว — ใช้พร้อมเพย์ผ่าน Stripe เท่านั้น',
    );
    err.status = 400;
    throw err;
  }

  if (!ALLOWED_PAYMENT_METHODS.has(paymentMethod)) {
    const err = new Error(
      'วิธีชำระเงินไม่ถูกต้อง (รองรับเฉพาะ stripe_promptpay)',
    );
    err.status = 400;
    throw err;
  }

  const lineItems = (Array.isArray(input.line_items) ? input.line_items : [])
    .map((item) => {
      const productId = Number(item?.product_id ?? item?.id);
      const quantity = Number(item?.quantity) || 0;
      if (!Number.isFinite(productId) || productId <= 0 || quantity < 1) {
        return null;
      }
      return { product_id: productId, quantity };
    })
    .filter(Boolean);

  if (!lineItems.length) {
    const err = new Error('ไม่มีสินค้าในตะกร้าสำหรับสร้างคำสั่งซื้อ');
    err.status = 400;
    throw err;
  }

  const shippingCost = Number(input.shippingTotal);
  const shippingLines =
    Number.isFinite(shippingCost) && shippingCost > 0
      ? [
          {
            method_id: 'flat_rate',
            method_title: 'ค่าจัดส่ง',
            total: shippingCost.toFixed(2),
          },
        ]
      : [];

  // Status drives WooCommerce transactional emails:
  // Stripe PromptPay stays pending until paid via webhook.
  const statusByMethod = {
    stripe_promptpay: 'pending',
  };

  const payload = {
    payment_method: paymentMethod,
    payment_method_title: PAYMENT_TITLES[paymentMethod] || paymentMethod,
    set_paid: false,
    status: statusByMethod[paymentMethod] || 'pending',
    customer_note: String(input.customer_note || '').trim(),
    billing: toAddress(input.billing, { includeEmail: true }),
    shipping: toAddress(input.shipping),
    line_items: lineItems,
    shipping_lines: shippingLines,
  };

  const customerId = Number(input.customer_id);
  if (Number.isInteger(customerId) && customerId > 0) {
    payload.customer_id = customerId;
  }

  return payload;
}

/**
 * Normalize host/base into site origin (scheme + host), no trailing slash.
 * Used for public checkout/order-pay URLs only — never exposes secrets.
 */
export function resolveWooSiteOrigin(wooUrl) {
  const raw = trimSlash(wooUrl);
  if (!raw) return '';
  try {
    const parsed = new URL(raw.includes('://') ? raw : `https://${raw}`);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return '';
  }
}

/**
 * WooCommerce native pay-for-order URL (matches WC_Order::get_checkout_payment_url).
 * Example: https://host/checkout/order-pay/123/?pay_for_order=true&key=wc_order_xxx
 */
export function buildWooOrderPayUrl(wooUrl, orderId, orderKey) {
  const origin = resolveWooSiteOrigin(wooUrl);
  const id = String(orderId || '').trim();
  const key = String(orderKey || '').trim();
  if (!origin || !id || !key) return '';
  const url = new URL(`${origin}/checkout/order-pay/${encodeURIComponent(id)}/`);
  url.searchParams.set('pay_for_order', 'true');
  url.searchParams.set('key', key);
  return url.toString();
}

/**
 * @param {object} input - order fields from client (no secrets)
 * @returns {Promise<{ order: object, raw: object, payment_url?: string }>}
 */
export async function createWooCommerceOrder(input) {
  const { url, key, secret } = getServerCredentials();
  if (!url || !key || !secret) {
    const err = new Error(
      'ยังไม่ได้ตั้งค่า WooCommerce บนเซิร์ฟเวอร์ (WOOCOMMERCE_URL / KEY / SECRET)',
    );
    err.status = 500;
    throw err;
  }

  const ordersUrl = resolveWooRestOrdersUrl(url);
  const body = buildOrderPayload(input);
  const auth = Buffer.from(`${key}:${secret}`).toString('base64');

  // Evidence: this is the exact payment_method sent to WooCommerce REST.
  console.log('[wooCreateOrder] POST wc/v3/orders payment_method =', body.payment_method);

  const response = await fetch(ordersUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Basic ${auth}`,
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      (data && typeof data.message === 'string' && data.message.trim()) ||
      (Array.isArray(data) && data[0]?.message) ||
      `สร้างคำสั่งซื้อไม่สำเร็จ (${response.status})`;
    const err = new Error(message);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  const orderId = data?.id;
  if (orderId == null || orderId === '') {
    const err = new Error('ไม่พบเลขที่คำสั่งซื้อจาก WooCommerce');
    err.status = 502;
    err.data = data;
    throw err;
  }

  const orderKey = data.order_key ?? null;
  let orderData = data;

  return {
    raw: orderData,
    order: {
      order_id: orderId,
      order_key: orderKey,
      order_number:
        orderData.number != null ? String(orderData.number) : String(orderId),
      status: orderData.status ?? null,
      payment_method: orderData.payment_method ?? body.payment_method ?? null,
    },
    trace: {
      payment_method_requested: body.payment_method,
      payment_method_stored: String(
        orderData.payment_method ?? body.payment_method ?? '',
      ),
      omise_blocked: true,
    },
  };
}

function resolveWooRestBase(wooUrl) {
  return resolveWooRestOrdersUrl(wooUrl).replace(/\/orders$/i, '');
}

function wooAuthHeader(key, secret) {
  return `Basic ${Buffer.from(`${key}:${secret}`).toString('base64')}`;
}

function requireWooCredentials() {
  const { url, key, secret } = getServerCredentials();
  if (!url || !key || !secret) {
    const err = new Error(
      'ยังไม่ได้ตั้งค่า WooCommerce บนเซิร์ฟเวอร์ (WOOCOMMERCE_URL / KEY / SECRET)',
    );
    err.status = 500;
    throw err;
  }
  return { url, key, secret };
}

async function parseJsonResponse(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export function getWooOrderMeta(order, key) {
  const rows = Array.isArray(order?.meta_data) ? order.meta_data : [];
  const row = rows.find((item) => item?.key === key);
  return row?.value != null ? String(row.value) : '';
}

export function wooOrderAmountSatang(order) {
  const major = Number(order?.total);
  if (!Number.isFinite(major) || major < 0) return null;
  return Math.round(major * 100);
}

export function wooOrderCurrency(order) {
  return String(order?.currency || 'THB').trim().toLowerCase() || 'thb';
}

export function isWooOrderAlreadyPaid(order) {
  const status = String(order?.status || '').toLowerCase();
  if (status === 'processing' || status === 'completed') return true;
  if (order?.date_paid) return true;
  if (getWooOrderMeta(order, OMISE_PAID_META_KEY) === 'yes') return true;
  if (getWooOrderMeta(order, STRIPE_PAID_META_KEY) === 'yes') return true;
  return false;
}

async function wooRestRequest(path, { method = 'GET', body } = {}) {
  const { url, key, secret } = requireWooCredentials();
  const target = `${resolveWooRestBase(url)}${path.startsWith('/') ? path : `/${path}`}`;
  const headers = {
    Accept: 'application/json',
    Authorization: wooAuthHeader(key, secret),
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
  };
  if (body != null) headers['Content-Type'] = 'application/json';

  const response = await fetch(target, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
  const data = await parseJsonResponse(response);
  if (!response.ok) {
    const message =
      (data && typeof data.message === 'string' && data.message.trim()) ||
      `WooCommerce request failed (${response.status})`;
    const err = new Error(message);
    err.status = response.status;
    err.data = data;
    throw err;
  }
  return data;
}

export async function getWooOrderById(orderId) {
  const id = String(orderId || '').trim();
  if (!id || !/^\d+$/.test(id)) {
    const err = new Error('รหัสคำสั่งซื้อไม่ถูกต้อง');
    err.status = 400;
    throw err;
  }
  try {
    return await wooRestRequest(`/orders/${id}`);
  } catch (err) {
    if (err?.status === 404) {
      const notFound = new Error('ไม่พบคำสั่งซื้อใน WooCommerce');
      notFound.status = 404;
      throw notFound;
    }
    throw err;
  }
}

export async function updateWooOrder(orderId, payload) {
  const id = String(orderId || '').trim();
  return wooRestRequest(`/orders/${id}`, { method: 'PUT', body: payload });
}

export async function saveOmiseChargeIdOnOrder(orderId, chargeId) {
  return updateWooOrder(orderId, {
    meta_data: [{ key: OMISE_CHARGE_META_KEY, value: String(chargeId) }],
  });
}

export async function markWooOrderPaidFromOmise(orderId, chargeId) {
  return updateWooOrder(orderId, {
    status: 'processing',
    set_paid: true,
    meta_data: [
      { key: OMISE_CHARGE_META_KEY, value: String(chargeId) },
      { key: OMISE_PAID_META_KEY, value: 'yes' },
    ],
  });
}

export async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  return JSON.parse(raw);
}
