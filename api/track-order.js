import {
  readJsonBody,
  trackWooOrderByIdAndPhone,
} from '../server/wooTrackOrder.js';

function setJson(res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
}

/**
 * Vercel serverless: POST /api/track-order
 * Body: { orderId, phone } — Woo secrets stay on the server.
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
    const result = await trackWooOrderByIdAndPhone(payload);
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
            : 'ค้นหาคำสั่งซื้อไม่สำเร็จ',
      }),
    );
  }
}
