/**
 * Server-only Google Identity Services (Sign in with Google) verification.
 * Reads GOOGLE_CLIENT_ID. Never import from browser/client code.
 */

import googleAuthLibrary from 'google-auth-library';
import {
  buildCookie,
  randomToken,
  readCookie,
  safeEqual,
  signToken,
  verifyToken,
} from './authTokens.js';

const { OAuth2Client } = googleAuthLibrary;

const GOOGLE_ISSUERS = new Set(['accounts.google.com', 'https://accounts.google.com']);
const NONCE_COOKIE = 'bz_gnonce';
const NONCE_COOKIE_PATH = '/api/auth';
const NONCE_TTL_SECONDS = 10 * 60;
const MAX_ID_TOKEN_LENGTH = 8192;

let cachedClient = null;

function httpError(message, status, data) {
  const err = new Error(message);
  err.status = status;
  err.data = data;
  return err;
}

export function getGoogleClientId() {
  const raw = String(process.env.GOOGLE_CLIENT_ID || '').trim();
  if (!raw || !raw.endsWith('.apps.googleusercontent.com')) return '';
  return raw;
}

function getClient() {
  if (!cachedClient) cachedClient = new OAuth2Client();
  return cachedClient;
}

/**
 * Issue a single-use nonce for the GIS button. The browser gets the raw nonce
 * (passed to google.accounts.id.initialize); an HttpOnly SameSite=Strict cookie
 * holds a signed copy so only this browser can redeem the resulting ID token.
 */
export function issueGoogleNonce(req) {
  const nonce = randomToken(32);
  const cookieValue = signToken('gnonce', { n: nonce }, NONCE_TTL_SECONDS);
  return {
    nonce,
    setCookie: buildCookie(req, NONCE_COOKIE, cookieValue, {
      maxAge: NONCE_TTL_SECONDS,
      path: NONCE_COOKIE_PATH,
    }),
  };
}

export function readGoogleNonce(req) {
  const claims = verifyToken(readCookie(req, NONCE_COOKIE), 'gnonce');
  return claims && typeof claims.n === 'string' ? claims.n : '';
}

export function clearGoogleNonceCookie(req) {
  return buildCookie(req, NONCE_COOKIE, '', { maxAge: 0, path: NONCE_COOKIE_PATH });
}

/**
 * Verify a GIS credential (ID token). google-auth-library checks the RS256
 * signature against Google's certs plus aud / iss / exp; the explicit checks
 * below keep those guarantees even if library defaults change.
 */
export async function verifyGoogleIdToken(idToken, expectedNonce) {
  const clientId = getGoogleClientId();
  if (!clientId) {
    throw httpError('ยังไม่ได้เปิดใช้การเข้าสู่ระบบด้วย Google', 503);
  }

  const token = typeof idToken === 'string' ? idToken.trim() : '';
  if (!token || token.length > MAX_ID_TOKEN_LENGTH) {
    throw httpError('ข้อมูลการเข้าสู่ระบบด้วย Google ไม่ถูกต้อง', 400);
  }
  if (!expectedNonce) {
    throw httpError('เซสชันเข้าสู่ระบบด้วย Google หมดอายุ กรุณาลองใหม่อีกครั้ง', 401);
  }

  let payload;
  try {
    const ticket = await getClient().verifyIdToken({ idToken: token, audience: clientId });
    payload = ticket.getPayload();
  } catch {
    throw httpError('ยืนยันตัวตนกับ Google ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง', 401);
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (
    !payload ||
    !GOOGLE_ISSUERS.has(payload.iss) ||
    payload.aud !== clientId ||
    !Number.isFinite(payload.exp) ||
    payload.exp <= nowSeconds ||
    typeof payload.sub !== 'string' ||
    !payload.sub
  ) {
    throw httpError('ยืนยันตัวตนกับ Google ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง', 401);
  }

  if (!safeEqual(payload.nonce, expectedNonce)) {
    throw httpError('เซสชันเข้าสู่ระบบด้วย Google หมดอายุ กรุณาลองใหม่อีกครั้ง', 401);
  }

  if (payload.email_verified !== true || !payload.email) {
    throw httpError('อีเมลของบัญชี Google นี้ยังไม่ได้รับการยืนยัน', 403);
  }

  return {
    sub: payload.sub,
    email: String(payload.email).trim().toLowerCase(),
    givenName: String(payload.given_name || '').trim(),
    familyName: String(payload.family_name || '').trim(),
  };
}
