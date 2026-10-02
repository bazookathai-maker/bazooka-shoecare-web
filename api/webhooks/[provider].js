import { handleOmiseWebhookEvent } from '../../server/omisePromptPay.js';
import {
  handleStripeWebhook,
  readRawBody,
} from '../../server/stripeCheckout.js';

/**
 * Raw body required for Stripe signature verification.
 * Omise path parses JSON from the same raw buffer.
 */
export const config = {
  api: {
    bodyParser: false,
  },
};

function setJson(res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
}

/**
 * Consolidated webhooks (1 serverless function):
 * POST /api/webhooks/stripe  (rewritten from /api/stripe-webhook)
 * POST /api/webhooks/omise   (rewritten from /api/omise-webhook)
 */
export default async function handler(req, res) {
  setJson(res);

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end(JSON.stringify({ message: 'Method Not Allowed' }));
    return;
  }

  const provider = String(req.query.provider || '')
    .trim()
    .toLowerCase();

  try {
    if (provider === 'stripe') {
      const rawBody = await readRawBody(req);
      const signature = req.headers['stripe-signature'];
      const result = await handleStripeWebhook(rawBody, signature);
      res.statusCode = 200;
      res.end(JSON.stringify(result));
      return;
    }

    if (provider === 'omise') {
      const rawBody = await readRawBody(req);
      const text = Buffer.isBuffer(rawBody)
        ? rawBody.toString('utf8')
        : String(rawBody || '');
      const event = text ? JSON.parse(text) : {};
      const result = await handleOmiseWebhookEvent(event);
      res.statusCode = 200;
      res.end(JSON.stringify({ ok: true, ...result }));
      return;
    }

    res.statusCode = 404;
    res.end(
      JSON.stringify({
        ok: false,
        message: `Unknown webhook provider: ${provider || '(empty)'}`,
      }),
    );
  } catch (err) {
    const status = Number(err?.status) || 500;
    res.statusCode = status;
    res.end(
      JSON.stringify({
        ok: false,
        message:
          err instanceof Error
            ? err.message
            : 'ประมวลผล webhook ไม่สำเร็จ',
      }),
    );
  }
}
