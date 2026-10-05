/**
 * Omise PromptPay Test Mode (server-only).
 * Reads OMISE_SECRET_KEY — never import from browser/client code.
 */

import {
  getWooOrderById,
  getWooOrderMeta,
  isWooOrderAlreadyPaid,
  markWooOrderPaidFromOmise,
  OMISE_CHARGE_META_KEY,
  saveOmiseChargeIdOnOrder,
  wooOrderAmountSatang,
  wooOrderCurrency,
} from './wooCreateOrder.js';

const OMISE_API = 'https://api.omise.co';
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

function getOmiseSecretKey() {
  const key = cleanEnvValue(process.env.OMISE_SECRET_KEY);
  if (!key) {
    throw httpError('ยังไม่ได้ตั้งค่า OMISE_SECRET_KEY บนเซิร์ฟเวอร์', 500);
  }
  if (key.startsWith('skey_live_')) {
    throw httpError('รอบนี้รองรับเฉพาะ Omise Test Mode (skey_test_)', 500);
  }
  if (!key.startsWith('skey_test_')) {
    throw httpError('OMISE_SECRET_KEY ต้องเป็น Test Mode (skey_test_)', 500);
  }
  return key;
}

function omiseAuthHeader() {
  return `Basic ${Buffer.from(`${getOmiseSecretKey()}:`).toString('base64')}`;
}

async function omiseRequest(path, { method = 'GET', body } = {}) {
  const headers = {
    Accept: 'application/json',
    Authorization: omiseAuthHeader(),
  };
  if (body != null) headers['Content-Type'] = 'application/json';

  const response = await fetch(`${OMISE_API}${path}`, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      (data && typeof data.message === 'string' && data.message.trim()) ||
      `Omise request failed (${response.status})`;
    throw httpError(message, response.status >= 500 ? 502 : response.status, data);
  }

  return data;
}

export async function retrieveOmiseCharge(chargeId) {
  const id = String(chargeId || '').trim();
  if (!id) throw httpError('ไม่พบ Omise charge id', 400);
  return omiseRequest(`/charges/${encodeURIComponent(id)}`);
}

function extractQrPayload(charge) {
  const source = charge?.source && typeof charge.source === 'object' ? charge.source : {};
  const image = source?.scannable_code?.image || {};
  const qrImageUrl = String(image.download_uri || image.uri || '').trim();
  const expiresAt = source.expires_at || charge.expires_at || null;
  return { qrImageUrl, expiresAt };
}

function chargeOrderRef(charge) {
  const meta = charge?.metadata && typeof charge.metadata === 'object' ? charge.metadata : {};
  return String(meta.woo_order_id || meta.order_id || '').trim();
}

function publicPromptPayResult(order, charge) {
  const { qrImageUrl, expiresAt } = extractQrPayload(charge);
  return {
    orderId: order.id,
    qrImageUrl,
    expiresAt,
    amount: Number(order.total),
    currency: String(order.currency || 'THB'),
  };
}

/**
 * Create (or reuse pending) PromptPay charge for an existing Woo order.
 * Amount/currency always come from WooCommerce — never from the client.
 */
export async function createPromptPayForWooOrder(orderId) {
  const order = await getWooOrderById(orderId);

  if (String(order.payment_method || '') !== 'omise_promptpay') {
    throw httpError('คำสั่งซื้อนี้ไม่ได้เลือกพร้อมเพย์', 400);
  }

  if (isWooOrderAlreadyPaid(order)) {
    throw httpError('คำสั่งซื้อนี้ชำระเงินแล้ว', 409);
  }

  const amount = wooOrderAmountSatang(order);
  const currency = wooOrderCurrency(order);
  if (!amount || amount < 1) {
    throw httpError('ยอดคำสั่งซื้อไม่ถูกต้อง', 400);
  }
  if (currency !== 'thb') {
    throw httpError('พร้อมเพย์รองรับเฉพาะสกุลเงิน THB', 400);
  }

  const existingChargeId = getWooOrderMeta(order, OMISE_CHARGE_META_KEY);
  if (existingChargeId) {
    try {
      const existing = await retrieveOmiseCharge(existingChargeId);
      if (existing?.status === 'successful') {
        await markWooOrderPaidFromOmise(order.id, existing.id);
        throw httpError('คำสั่งซื้อนี้ชำระเงินแล้ว', 409);
      }
      if (existing?.status === 'pending') {
        const reused = publicPromptPayResult(order, existing);
        if (reused.qrImageUrl) return reused;
      }
    } catch (err) {
      if (err?.status === 409) throw err;
      // Expired/missing charge → create a new one.
    }
  }

  const source = await omiseRequest('/sources', {
    method: 'POST',
    body: {
      type: 'promptpay',
      amount,
      currency,
    },
  });

  const charge = await omiseRequest('/charges', {
    method: 'POST',
    body: {
      amount,
      currency,
      source: source.id,
      metadata: {
        woo_order_id: String(order.id),
        order_id: String(order.id),
        order_number: String(order.number || order.id),
      },
    },
  });

  await saveOmiseChargeIdOnOrder(order.id, charge.id);

  const result = publicPromptPayResult(order, charge);
  if (!result.qrImageUrl) {
    throw httpError('สร้าง QR พร้อมเพย์ไม่สำเร็จ', 502, charge);
  }
  return result;
}

function chargeMatchesWooOrder(charge, order) {
  const ref = chargeOrderRef(charge);
  if (!ref || String(ref) !== String(order.id)) return false;

  const chargeAmount = Number(charge.amount);
  const orderAmount = wooOrderAmountSatang(order);
  if (!Number.isFinite(chargeAmount) || chargeAmount !== orderAmount) return false;

  const chargeCurrency = String(charge.currency || '').toLowerCase();
  if (chargeCurrency !== wooOrderCurrency(order)) return false;

  return true;
}

/**
 * Handle Omise event. Always re-fetches the charge before marking paid.
 */
export async function handleOmiseWebhookEvent(event) {
  const key = String(event?.key || '').trim();
  if (key && key !== 'charge.complete') {
    return { ignored: true, reason: 'event_not_charge_complete', key };
  }

  const chargeId =
    event?.data?.id ||
    event?.data?.object?.id ||
    (event?.data?.object === 'charge' ? event?.data?.id : '') ||
    '';

  if (!String(chargeId).trim()) {
    throw httpError('webhook ไม่มี charge id', 400);
  }

  const charge = await retrieveOmiseCharge(chargeId);
  const status = String(charge?.status || '').toLowerCase();

  if (status !== 'successful') {
    return {
      ignored: true,
      reason: 'charge_not_successful',
      status,
      orderStill: 'pending',
    };
  }

  const orderId = chargeOrderRef(charge);
  if (!orderId) {
    throw httpError('charge ไม่มี order reference', 400);
  }

  const order = await getWooOrderById(orderId);

  if (!chargeMatchesWooOrder(charge, order)) {
    throw httpError('charge ไม่ตรงกับคำสั่งซื้อ WooCommerce', 409);
  }

  if (isWooOrderAlreadyPaid(order)) {
    return {
      idempotent: true,
      orderId: order.id,
      status: order.status,
    };
  }

  const updated = await markWooOrderPaidFromOmise(order.id, charge.id);
  return {
    paid: true,
    orderId: updated?.id || order.id,
    status: updated?.status || 'processing',
  };
}
