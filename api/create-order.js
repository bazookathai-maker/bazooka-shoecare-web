import {
  createWooCommerceOrder,
  readJsonBody,
} from '../server/wooCreateOrder.js';
import { getSessionFromRequest } from '../server/wooCustomerAuth.js';

function setCors(res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
}

/**
 * Vercel serverless: POST /api/create-order
 * Secrets stay on the server (WOOCOMMERCE_* env vars).
 */
export default async function handler(req, res) {
  setCors(res);

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
    // Never trust client-supplied customer_id. Guest stays guest unless session is valid.
    delete payload.customer_id;
    // Never allow Omise methods through create-order (online pay = xendit / stripe).
    const method = String(payload.paymentMethod || payload.payment_method || '').trim();
    if (method.startsWith('omise') || method === 'omise_promptpay') {
      res.statusCode = 400;
      res.end(
        JSON.stringify({
          message:
            'Omise PromptPay ถูกปิดแล้ว — ใช้ xendit_gateway หรือ stripe_promptpay สำหรับชำระออนไลน์',
        }),
      );
      return;
    }
    const session = getSessionFromRequest(req);
    if (session?.customerId) {
      payload.customer_id = session.customerId;
    }
    const result = await createWooCommerceOrder(payload);
    res.statusCode = 200;
    res.end(JSON.stringify(result));
  } catch (err) {
    const status = Number(err?.status) || 500;
    res.statusCode = status;
    res.end(
      JSON.stringify({
        message:
          err instanceof Error ? err.message : 'สร้างคำสั่งซื้อไม่สำเร็จ',
        code: err?.data?.code || undefined,
      }),
    );
  }
}
