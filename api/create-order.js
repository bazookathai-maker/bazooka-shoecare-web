import {
  createWooCommerceOrder,
  readJsonBody,
} from '../server/wooCreateOrder.js';

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
