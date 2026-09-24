import {
  handleStripeWebhook,
  readRawBody,
} from '../server/stripeCheckout.js';

/**
 * Vercel: disable body parsing so Stripe signature verification receives raw bytes.
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
 * Vercel serverless: POST /api/stripe-webhook
 * Verifies Stripe-Signature with STRIPE_WEBHOOK_SECRET (server-only).
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

  try {
    const rawBody = await readRawBody(req);
    const signature = req.headers['stripe-signature'];
    const result = await handleStripeWebhook(rawBody, signature);
    res.statusCode = 200;
    res.end(JSON.stringify(result));
  } catch (err) {
    const status = Number(err?.status) || 500;
    res.statusCode = status;
    res.end(
      JSON.stringify({
        ok: false,
        message:
          err instanceof Error
            ? err.message
            : 'ประมวลผล Stripe webhook ไม่สำเร็จ',
      }),
    );
  }
}
