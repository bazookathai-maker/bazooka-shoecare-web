import { getAuthenticatedOrders } from '../server/wooCustomerAuth.js';

function setJson(res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
}

/**
 * Vercel serverless: GET /api/auth-orders  (rewritten from /api/auth/orders)
 */
export default async function handler(req, res) {
  setJson(res);

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.end(JSON.stringify({ message: 'Method Not Allowed' }));
    return;
  }

  try {
    const orders = await getAuthenticatedOrders(req);
    res.statusCode = 200;
    res.end(JSON.stringify({ orders }));
  } catch (err) {
    const status = Number(err?.status) || 500;
    res.statusCode = status;
    res.end(
      JSON.stringify({
        message:
          err instanceof Error ? err.message : 'โหลดประวัติคำสั่งซื้อไม่สำเร็จ',
      }),
    );
  }
}
