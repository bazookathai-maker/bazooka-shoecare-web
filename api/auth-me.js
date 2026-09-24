import { getAuthenticatedCustomer } from '../server/wooCustomerAuth.js';

function setJson(res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
}

/**
 * Vercel serverless: GET /api/auth-me  (rewritten from /api/auth/me)
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
    const customer = await getAuthenticatedCustomer(req);
    res.statusCode = 200;
    res.end(JSON.stringify({ customer }));
  } catch (err) {
    const status = Number(err?.status) || 500;
    res.statusCode = status;
    res.end(
      JSON.stringify({
        message: err instanceof Error ? err.message : 'โหลดข้อมูลบัญชีไม่สำเร็จ',
      }),
    );
  }
}
