import {
  createStripeCheckoutForWooOrder,
} from '../../server/stripeCheckout.js';
import { readJsonBody } from '../../server/wooCreateOrder.js';

function setJson(res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
}

function resolveRequestOrigin(req, bodyOrigin) {
  const fromBody = String(bodyOrigin || '').trim();
  if (fromBody) return fromBody;
  const origin = String(req.headers?.origin || '').trim();
  if (origin) return origin;
  const proto = String(req.headers?.['x-forwarded-proto'] || 'https')
    .split(',')[0]
    .trim();
  const host = String(
    req.headers?.['x-forwarded-host'] || req.headers?.host || '',
  )
    .split(',')[0]
    .trim();
  if (host) return `${proto}://${host}`;
  return '';
}

/**
 * Consolidated payment helpers (1 serverless function):
 * POST /api/payments/stripe-checkout  (also rewritten from /api/create-stripe-checkout)
 * *     /api/payments/promptpay         (410; rewritten from /api/create-promptpay)
 */
export default async function handler(req, res) {
  setJson(res);

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  const action = String(req.query.action || '')
    .trim()
    .toLowerCase();

  if (action === 'promptpay' || action === 'create-promptpay') {
    res.statusCode = 410;
    res.end(
      JSON.stringify({
        message:
          'Omise PromptPay ถูกปิดแล้ว — ใช้ stripe_promptpay หรือ xendit_gateway สำหรับชำระออนไลน์',
      }),
    );
    return;
  }

  if (action === 'stripe-checkout' || action === 'create-stripe-checkout') {
    if (req.method !== 'POST') {
      res.statusCode = 405;
      res.end(JSON.stringify({ message: 'Method Not Allowed' }));
      return;
    }

    try {
      const payload = await readJsonBody(req);
      const orderId = payload.orderId ?? payload.order_id;
      const orderKey = payload.orderKey ?? payload.order_key ?? '';
      const successOrigin = resolveRequestOrigin(req, payload.successOrigin);
      const result = await createStripeCheckoutForWooOrder(orderId, {
        orderKey,
        successOrigin,
      });
      res.statusCode = 200;
      res.end(JSON.stringify(result));
    } catch (err) {
      const status = Number(err?.status) || 500;
      res.statusCode = status;
      res.end(
        JSON.stringify({
          message:
            err instanceof Error
              ? err.message
              : 'สร้าง Stripe Checkout ไม่สำเร็จ',
        }),
      );
    }
    return;
  }

  res.statusCode = 404;
  res.end(
    JSON.stringify({
      message: `Unknown payments action: ${action || '(empty)'}`,
    }),
  );
}
