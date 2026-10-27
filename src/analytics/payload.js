const PII_KEY = /email|e-mail|phone|tel|mobile|address|first_?name|last_?name|full_?name|customer|billing|shipping|postal|postcode|zip/i;
const EMAIL_VALUE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MEASUREMENT_ID = /^G-[A-Z0-9]+$/;
const SENSITIVE_QUERY = /^(session_id|email|phone|tel|name|address|token|code|state)$/i;

export function isMeasurementId(value) {
  return MEASUREMENT_ID.test(String(value || '').trim());
}

export function safePageFromHref(href, title = 'BAZOOKA') {
  const url = new URL(href);
  const kept = new URLSearchParams();
  for (const [key, value] of url.searchParams) {
    if (SENSITIVE_QUERY.test(key) || PII_KEY.test(key)) continue;
    if (EMAIL_VALUE.test(value)) continue;
    kept.append(key, value);
  }
  const search = kept.toString();
  return {
    page_path: `${url.pathname}${search ? `?${search}` : ''}`,
    page_location: `${url.origin}${url.pathname}${search ? `?${search}` : ''}`,
    page_title: title || 'BAZOOKA',
  };
}

export function safePageLocation() {
  return safePageFromHref(window.location.href, document.title);
}

export function toAnalyticsItem(item, quantity = item?.quantity) {
  const itemId = String(item?.id ?? '').trim();
  if (!/^\d+$/.test(itemId)) return null;
  const price = Number(item?.price);
  const qty = Number(quantity);
  return {
    item_id: itemId,
    item_name: String(item?.name || 'สินค้า').replace(/\s+/g, ' ').trim().slice(0, 120) || 'สินค้า',
    price: Number.isFinite(price) ? price : 0,
    quantity: Number.isFinite(qty) && qty > 0 ? qty : 1,
  };
}

function stripPii(value, key = '') {
  if (PII_KEY.test(key)) return undefined;
  if (typeof value === 'string') {
    if (EMAIL_VALUE.test(value.trim())) return undefined;
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((entry) => stripPii(entry)).filter((entry) => entry !== undefined);
  }
  if (!value || typeof value !== 'object') return value;

  const next = {};
  for (const [childKey, childValue] of Object.entries(value)) {
    const cleaned = stripPii(childValue, childKey);
    if (cleaned !== undefined) next[childKey] = cleaned;
  }
  return next;
}

export function sanitizeAnalyticsParams(params) {
  const cleaned = stripPii(params);
  return cleaned && typeof cleaned === 'object' && !Array.isArray(cleaned) ? cleaned : {};
}
