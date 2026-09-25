/**
 * Stripe Checkout (PromptPay) — server-only.
 * Reads STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET.
 * Never import this module from browser/client code.
 */

import Stripe from 'stripe';
import {
  getWooOrderById,
  getWooOrderMeta,
  isWooOrderAlreadyPaid,
  STRIPE_PAID_META_KEY,
  updateWooOrder,
  wooOrderAmountSatang,
  wooOrderCurrency,
} from './wooCreateOrder.js';

export const STRIPE_PAYMENT_METHOD = 'stripe_promptpay';
export const STRIPE_SESSION_META_KEY = '_stripe_checkout_session_id';
export const STRIPE_PAYMENT_INTENT_META_KEY = '_stripe_payment_intent_id';
export { STRIPE_PAID_META_KEY };
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

function getStripeSecretKey() {
  const key = cleanEnvValue(process.env.STRIPE_SECRET_KEY);
  if (!key) {
    throw httpError('ยังไม่ได้ตั้งค่า STRIPE_SECRET_KEY บนเซิร์ฟเวอร์', 500);
  }
  // Accept live or test secrets. Mode is determined solely by the key prefix
  // from server env (never from the browser).
  if (!key.startsWith('sk_live_') && !key.startsWith('sk_test_')) {
    throw httpError(
      'STRIPE_SECRET_KEY ต้องขึ้นต้นด้วย sk_live_ หรือ sk_test_',
      500,
    );
  }
  return key;
}

function getStripeWebhookSecret() {
  const secret = cleanEnvValue(process.env.STRIPE_WEBHOOK_SECRET);
  if (!secret) {
    throw httpError('ยังไม่ได้ตั้งค่า STRIPE_WEBHOOK_SECRET บนเซิร์ฟเวอร์', 500);
  }
  if (!secret.startsWith('whsec_')) {
    throw httpError('STRIPE_WEBHOOK_SECRET ไม่ถูกต้อง', 500);
  }
  return secret;
}

function getStripe() {
  return new Stripe(getStripeSecretKey());
}

/** Live vs test is inferred from STRIPE_SECRET_KEY only (server-side). */
export function getStripeMode() {
  const key = cleanEnvValue(process.env.STRIPE_SECRET_KEY);
  if (key.startsWith('sk_live_')) return 'live';
  if (key.startsWith('sk_test_')) return 'test';
  return 'unknown';
}

function normalizeOrigin(origin) {
  const raw = String(origin || '').trim().replace(/\/$/, '');
  if (!raw) return '';
  try {
    const url = new URL(raw.includes('://') ? raw : `https://${raw}`);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return '';
    return `${url.protocol}//${url.host}`;
  } catch {
    return '';
  }
}

function resolveSuccessOrigin(preferred) {
  return (
    normalizeOrigin(preferred) ||
    normalizeOrigin(process.env.PUBLIC_SITE_URL) ||
    normalizeOrigin(process.env.SITE_URL) ||
    'http://localhost:5173'
  );
}

/**
 * Create a Stripe-hosted Checkout Session for an existing Woo order (PromptPay).
 * Amount/currency always come from WooCommerce — never from the client.
 */
export async function createStripeCheckoutForWooOrder(
  orderId,
  { orderKey = '', successOrigin = '' } = {},
) {
  const order = await getWooOrderById(orderId);

  if (String(order.payment_method || '') !== STRIPE_PAYMENT_METHOD) {
    throw httpError('คำสั่งซื้อนี้ไม่ได้เลือก Stripe PromptPay', 400);
  }

  const expectedKey = String(order.order_key || '').trim();
  const providedKey = String(orderKey || '').trim();
  if (expectedKey && providedKey && providedKey !== expectedKey) {
    throw httpError('order_key ไม่ตรงกับคำสั่งซื้อ', 403);
  }

  if (isWooOrderAlreadyPaid(order)) {
    throw httpError('คำสั่งซื้อนี้ชำระเงินแล้ว', 400);
  }

  const amount = wooOrderAmountSatang(order);
  if (amount == null || amount < 1) {
    throw httpError('ยอดคำสั่งซื้อไม่ถูกต้องสำหรับ Stripe', 400);
  }

  const currency = wooOrderCurrency(order);
  if (currency !== 'thb') {
    throw httpError('Stripe PromptPay รองรับเฉพาะสกุลเงิน THB', 400);
  }

  const origin = resolveSuccessOrigin(successOrigin);
  const orderNumber =
    order.number != null ? String(order.number) : String(order.id);
  const wooOrderId = String(order.id);
  const wooOrderKey = expectedKey;

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['promptpay'],
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'thb',
          unit_amount: amount,
          product_data: {
            name: `BAZOOKA Order #${orderNumber}`,
            description: `WooCommerce order ${wooOrderId}`,
          },
        },
      },
    ],
    client_reference_id: wooOrderId,
    customer_email: String(order.billing?.email || '').trim() || undefined,
    metadata: {
      woo_order_id: wooOrderId,
      woo_order_key: wooOrderKey,
      woo_order_number: orderNumber,
    },
    payment_intent_data: {
      metadata: {
        woo_order_id: wooOrderId,
        woo_order_key: wooOrderKey,
        woo_order_number: orderNumber,
      },
    },
    success_url: `${origin}/order-success?orderId=${encodeURIComponent(wooOrderId)}&orderNumber=${encodeURIComponent(orderNumber)}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout?canceled=1&orderId=${encodeURIComponent(wooOrderId)}`,
  });

  const sessionUrl = String(session.url || '').trim();
  if (!sessionUrl) {
    throw httpError('Stripe ไม่ได้คืน Checkout URL', 502, session);
  }

  await updateWooOrder(order.id, {
    meta_data: [
      { key: STRIPE_SESSION_META_KEY, value: String(session.id) },
    ],
    transaction_id: String(session.id),
  });

  return {
    orderId: order.id,
    orderNumber,
    sessionId: session.id,
    url: sessionUrl,
  };
}

function resolveWooOrderIdFromSession(session) {
  const fromRef = String(session?.client_reference_id || '').trim();
  if (/^\d+$/.test(fromRef)) return fromRef;
  const fromMeta = String(session?.metadata?.woo_order_id || '').trim();
  if (/^\d+$/.test(fromMeta)) return fromMeta;
  return '';
}

async function markOrderPaidFromSession(session) {
  const orderId = resolveWooOrderIdFromSession(session);
  if (!orderId) {
    throw httpError('Webhook ไม่พบ woo_order_id ใน Checkout Session', 400);
  }

  const order = await getWooOrderById(orderId);
  if (isWooOrderAlreadyPaid(order)) {
    return {
      ok: true,
      skipped: true,
      reason: 'already_paid',
      orderId: order.id,
    };
  }

  const paymentStatus = String(session.payment_status || '').toLowerCase();
  if (paymentStatus !== 'paid') {
    return {
      ok: true,
      skipped: true,
      reason: `payment_status_${paymentStatus || 'unknown'}`,
      orderId: order.id,
    };
  }

  const sessionAmount = Number(session.amount_total);
  const wooAmount = wooOrderAmountSatang(order);
  if (
    Number.isFinite(sessionAmount) &&
    wooAmount != null &&
    sessionAmount !== wooAmount
  ) {
    throw httpError(
      `ยอด Stripe (${sessionAmount}) ไม่ตรงกับ Woo (${wooAmount})`,
      400,
    );
  }

  const sessionCurrency = String(session.currency || '')
    .trim()
    .toLowerCase();
  const wooCurrency = wooOrderCurrency(order);
  if (sessionCurrency && sessionCurrency !== wooCurrency) {
    throw httpError(
      `สกุลเงิน Stripe (${sessionCurrency}) ไม่ตรงกับ Woo (${wooCurrency})`,
      400,
    );
  }

  const paymentIntentId =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id || '';

  await updateWooOrder(order.id, {
    status: 'processing',
    set_paid: true,
    transaction_id: paymentIntentId || String(session.id),
    meta_data: [
      { key: STRIPE_SESSION_META_KEY, value: String(session.id) },
      ...(paymentIntentId
        ? [{ key: STRIPE_PAYMENT_INTENT_META_KEY, value: paymentIntentId }]
        : []),
      { key: STRIPE_PAID_META_KEY, value: 'yes' },
    ],
  });

  return {
    ok: true,
    markedPaid: true,
    orderId: order.id,
    sessionId: session.id,
    paymentIntentId: paymentIntentId || null,
  };
}

/**
 * Verify Stripe webhook signature and update Woo order when paid.
 * @param {string|Buffer} rawBody
 * @param {string} signatureHeader
 */
export async function handleStripeWebhook(rawBody, signatureHeader) {
  const stripe = getStripe();
  const secret = getStripeWebhookSecret();
  const signature = String(signatureHeader || '').trim();
  if (!signature) {
    throw httpError('ไม่มี Stripe-Signature header', 400);
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    throw httpError(
      `Stripe webhook signature ไม่ถูกต้อง: ${err instanceof Error ? err.message : 'invalid'}`,
      400,
    );
  }

  const type = String(event.type || '');
  if (
    type !== 'checkout.session.completed' &&
    type !== 'checkout.session.async_payment_succeeded'
  ) {
    return { ok: true, ignored: true, type };
  }

  const session = event.data?.object;
  if (!session || typeof session !== 'object') {
    throw httpError('Webhook ไม่มี Checkout Session', 400);
  }

  const result = await markOrderPaidFromSession(session);
  return { ok: true, type, ...result };
}

export async function readRawBody(req) {
  if (typeof req.body === 'string') return req.body;
  if (Buffer.isBuffer(req.body)) return req.body;
  if (req.rawBody != null) return req.rawBody;

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

/** Exported for diagnostics only — never log secret values. */
export function isStripeTestConfigured() {
  return getStripeMode() === 'test';
}

export function isStripeLiveConfigured() {
  return getStripeMode() === 'live';
}

export function getSavedStripeSessionId(order) {
  return getWooOrderMeta(order, STRIPE_SESSION_META_KEY);
}
