import { handleOmiseWebhookEvent } from '../server/omisePromptPay.js';
import { readJsonBody } from '../server/wooCreateOrder.js';

function setJson(res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
}

/**
 * Vercel serverless: POST /api/omise-webhook
 * Production URL: https://bazooka-shoecare-web.vercel.app/api/omise-webhook
 * Verifies payment by retrieving the charge from Omise again.
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
    const event = await readJsonBody(req);
    const result = await handleOmiseWebhookEvent(event);
    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true, ...result }));
  } catch (err) {
    const status = Number(err?.status) || 500;
    res.statusCode = status;
    res.end(
      JSON.stringify({
        ok: false,
        message:
          err instanceof Error ? err.message : 'ประมวลผล webhook ไม่สำเร็จ',
      }),
    );
  }
}
