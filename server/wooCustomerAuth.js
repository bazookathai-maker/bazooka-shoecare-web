/**
 * Server-only WooCommerce customer auth (register / login / profile / orders).
 * Consumer key/secret never leave this module.
 * Never import from browser/client code.
 */

import crypto from 'node:crypto';

const DEFAULT_WOO_HOST = 'https://bazookashoecare.com';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;
const SENSITIVE_PLACEHOLDER = /^\[SENSITIVE]$/i;

function trimSlash(url) {
  return String(url || '').replace(/\/$/, '');
}

function cleanEnvValue(value) {
  const raw = String(value || '').trim();
  if (!raw || SENSITIVE_PLACEHOLDER.test(raw)) return '';
  return raw;
}

function httpError(message, status, data) {
  const err = new Error(message);
  err.status = status;
  err.data = data;
  return err;
}

function getServerCredentials() {
  const url = cleanEnvValue(process.env.WOOCOMMERCE_URL);
  const key = cleanEnvValue(process.env.WOOCOMMERCE_CONSUMER_KEY);
  const secret = cleanEnvValue(process.env.WOOCOMMERCE_CONSUMER_SECRET);
  return { url, key, secret };
}

function requireWooCredentials() {
  const { url, key, secret } = getServerCredentials();
  if (!url || !key || !secret) {
    throw httpError(
      'ยังไม่ได้ตั้งค่า WooCommerce บนเซิร์ฟเวอร์ (WOOCOMMERCE_URL / KEY / SECRET)',
      500,
    );
  }
  return { url, key, secret };
}

function resolveWooSiteOrigin(wooUrl) {
  const raw = trimSlash(wooUrl) || DEFAULT_WOO_HOST;
  try {
    const parsed = new URL(raw);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return DEFAULT_WOO_HOST;
  }
}

function resolveWooRestBase(wooUrl) {
  const raw = trimSlash(wooUrl);
  if (!raw) return `${DEFAULT_WOO_HOST}/wp-json/wc/v3`;
  if (/\/wp-json\/wc\/v3$/i.test(raw)) return raw;
  if (/\/wp-json$/i.test(raw)) return `${raw}/wc/v3`;
  return `${raw}/wp-json/wc/v3`;
}

function getSessionSecret() {
  const dedicated = cleanEnvValue(process.env.AUTH_SESSION_SECRET);
  if (dedicated) return dedicated;
  const fallback = cleanEnvValue(process.env.WOOCOMMERCE_CONSUMER_SECRET);
  if (fallback) return fallback;
  throw httpError('ยังไม่ได้ตั้งค่า secret สำหรับ session บัญชี', 500);
}

function escapeXml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function parseJsonResponse(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function wooRestRequest(path, { method = 'GET', body, query } = {}) {
  const { url, key, secret } = requireWooCredentials();
  const base = resolveWooRestBase(url);
  const target = new URL(
    `${base}${path.startsWith('/') ? path : `/${path}`}`,
  );
  if (query && typeof query === 'object') {
    for (const [name, value] of Object.entries(query)) {
      if (value == null || value === '') continue;
      target.searchParams.set(name, String(value));
    }
  }

  const headers = {
    Accept: 'application/json',
    Authorization: `Basic ${Buffer.from(`${key}:${secret}`).toString('base64')}`,
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
  };
  if (body != null) headers['Content-Type'] = 'application/json';

  const response = await fetch(target, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
  const data = await parseJsonResponse(response);
  if (!response.ok) {
    const message =
      (data && typeof data.message === 'string' && data.message.trim()) ||
      `WooCommerce request failed (${response.status})`;
    throw httpError(message, response.status >= 500 ? 502 : response.status, data);
  }
  return data;
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function publicCustomer(customer) {
  const billing = customer?.billing && typeof customer.billing === 'object'
    ? customer.billing
    : {};
  return {
    id: Number(customer.id),
    email: String(customer.email || '').trim(),
    username: String(customer.username || '').trim(),
    first_name: String(customer.first_name || '').trim(),
    last_name: String(customer.last_name || '').trim(),
    billing: {
      first_name: String(billing.first_name || '').trim(),
      last_name: String(billing.last_name || '').trim(),
      phone: String(billing.phone || '').trim(),
      address_1: String(billing.address_1 || '').trim(),
      address_2: String(billing.address_2 || '').trim(),
      city: String(billing.city || '').trim(),
      state: String(billing.state || '').trim(),
      postcode: String(billing.postcode || '').trim(),
      country: String(billing.country || 'TH').trim() || 'TH',
    },
  };
}

function publicOrder(order) {
  const items = Array.isArray(order?.line_items) ? order.line_items : [];
  return {
    id: Number(order.id),
    number: String(order.number || order.id),
    status: String(order.status || '').trim(),
    date_created: String(order.date_created || '').trim(),
    total: String(order.total || '0'),
    currency: String(order.currency || 'THB'),
    payment_method: String(order.payment_method || '').trim(),
    payment_method_title: String(order.payment_method_title || '').trim(),
    line_items: items.map((item) => ({
      id: Number(item.id),
      name: String(item.name || '').trim(),
      quantity: Number(item.quantity) || 0,
      total: String(item.total || '0'),
    })),
  };
}

function signCustomerSession({ customerId, email }) {
  const secret = getSessionSecret();
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = Buffer.from(
    JSON.stringify({
      sub: Number(customerId),
      email: normalizeEmail(email),
      exp,
    }),
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function verifyCustomerSession(token) {
  const raw = String(token || '').trim();
  const parts = raw.split('.');
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;
  if (!payload || !sig) return null;

  let secret;
  try {
    secret = getSessionSecret();
  } catch {
    return null;
  }

  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length) return null;
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    const customerId = Number(data?.sub);
    const email = normalizeEmail(data?.email);
    const exp = Number(data?.exp);
    if (!Number.isInteger(customerId) || customerId <= 0) return null;
    if (!email) return null;
    if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return null;
    return { customerId, email };
  } catch {
    return null;
  }
}

export function readBearerToken(req) {
  const header = req?.headers?.authorization || req?.headers?.Authorization || '';
  const value = Array.isArray(header) ? header[0] : header;
  const match = String(value || '').match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : '';
}

export function getSessionFromRequest(req) {
  return verifyCustomerSession(readBearerToken(req));
}

function authResult(customer) {
  const mapped = publicCustomer(customer);
  return {
    token: signCustomerSession({
      customerId: mapped.id,
      email: mapped.email,
    }),
    customer: mapped,
  };
}

async function findCustomerByEmail(email) {
  const list = await wooRestRequest('/customers', {
    query: { email, role: 'all', per_page: 5 },
  });
  if (!Array.isArray(list) || !list.length) return null;
  const normalized = normalizeEmail(email);
  return (
    list.find((item) => normalizeEmail(item?.email) === normalized) || list[0]
  );
}

async function getCustomerById(customerId) {
  const id = Number(customerId);
  if (!Number.isInteger(id) || id <= 0) {
    throw httpError('ไม่พบข้อมูลบัญชี', 404);
  }
  try {
    return await wooRestRequest(`/customers/${id}`);
  } catch (err) {
    if (err?.status === 404) {
      throw httpError('ไม่พบข้อมูลบัญชี', 404);
    }
    throw err;
  }
}

async function verifyPasswordWithJwt(origin, username, password) {
  const response = await fetch(`${origin}/wp-json/jwt-auth/v1/token`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
    cache: 'no-store',
  });
  if (response.status === 404) return { ok: false, unavailable: true };
  const data = await parseJsonResponse(response);
  if (!response.ok) {
    return { ok: false, unavailable: false };
  }
  return { ok: true, data };
}

async function verifyPasswordWithXmlRpc(origin, username, password) {
  const xml = `<?xml version="1.0"?>
<methodCall>
  <methodName>wp.getUsersBlogs</methodName>
  <params>
    <param><value><string>${escapeXml(username)}</string></value></param>
    <param><value><string>${escapeXml(password)}</string></value></param>
  </params>
</methodCall>`;

  const response = await fetch(`${origin}/xmlrpc.php`, {
    method: 'POST',
    headers: {
      Accept: 'text/xml, application/xml, */*',
      'Content-Type': 'text/xml',
    },
    body: xml,
    cache: 'no-store',
  });

  if (response.status === 404 || response.status === 405) {
    return { ok: false, unavailable: true };
  }

  const text = await response.text();
  if (!response.ok) {
    return { ok: false, unavailable: /xmlrpc/i.test(text) };
  }
  if (/<name>faultString<\/name>/i.test(text) || /<name>faultCode<\/name>/i.test(text)) {
    return { ok: false, unavailable: false };
  }
  if (/methodResponse/i.test(text)) {
    return { ok: true };
  }
  return { ok: false, unavailable: true };
}

async function verifyPasswordWithWpBasic(origin, username, password) {
  const response = await fetch(`${origin}/wp-json/wp/v2/users/me`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
    },
    cache: 'no-store',
  });
  if (response.status === 401 || response.status === 403) {
    return { ok: false, unavailable: false };
  }
  if (response.status === 404) {
    return { ok: false, unavailable: true };
  }
  if (!response.ok) {
    return { ok: false, unavailable: true };
  }
  return { ok: true };
}

async function verifyCustomerPassword(email, password) {
  const { url } = requireWooCredentials();
  const origin = resolveWooSiteOrigin(url);
  const usernames = [email];
  const customer = await findCustomerByEmail(email);
  if (customer?.username && !usernames.includes(customer.username)) {
    usernames.push(String(customer.username));
  }

  let sawAvailableMethod = false;

  for (const username of usernames) {
    const jwt = await verifyPasswordWithJwt(origin, username, password);
    if (!jwt.unavailable) sawAvailableMethod = true;
    if (jwt.ok) return { ok: true, customer };

    const xmlrpc = await verifyPasswordWithXmlRpc(origin, username, password);
    if (!xmlrpc.unavailable) sawAvailableMethod = true;
    if (xmlrpc.ok) return { ok: true, customer };

    const basic = await verifyPasswordWithWpBasic(origin, username, password);
    if (!basic.unavailable) sawAvailableMethod = true;
    if (basic.ok) return { ok: true, customer };
  }

  if (!sawAvailableMethod) {
    throw httpError(
      'ยังไม่สามารถยืนยันรหัสผ่านกับ WordPress ได้ (ต้องเปิด JWT Auth หรือ XML-RPC)',
      503,
    );
  }

  return { ok: false, customer };
}

export async function registerCustomer(input) {
  const email = normalizeEmail(input?.email);
  const password = String(input?.password || '');
  const firstName = String(input?.firstName || input?.first_name || '').trim();
  const lastName = String(input?.lastName || input?.last_name || '').trim();

  if (!isValidEmail(email)) {
    throw httpError('กรุณากรอกอีเมลให้ถูกต้อง', 400);
  }
  if (password.length < 8) {
    throw httpError('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร', 400);
  }

  const existing = await findCustomerByEmail(email);
  if (existing) {
    throw httpError('อีเมลนี้ถูกใช้สมัครแล้ว', 409);
  }

  try {
    const created = await wooRestRequest('/customers', {
      method: 'POST',
      body: {
        email,
        username: email,
        password,
        first_name: firstName,
        last_name: lastName,
        billing: {
          email,
          first_name: firstName,
          last_name: lastName,
        },
      },
    });
    return authResult(created);
  } catch (err) {
    const code = err?.data?.code || err?.data?.data?.code;
    if (
      err?.status === 400 &&
      (code === 'registration-error-email-exists' ||
        code === 'woocommerce_rest_customer_invalid_email' ||
        /exist|already/i.test(err.message))
    ) {
      throw httpError('อีเมลนี้ถูกใช้สมัครแล้ว', 409);
    }

    if (err?.status === 400 && /username/i.test(err.message || '')) {
      const local =
        email.split('@')[0].replace(/[^a-zA-Z0-9._-]/g, '') || 'customer';
      const username = `${local}${Date.now().toString().slice(-4)}`;
      const created = await wooRestRequest('/customers', {
        method: 'POST',
        body: {
          email,
          username,
          password,
          first_name: firstName,
          last_name: lastName,
          billing: {
            email,
            first_name: firstName,
            last_name: lastName,
          },
        },
      });
      return authResult(created);
    }
    throw err;
  }
}

export async function loginCustomer(input) {
  const email = normalizeEmail(input?.email);
  const password = String(input?.password || '');

  if (!isValidEmail(email) || !password) {
    throw httpError('กรุณากรอกอีเมลและรหัสผ่าน', 400);
  }

  const verified = await verifyCustomerPassword(email, password);
  if (!verified.ok) {
    throw httpError('อีเมลหรือรหัสผ่านไม่ถูกต้อง', 401);
  }

  const customer =
    verified.customer || (await findCustomerByEmail(email));
  if (!customer) {
    throw httpError('ไม่พบบัญชีลูกค้าใน WooCommerce สำหรับอีเมลนี้', 404);
  }

  return authResult(customer);
}

export async function getAuthenticatedCustomer(req) {
  const session = getSessionFromRequest(req);
  if (!session) {
    throw httpError('กรุณาเข้าสู่ระบบ', 401);
  }
  const customer = await getCustomerById(session.customerId);
  if (normalizeEmail(customer.email) !== session.email) {
    throw httpError('กรุณาเข้าสู่ระบบอีกครั้ง', 401);
  }
  return publicCustomer(customer);
}

export async function getAuthenticatedOrders(req) {
  const session = getSessionFromRequest(req);
  if (!session) {
    throw httpError('กรุณาเข้าสู่ระบบ', 401);
  }

  const list = await wooRestRequest('/orders', {
    query: {
      customer: String(session.customerId),
      per_page: 20,
      orderby: 'date',
      order: 'desc',
    },
  });

  return Array.isArray(list) ? list.map(publicOrder) : [];
}

export async function updateCustomerBilling(req, billingInput) {
  const session = getSessionFromRequest(req);
  if (!session) {
    throw httpError('กรุณาเข้าสู่ระบบ', 401);
  }
  const src = billingInput && typeof billingInput === 'object' ? billingInput : {};
  const billing = {
    first_name: String(src.first_name || '').trim(),
    last_name: String(src.last_name || '').trim(),
    email: String(src.email || session.email || '').trim(),
    phone: String(src.phone || '').trim(),
    address_1: String(src.address_1 || '').trim(),
    address_2: String(src.address_2 || '').trim(),
    city: String(src.city || '').trim(),
    state: String(src.state || '').trim(),
    postcode: String(src.postcode || '').trim(),
    country: String(src.country || 'TH').trim() || 'TH',
  };
  const updated = await wooRestRequest(`/customers/${session.customerId}`, {
    method: 'PUT',
    body: { billing },
  });
  return publicCustomer(updated);
}

export async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  return JSON.parse(raw);
}
