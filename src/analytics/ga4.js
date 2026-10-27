import { readAnalyticsConsent } from './consent';
import {
  isMeasurementId,
  safePageLocation,
  sanitizeAnalyticsParams,
  toAnalyticsItem,
} from './payload';

const MEASUREMENT_ID = String(import.meta.env.VITE_GA_MEASUREMENT_ID || '').trim();
const PURCHASE_PREFIX = 'bazooka-ga-purchase:';

let lastPage = { key: '', at: 0 };
let configured = false;
const recentEvents = new Map();

function isDuplicate(key) {
  const now = Date.now();
  const previous = recentEvents.get(key) || 0;
  if (now - previous < 800) return true;
  recentEvents.set(key, now);
  return false;
}

function measurementId() {
  return isMeasurementId(MEASUREMENT_ID) ? MEASUREMENT_ID : '';
}

function remember(kind, name, params) {
  if (!import.meta.env.DEV || typeof window === 'undefined') return;
  const log = (window.__BAZOOKA_ANALYTICS__ ||= { sent: [], blocked: [] });
  log[kind].push({ name, params });
}

function canSend() {
  return readAnalyticsConsent() === 'granted' && Boolean(measurementId());
}

function ensureAnalytics() {
  const id = measurementId();
  if (!id || readAnalyticsConsent() !== 'granted' || configured) return configured;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', id, {
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(script);
  configured = true;
  return true;
}

function send(name, params) {
  const safe = sanitizeAnalyticsParams(params);
  if (!canSend()) {
    remember('blocked', name, safe);
    return false;
  }
  ensureAnalytics();
  window.gtag('event', name, safe);
  remember('sent', name, safe);
  return true;
}

export function analyticsMeasurementId() {
  return measurementId();
}

export function trackPageView() {
  const page = safePageLocation();
  const now = Date.now();
  if (lastPage.key === page.page_path && now - lastPage.at < 800) return false;
  lastPage = { key: page.page_path, at: now };
  return send('page_view', page);
}

export function trackViewItem(product) {
  const item = toAnalyticsItem(product, 1);
  if (!item || isDuplicate(`view_item:${item.item_id}`)) return false;
  return send('view_item', {
    currency: product.currency || 'THB',
    value: item.price,
    items: [item],
  });
}

export function trackAddToCart(product) {
  const item = toAnalyticsItem(product, 1);
  if (!item) return false;
  return send('add_to_cart', {
    currency: product.currency || 'THB',
    value: item.price,
    items: [item],
  });
}

export function trackBeginCheckout({ value, currency = 'THB', items = [] }) {
  const safeItems = items.map((item) => toAnalyticsItem(item)).filter(Boolean);
  if (safeItems.length === 0) return false;
  const amount = Number(value);
  return send('begin_checkout', {
    currency,
    value: Number.isFinite(amount) ? amount : safeItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    items: safeItems,
  });
}

export function trackPurchase({ transactionId, value, currency = 'THB' }) {
  const id = String(transactionId || '').trim();
  const amount = Number(value);
  if (!id || !Number.isFinite(amount)) return false;
  const key = `${PURCHASE_PREFIX}${id}`;
  try {
    if (sessionStorage.getItem(key) === '1') return false;
  } catch {
    /* ignore */
  }
  const sent = send('purchase', {
    transaction_id: id,
    value: amount,
    currency: currency || 'THB',
  });
  if (!sent) return false;
  try {
    sessionStorage.setItem(key, '1');
  } catch {
    /* ignore */
  }
  return true;
}
