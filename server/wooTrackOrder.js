/**
 * Guest order tracking via WooCommerce REST (server-only).
 * Requires order number/id + billing phone match. Never import from browser.
 */

import {
  getWooOrderById,
  resolveWooRestOrdersUrl,
  readJsonBody,
} from './wooCreateOrder.js';

const SENSITIVE_PLACEHOLDER = /^\[SENSITIVE]$/i;

function cleanEnvValue(value) {
  const raw = String(value || '').trim();
  if (!raw || SENSITIVE_PLACEHOLDER.test(raw)) return '';
  return raw;
}

function httpError(message, status, data) {
  const err = new Error(message);
  err.status = status;
  err.data = data;
  return err;
}

function getServerCredentials() {
  const url = cleanEnvValue(process.env.WOOCOMMERCE_URL);
  const key = cleanEnvValue(process.env.WOOCOMMERCE_CONSUMER_KEY);
  const secret = cleanEnvValue(process.env.WOOCOMMERCE_CONSUMER_SECRET);
  return { url, key, secret };
}

/**
 * Normalize Thai / international phone numbers for comparison.
 * Examples that should match: 0615359918, 061-535-9918, +66 61 535 9918, 66615359918
 */
export function normalizePhoneDigits(phone) {
  let digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return '';

  // 0066... → 66...
  digits = digits.replace(/^00+/, '');

  if (digits.startsWith('66') && digits.length >= 11) {
    digits = `0${digits.slice(2)}`;
  }

  // Drop leading trunk zeros beyond one (e.g. 00615... already handled)
  if (digits.length > 10 && digits.startsWith('0')) {
    // keep as-is for local 0XXXXXXXXX (10 digits typical)
  }

  return digits;
}

/** Comparable national forms: full normalized + last 9 digits (ignore leading 0/66). */
export function phoneMatchKeys(phone) {
  const normalized = normalizePhoneDigits(phone);
  if (!normalized) return [];
  const keys = new Set([normalized]);
  const national = normalized.startsWith('0')
    ? normalized.slice(1)
    : normalized;
  if (national.length >= 8) {
    keys.add(national);
    keys.add(national.slice(-9));
  }
  keys.add(normalized.slice(-9));
  return [...keys].filter(Boolean);
}

export function phonesMatch(a, b) {
  const keysA = phoneMatchKeys(a);
  const keysB = phoneMatchKeys(b);
  if (!keysA.length || !keysB.length) return false;
  return keysA.some((key) => keysB.includes(key));
}

function cleanOrderRef(orderId) {
  return String(orderId || '')
    .trim()
    .replace(/^#/, '')
    .replace(/\s+/g, '');
}

function mapWooStatusToTimeline(wooStatus) {
  const status = String(wooStatus || '').toLowerCase();
  if (status === 'completed') return 'completed';
  if (status === 'processing') return 'preparing';
  if (status === 'shipped' || status === 'completed-shipped') return 'shipped';
  if (status === 'cancelled' || status === 'refunded' || status === 'failed') {
    return 'received';
  }
  // pending, on-hold, etc.
  return 'received';
}

function formatAddress(billing = {}, shipping = {}) {
  const src = String(shipping?.address_1 || '').trim() ? shipping : billing;
  const parts = [
    src.address_1,
    src.address_2,
    src.city,
    src.state,
    src.postcode,
    src.country,
  ]
    .map((part) => String(part || '').trim())
    .filter(Boolean);
  return parts.join(', ');
}

function publicTrackOrder(order) {
  const billing = order.billing || {};
  const shipping = order.shipping || {};
  const fullName = [billing.first_name, billing.last_name]
    .map((part) => String(part || '').trim())
    .filter(Boolean)
    .join(' ');

  const items = (Array.isArray(order.line_items) ? order.line_items : []).map(
    (item) => ({
      id: item.id,
      name: String(item.name || '').trim(),
      image: String(item.image?.src || '').trim(),
      price: Number(item.price) || Number(item.total) / (Number(item.quantity) || 1) || 0,
      quantity: Number(item.quantity) || 0,
    }),
  );

  return {
    id: String(order.number != null ? order.number : order.id),
    wooId: Number(order.id),
    status: mapWooStatusToTimeline(order.status),
    wooStatus: String(order.status || '').trim(),
    createdAt: String(order.date_created || order.date_created_gmt || '').trim(),
    customer: {
      fullName: fullName || '-',
      phone: String(billing.phone || '').trim(),
      email: String(billing.email || '').trim(),
    },
    address: {
      fullAddress: formatAddress(billing, shipping) || '-',
    },
    payment: String(
      order.payment_method_title || order.payment_method || '',
    ).trim(),
    paymentMethod: String(order.payment_method || '').trim(),
    items,
    total: Number(order.total) || 0,
    currency: String(order.currency || 'THB').trim(),
  };
}

async function wooAuthFetch(pathOrUrl) {
  const { url, key, secret } = getServerCredentials();
  if (!url || !key || !secret) {
    throw httpError(
      'ยังไม่ได้ตั้งค่า WooCommerce บนเซิร์ฟเวอร์ (WOOCOMMERCE_URL / KEY / SECRET)',
      500,
    );
  }
  const ordersBase = resolveWooRestOrdersUrl(url);
  const target = pathOrUrl.startsWith('http')
    ? pathOrUrl
    : `${ordersBase.replace(/\/orders$/i, '')}${pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`}`;

  const auth = Buffer.from(`${key}:${secret}`).toString('base64');
  const response = await fetch(target, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Basic ${auth}`,
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
    },
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
      `WooCommerce request failed (${response.status})`;
    throw httpError(message, response.status === 404 ? 404 : response.status, data);
  }
  return data;
}

async function findWooOrderByRef(orderRef) {
  const ref = cleanOrderRef(orderRef);
  if (!ref) {
    throw httpError('กรุณากรอกเลขคำสั่งซื้อ', 400);
  }

  // Prefer direct id lookup when numeric.
  if (/^\d+$/.test(ref)) {
    try {
      const byId = await getWooOrderById(ref);
      const number = String(byId.number ?? byId.id);
      if (number === ref || String(byId.id) === ref) {
        return byId;
      }
    } catch (err) {
      if (err?.status !== 404) throw err;
    }
  }

  const { url } = getServerCredentials();
  const ordersUrl = new URL(resolveWooRestOrdersUrl(url));
  ordersUrl.searchParams.set('search', ref);
  ordersUrl.searchParams.set('per_page', '20');
  ordersUrl.searchParams.set('orderby', 'date');
  ordersUrl.searchParams.set('order', 'desc');

  const list = await wooAuthFetch(ordersUrl.toString());
  const rows = Array.isArray(list) ? list : [];
  const match = rows.find(
    (order) =>
      String(order?.number ?? '') === ref || String(order?.id ?? '') === ref,
  );

  if (!match) {
    throw httpError('ไม่พบคำสั่งซื้อ', 404);
  }
  return match;
}

/**
 * @param {{ orderId?: string, order_id?: string, phone?: string }} input
 */
export async function trackWooOrderByIdAndPhone(input) {
  const orderId = input?.orderId ?? input?.order_id ?? '';
  const phone = input?.phone ?? '';

  if (!cleanOrderRef(orderId)) {
    throw httpError('กรุณากรอกเลขคำสั่งซื้อ', 400);
  }
  if (!normalizePhoneDigits(phone)) {
    throw httpError('กรุณากรอกเบอร์โทรศัพท์', 400);
  }

  let order;
  try {
    order = await findWooOrderByRef(orderId);
  } catch (err) {
    if (err?.status === 404) {
      throw httpError(
        'ไม่พบคำสั่งซื้อ กรุณาตรวจสอบเลขคำสั่งซื้อหรือเบอร์โทรศัพท์อีกครั้ง',
        404,
      );
    }
    throw err;
  }

  const billingPhone = order?.billing?.phone;
  if (!phonesMatch(phone, billingPhone)) {
    throw httpError(
      'ไม่พบคำสั่งซื้อ กรุณาตรวจสอบเลขคำสั่งซื้อหรือเบอร์โทรศัพท์อีกครั้ง',
      404,
    );
  }

  return { order: publicTrackOrder(order) };
}

export { readJsonBody };
