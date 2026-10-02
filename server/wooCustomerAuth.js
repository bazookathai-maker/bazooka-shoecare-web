/**
 * Server-only WooCommerce customer auth (register / login / profile / orders).
 * Consumer key/secret never leave this module.
 * Never import from browser/client code.
 */

import crypto from 'node:crypto';
import { signToken, verifyToken } from './authTokens.js';

const DEFAULT_WOO_HOST = 'https://bazookashoecare.com';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;
// Long enough to finish a WordPress password reset email round-trip.
const GOOGLE_LINK_TTL_SECONDS = 30 * 60;
const SENSITIVE_PLACEHOLDER = /^\[SENSITIVE]$/i;
// WooCommerce REST silently drops "_"-prefixed (protected) meta on write and hides it on read.
export const GOOGLE_SUB_META_KEY = 'bazooka_google_sub';
const MAX_FIELD_LENGTH = 200;

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

function publicAddress(address) {
  const src = address && typeof address === 'object' ? address : {};
  return {
    first_name: String(src.first_name || '').trim(),
    last_name: String(src.last_name || '').trim(),
    phone: String(src.phone || '').trim(),
    address_1: String(src.address_1 || '').trim(),
    address_2: String(src.address_2 || '').trim(),
    city: String(src.city || '').trim(),
    state: String(src.state || '').trim(),
    postcode: String(src.postcode || '').trim(),
    country: String(src.country || 'TH').trim() || 'TH',
  };
}

function isAddressComplete(address) {
  return Boolean(
    address.first_name &&
      address.last_name &&
      address.phone &&
      address.address_1 &&
      address.city &&
      address.state &&
      address.postcode,
  );
}

function getCustomerMeta(customer, key) {
  const meta = Array.isArray(customer?.meta_data) ? customer.meta_data : [];
  const hit = meta.find((item) => item?.key === key);
  return hit && hit.value != null ? String(hit.value).trim() : '';
}

function publicCustomer(customer) {
  const billing = publicAddress(customer?.billing);
  return {
    id: Number(customer.id),
    email: String(customer.email || '').trim(),
    username: String(customer.username || '').trim(),
    first_name: String(customer.first_name || '').trim(),
    last_name: String(customer.last_name || '').trim(),
    billing,
    shipping: publicAddress(customer?.shipping),
    google_linked: Boolean(getCustomerMeta(customer, GOOGLE_SUB_META_KEY)),
    profile_complete: isAddressComplete(billing),
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
  return signToken(
    'session',
    { sub: Number(customerId), email: normalizeEmail(email) },
    SESSION_TTL_SECONDS,
  );
}

export function verifyCustomerSession(token) {
  const data = verifyToken(token, 'session');
  if (!data) return null;
  const customerId = Number(data.sub);
  const email = normalizeEmail(data.email);
  if (!Number.isInteger(customerId) || customerId <= 0) return null;
  if (!email) return null;
  return { customerId, email };
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
  return list.find((item) => normalizeEmail(item?.email) === normalized) || null;
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

function issueGoogleLinkTicket(identity) {
  return signToken(
    'glink',
    { gsub: identity.sub, email: normalizeEmail(identity.email) },
    GOOGLE_LINK_TTL_SECONDS,
  );
}

async function setCustomerGoogleSub(customerId, googleSub) {
  const updated = await wooRestRequest(`/customers/${Number(customerId)}`, {
    method: 'PUT',
    body: { meta_data: [{ key: GOOGLE_SUB_META_KEY, value: googleSub }] },
  });
  if (getCustomerMeta(updated, GOOGLE_SUB_META_KEY) !== googleSub) {
    throw httpError('บันทึกการเชื่อมบัญชี Google ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง', 502);
  }
  return updated;
}

export function getPasswordResetUrl() {
  const { url } = getServerCredentials();
  return `${resolveWooSiteOrigin(url)}/wp-login.php?action=lostpassword`;
}

export async function loginCustomer(input) {
  const email = normalizeEmail(input?.email);
  const password = String(input?.password || '');
  const rawLinkTicket = String(input?.googleLinkTicket || '').trim();

  if (!isValidEmail(email) || !password) {
    throw httpError('กรุณากรอกอีเมลและรหัสผ่าน', 400);
  }

  let link = null;
  if (rawLinkTicket) {
    link = verifyToken(rawLinkTicket, 'glink');
    if (!link || typeof link.gsub !== 'string' || !link.gsub) {
      throw httpError(
        'คำขอเชื่อมบัญชี Google หมดอายุ กรุณากด "เข้าสู่ระบบด้วย Google" ใหม่อีกครั้ง',
        400,
        { code: 'google_link_expired' },
      );
    }
    if (normalizeEmail(link.email) !== email) {
      throw httpError('อีเมลไม่ตรงกับบัญชี Google ที่ต้องการเชื่อม', 400);
    }
  }

  const verified = await verifyCustomerPassword(email, password);
  if (!verified.ok) {
    throw httpError('อีเมลหรือรหัสผ่านไม่ถูกต้อง', 401);
  }

  let customer =
    verified.customer || (await findCustomerByEmail(email));
  if (!customer) {
    throw httpError('ไม่พบบัญชีลูกค้าใน WooCommerce สำหรับอีเมลนี้', 404);
  }

  if (link) {
    const existingSub = getCustomerMeta(customer, GOOGLE_SUB_META_KEY);
    if (existingSub && existingSub !== link.gsub) {
      throw httpError('บัญชีนี้เชื่อมกับบัญชี Google อื่นอยู่แล้ว', 409);
    }
    if (!existingSub) {
      customer = await setCustomerGoogleSub(customer.id, link.gsub);
    }
  }

  return authResult(customer);
}

function generateUsername(email) {
  const local = email.split('@')[0].replace(/[^a-zA-Z0-9._-]/g, '') || 'customer';
  return `${local.slice(0, 40)}${crypto.randomInt(1000, 9999)}`;
}

/**
 * Sign in with a Google identity that googleAuth.verifyGoogleIdToken already
 * verified. The link key is the Google `sub`; a matching email alone never
 * merges into an existing account — the owner must prove the password first.
 */
export async function loginWithGoogleIdentity(identity) {
  const googleSub = String(identity?.sub || '').trim();
  const email = normalizeEmail(identity?.email);
  if (!googleSub || !isValidEmail(email)) {
    throw httpError('ข้อมูลบัญชี Google ไม่ถูกต้อง', 400);
  }

  const existing = await findCustomerByEmail(email);
  if (existing) {
    const linkedSub = getCustomerMeta(existing, GOOGLE_SUB_META_KEY);
    if (linkedSub && linkedSub === googleSub) {
      return { ...authResult(existing), isNew: false };
    }
    if (linkedSub) {
      throw httpError('อีเมลนี้เชื่อมกับบัญชี Google อื่นอยู่แล้ว', 409, {
        code: 'google_account_mismatch',
      });
    }
    throw httpError(
      'พบบัญชีเดิมที่ใช้อีเมลนี้ กรุณาเข้าสู่ระบบด้วยรหัสผ่านของบัญชีเดิมเพื่อยืนยันก่อนเชื่อมกับ Google',
      409,
      {
        code: 'google_link_required',
        email,
        linkTicket: issueGoogleLinkTicket({ sub: googleSub, email }),
      },
    );
  }

  const firstName = limitText(identity?.givenName);
  const lastName = limitText(identity?.familyName);
  const baseBody = {
    email,
    // Random password: Google accounts sign in via Google; WordPress
    // "lost password" still lets the owner set one later.
    password: crypto.randomBytes(24).toString('base64url'),
    first_name: firstName,
    last_name: lastName,
    billing: { email, first_name: firstName, last_name: lastName },
    meta_data: [{ key: GOOGLE_SUB_META_KEY, value: googleSub }],
  };

  let created;
  try {
    created = await wooRestRequest('/customers', {
      method: 'POST',
      body: { ...baseBody, username: email },
    });
  } catch (err) {
    if (err?.status === 400 && /username/i.test(err.message || '')) {
      created = await wooRestRequest('/customers', {
        method: 'POST',
        body: { ...baseBody, username: generateUsername(email) },
      });
    } else {
      throw err;
    }
  }
  if (getCustomerMeta(created, GOOGLE_SUB_META_KEY) !== googleSub) {
    try {
      created = await setCustomerGoogleSub(created.id, googleSub);
    } catch {
      console.warn('[google-auth] new customer created but Google link was not persisted');
    }
  }
  return { ...authResult(created), isNew: true };
}

/** Load the session's own Woo customer; never trusts ids from the browser. */
async function requireSessionCustomer(req) {
  const session = getSessionFromRequest(req);
  if (!session) {
    throw httpError('กรุณาเข้าสู่ระบบ', 401);
  }
  const customer = await getCustomerById(session.customerId);
  if (normalizeEmail(customer.email) !== session.email) {
    throw httpError('กรุณาเข้าสู่ระบบอีกครั้ง', 401);
  }
  return { session, customer };
}

export async function getAuthenticatedCustomer(req) {
  const { customer } = await requireSessionCustomer(req);
  return publicCustomer(customer);
}

export async function getAuthenticatedOrders(req) {
  const { session } = await requireSessionCustomer(req);

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

function limitText(value) {
  return String(value ?? '')
    .replace(/\p{Cc}/gu, ' ')
    .trim()
    .slice(0, MAX_FIELD_LENGTH);
}

/**
 * Sanitize + validate a Thai address from the browser. Returns the Woo address
 * shape (no email). Throws 400 with a Thai message on invalid input.
 */
function sanitizeProfileAddress(input) {
  const src = input && typeof input === 'object' ? input : {};
  const phoneDigits = String(src.phone || '').replace(/\D/g, '');
  const address = {
    first_name: limitText(src.first_name),
    last_name: limitText(src.last_name),
    company: '',
    phone: phoneDigits,
    address_1: limitText(src.address_1),
    address_2: limitText(src.address_2),
    city: limitText(src.city),
    state: limitText(src.state).toUpperCase(),
    postcode: String(src.postcode || '').replace(/\s/g, ''),
    country: 'TH',
  };

  if (!address.first_name || !address.last_name) {
    throw httpError('กรุณากรอกชื่อและนามสกุล', 400);
  }
  if (phoneDigits.length < 9 || phoneDigits.length > 10) {
    throw httpError('เบอร์โทรศัพท์ต้องมี 9–10 หลัก', 400);
  }
  if (!address.address_1 || !address.city) {
    throw httpError('กรุณากรอกที่อยู่ให้ครบ', 400);
  }
  if (!/^TH-\d{2}$/.test(address.state)) {
    throw httpError('กรุณาเลือกจังหวัดให้ถูกต้อง', 400);
  }
  if (!/^\d{5}$/.test(address.postcode)) {
    throw httpError('รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก', 400);
  }
  return address;
}

/**
 * Save name / phone / address for the signed-in customer only.
 * The target id comes from the verified session, never from the request body.
 */
export async function updateCustomerProfile(req, input) {
  const { customer } = await requireSessionCustomer(req);
  const address = sanitizeProfileAddress(input?.address ?? input);
  const accountEmail = String(customer.email || '').trim();

  const updated = await wooRestRequest(`/customers/${Number(customer.id)}`, {
    method: 'PUT',
    body: {
      first_name: address.first_name,
      last_name: address.last_name,
      billing: { ...address, email: accountEmail },
      shipping: address,
    },
  });
  return publicCustomer(updated);
}

/**
 * After a signed-in checkout, remember the address the customer actually used
 * (only when they opted in). Billing email stays the account email.
 */
export async function saveCustomerAddressesFromOrder(session, shippingInput) {
  if (!session?.customerId) return null;
  const customer = await getCustomerById(session.customerId);
  if (normalizeEmail(customer.email) !== session.email) return null;

  const address = sanitizeProfileAddress(shippingInput);
  const body = {
    billing: { ...address, email: String(customer.email || '').trim() },
    shipping: address,
  };
  if (!String(customer.first_name || '').trim()) body.first_name = address.first_name;
  if (!String(customer.last_name || '').trim()) body.last_name = address.last_name;

  const updated = await wooRestRequest(`/customers/${Number(customer.id)}`, {
    method: 'PUT',
    body,
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
