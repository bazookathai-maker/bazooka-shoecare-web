import { createPromptPayForWooOrder } from '../server/omisePromptPay.js';
import { readJsonBody } from '../server/wooCreateOrder.js';

function setJson(res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
}

/**
 * Vercel serverless: POST /api/create-promptpay
 * Creates an Omise PromptPay charge for an existing Woo order.
 * Secret key stays on the server.
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
    const payload = await readJsonBody(req);
    const orderId = payload?.orderId ?? payload?.order_id;
    const result = await createPromptPayForWooOrder(orderId);
    res.statusCode = 200;
    res.end(JSON.stringify({ promptpay: result }));
  } catch (err) {
    const status = Number(err?.status) || 500;
    res.statusCode = status;
    res.end(
      JSON.stringify({
        message:
          err instanceof Error ? err.message : 'สร้าง QR พร้อมเพย์ไม่สำเร็จ',
      }),
    );
  }
}
