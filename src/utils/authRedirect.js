export const CHECKOUT_PATH = '/checkout';

/** Same-site path from `?next=`, or null. Rejects "//host" and "/\host" (both leave the site). */
export function readNextPath(search) {
  const next = new URLSearchParams(search).get('next');
  if (next && /^\/(?![/\\])[^\\\s]*$/.test(next)) return next;
  return null;
}

function withNext(base, next) {
  return next ? `${base}?next=${encodeURIComponent(next)}` : base;
}

export function loginPath(next) {
  return withNext('/login', next);
}

export function registerPath(next) {
  return withNext('/register', next);
}
