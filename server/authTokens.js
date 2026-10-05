/**
 * Server-only signed tokens + cookie helpers for customer auth.
 * Signed with AUTH_SESSION_SECRET only (never the WooCommerce secret).
 * Never import from browser/client code.
 */

import crypto from 'node:crypto';

const SENSITIVE_PLACEHOLDER = /^\[SENSITIVE]$/i;
const MIN_SECRET_LENGTH = 32;

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

function getAuthSecret() {
  const secret = cleanEnvValue(process.env.AUTH_SESSION_SECRET);
  if (!secret || secret.length < MIN_SECRET_LENGTH) {
    throw httpError(
      'ยังไม่ได้ตั้งค่า AUTH_SESSION_SECRET บนเซิร์ฟเวอร์ (อย่างน้อย 32 ตัวอักษร)',
      500,
    );
  }
  return secret;
}

function hmac(secret, payload) {
  return crypto.createHmac('sha256', secret).update(payload).digest('base64url');
}

export function safeEqual(a, b) {
  const left = Buffer.from(String(a ?? ''));
  const right = Buffer.from(String(b ?? ''));
  if (left.length !== right.length || left.length === 0) return false;
  return crypto.timingSafeEqual(left, right);
}

/**
 * Sign `{ typ, exp, ...claims }`. `typ` separates sessions, link tickets and
 * nonce cookies so one kind can never be replayed as another.
 */
export function signToken(typ, claims, ttlSeconds) {
  const secret = getAuthSecret();
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = Buffer.from(
    JSON.stringify({ ...claims, typ, exp }),
  ).toString('base64url');
  return `${payload}.${hmac(secret, payload)}`;
}

/** Returns claims or null. Never throws for bad input. */
export function verifyToken(token, expectedTyp) {
  const parts = String(token || '').trim().split('.');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;

  let secret;
  try {
    secret = getAuthSecret();
  } catch {
    return null;
  }

  if (!safeEqual(parts[1], hmac(secret, parts[0]))) return null;

  try {
    const data = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
    if (!data || data.typ !== expectedTyp) return null;
    const exp = Number(data.exp);
    if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return null;
    return data;
  } catch {
    return null;
  }
}

export function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('base64url');
}

export function readCookie(req, name) {
  const header = String(req?.headers?.cookie || '');
  for (const part of header.split(';')) {
    const index = part.indexOf('=');
    if (index < 0) continue;
    if (part.slice(0, index).trim() !== name) continue;
    try {
      return decodeURIComponent(part.slice(index + 1).trim());
    } catch {
      return '';
    }
  }
  return '';
}

function isHttpsRequest(req) {
  const proto = String(req?.headers?.['x-forwarded-proto'] || '')
    .split(',')[0]
    .trim()
    .toLowerCase();
  if (proto) return proto === 'https';
  return Boolean(req?.socket?.encrypted);
}

export function buildCookie(req, name, value, { maxAge, path = '/' } = {}) {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    `Path=${path}`,
    'HttpOnly',
    'SameSite=Strict',
    `Max-Age=${Math.max(0, Math.floor(maxAge ?? 0))}`,
  ];
  if (isHttpsRequest(req)) parts.push('Secure');
  return parts.join('; ');
}

function requestHost(req) {
  return String(req?.headers?.['x-forwarded-host'] || req?.headers?.host || '')
    .split(',')[0]
    .trim()
    .toLowerCase();
}

/**
 * Reject cross-site state-changing auth requests: JSON body + custom header
 * force a CORS preflight (which this API never approves), and Origin — when
 * the browser sends it — must be this host.
 */
export function assertSameOriginJsonRequest(req) {
  const contentType = String(req?.headers?.['content-type'] || '').toLowerCase();
  const marker = String(req?.headers?.['x-bazooka-auth'] || '');
  if (!contentType.startsWith('application/json') || marker !== '1') {
    throw httpError('คำขอไม่ถูกต้อง', 403);
  }
  const origin = String(req?.headers?.origin || '').trim();
  if (origin) {
    const originHost = hostOf(origin);
    if (!originHost || originHost !== requestHost(req)) {
      throw httpError('คำขอไม่ถูกต้อง', 403);
    }
  }
}

function hostOf(url) {
  try {
    return new URL(url).host.toLowerCase();
  } catch {
    return '';
  }
}
