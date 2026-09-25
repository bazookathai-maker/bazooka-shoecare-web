import {
  getAuthenticatedCustomer,
  getAuthenticatedOrders,
  loginCustomer,
  readJsonBody,
  registerCustomer,
  updateCustomerBilling,
} from '../../server/wooCustomerAuth.js';

function setJson(res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
}

function methodNotAllowed(res) {
  res.statusCode = 405;
  res.end(JSON.stringify({ message: 'Method Not Allowed' }));
}

/**
 * Consolidated auth routes (1 serverless function):
 * POST /api/auth/register
 * POST /api/auth/login
 * GET  /api/auth/me
 * GET  /api/auth/orders
 * PUT|POST /api/auth/update-billing
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

  try {
    if (action === 'register') {
      if (req.method !== 'POST') return methodNotAllowed(res);
      const payload = await readJsonBody(req);
      const result = await registerCustomer(payload);
      res.statusCode = 200;
      res.end(JSON.stringify(result));
      return;
    }

    if (action === 'login') {
      if (req.method !== 'POST') return methodNotAllowed(res);
      const payload = await readJsonBody(req);
      const result = await loginCustomer(payload);
      res.statusCode = 200;
      res.end(JSON.stringify(result));
      return;
    }

    if (action === 'me') {
      if (req.method !== 'GET') return methodNotAllowed(res);
      const customer = await getAuthenticatedCustomer(req);
      res.statusCode = 200;
      res.end(JSON.stringify({ customer }));
      return;
    }

    if (action === 'orders') {
      if (req.method !== 'GET') return methodNotAllowed(res);
      const orders = await getAuthenticatedOrders(req);
      res.statusCode = 200;
      res.end(JSON.stringify({ orders }));
      return;
    }

    if (action === 'update-billing') {
      if (req.method !== 'PUT' && req.method !== 'POST') {
        return methodNotAllowed(res);
      }
      const payload = await readJsonBody(req);
      const customer = await updateCustomerBilling(req, payload.billing);
      res.statusCode = 200;
      res.end(JSON.stringify({ customer }));
      return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ message: `Unknown auth action: ${action || '(empty)'}` }));
  } catch (err) {
    const status = Number(err?.status) || 500;
    res.statusCode = status;
    const fallback =
      action === 'register'
        ? 'สมัครบัญชีไม่สำเร็จ'
        : action === 'login'
          ? 'เข้าสู่ระบบไม่สำเร็จ'
          : action === 'orders'
            ? 'โหลดประวัติคำสั่งซื้อไม่สำเร็จ'
            : action === 'update-billing'
              ? 'อัปเดตข้อมูลบัญชีไม่สำเร็จ'
              : 'โหลดข้อมูลบัญชีไม่สำเร็จ';
    res.end(
      JSON.stringify({
        message: err instanceof Error ? err.message : fallback,
      }),
    );
  }
}
