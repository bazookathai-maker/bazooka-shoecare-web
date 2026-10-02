import {
  getAuthenticatedCustomer,
  getAuthenticatedOrders,
  getPasswordResetUrl,
  loginCustomer,
  loginWithGoogleIdentity,
  readJsonBody,
  registerCustomer,
  updateCustomerProfile,
} from '../../server/wooCustomerAuth.js';
import {
  clearGoogleNonceCookie,
  getGoogleClientId,
  issueGoogleNonce,
  readGoogleNonce,
  verifyGoogleIdToken,
} from '../../server/googleAuth.js';
import { assertSameOriginJsonRequest } from '../../server/authTokens.js';

function setJson(res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
}

function methodNotAllowed(res) {
  res.statusCode = 405;
  res.end(JSON.stringify({ message: 'Method Not Allowed' }));
}

const FALLBACK_MESSAGES = {
  register: 'สมัครบัญชีไม่สำเร็จ',
  login: 'เข้าสู่ระบบไม่สำเร็จ',
  google: 'เข้าสู่ระบบด้วย Google ไม่สำเร็จ',
  orders: 'โหลดประวัติคำสั่งซื้อไม่สำเร็จ',
  profile: 'บันทึกข้อมูลบัญชีไม่สำเร็จ',
};

/**
 * Consolidated auth routes (1 serverless function):
 * POST /api/auth/register
 * POST /api/auth/login          (optional googleLinkTicket to link Google)
 * GET  /api/auth/google-config  (client id + single-use nonce cookie)
 * GET  /api/auth/password-reset (WordPress lost-password page URL)
 * POST /api/auth/google         (GIS ID token → session)
 * GET  /api/auth/me
 * GET  /api/auth/orders
 * PUT  /api/auth/profile
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
      if (payload?.googleLinkTicket) assertSameOriginJsonRequest(req);
      const result = await loginCustomer(payload);
      res.statusCode = 200;
      res.end(JSON.stringify(result));
      return;
    }

    if (action === 'google-config') {
      if (req.method !== 'GET') return methodNotAllowed(res);
      const clientId = getGoogleClientId();
      if (!clientId) {
        res.statusCode = 200;
        res.end(JSON.stringify({ enabled: false }));
        return;
      }
      const { nonce, setCookie } = issueGoogleNonce(req);
      res.setHeader('Set-Cookie', setCookie);
      res.statusCode = 200;
      res.end(JSON.stringify({ enabled: true, clientId, nonce }));
      return;
    }

    if (action === 'password-reset') {
      if (req.method !== 'GET') return methodNotAllowed(res);
      res.statusCode = 200;
      res.end(JSON.stringify({ url: getPasswordResetUrl() }));
      return;
    }

    if (action === 'google') {
      if (req.method !== 'POST') return methodNotAllowed(res);
      assertSameOriginJsonRequest(req);
      const expectedNonce = readGoogleNonce(req);
      // Nonce is single-use: clear it whatever the outcome.
      res.setHeader('Set-Cookie', clearGoogleNonceCookie(req));
      const payload = await readJsonBody(req);
      const identity = await verifyGoogleIdToken(payload?.credential, expectedNonce);
      const result = await loginWithGoogleIdentity(identity);
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

    if (action === 'profile') {
      if (req.method !== 'PUT') return methodNotAllowed(res);
      const payload = await readJsonBody(req);
      const customer = await updateCustomerProfile(req, payload);
      res.statusCode = 200;
      res.end(JSON.stringify({ customer }));
      return;
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ message: `Unknown auth action: ${action || '(empty)'}` }));
  } catch (err) {
    const status = Number(err?.status) || 500;
    res.statusCode = status;
    const body = {
      message:
        err instanceof Error && err.message
          ? err.message
          : FALLBACK_MESSAGES[action] || 'โหลดข้อมูลบัญชีไม่สำเร็จ',
    };
    const code = err?.data?.code;
    if (typeof code === 'string' && code.startsWith('google_')) {
      body.code = code;
      if (code === 'google_link_required') {
        body.email = err.data.email;
        body.linkTicket = err.data.linkTicket;
      }
    }
    res.end(JSON.stringify(body));
  }
}
