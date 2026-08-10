import { resolveThaiWooStateCode } from '../data/thaiWooStates';

const CART_TOKEN_STORAGE_KEY = 'bazooka_cart_token';
const CART_NONCE_STORAGE_KEY = 'bazooka_cart_nonce';

/**
 * Store API root (cart / checkout session):
 * Always same-origin `/api` so the browser never calls `/wp-json` on the Vercel host
 * (that returns 403 / Failed to fetch).
 * - DEV: Vite middleware/proxy → WordPress Store API
 * - PROD: Vercel `/api/cart` rewrite → `/api/cart-proxy` → WordPress Store API
 * - Override: VITE_WC_STORE_API_URL (public URL only — never secrets)
 */
function resolveStoreApiRoot() {
  const fromEnv = import.meta.env.VITE_WC_STORE_API_URL;
  if (typeof fromEnv === 'string' && fromEnv.trim()) {
    return fromEnv.replace(/\/$/, '');
  }
  return '/api';
}

const STORE_API_ROOT = resolveStoreApiRoot();
const STORE_CART_URL = `${STORE_API_ROOT}/cart`;
const STORE_CHECKOUT_URL = `${STORE_API_ROOT}/checkout`;
/** Same-origin serverless routes — secrets never leave the server. */
const CREATE_ORDER_API_URL = '/api/create-order';
const PRODUCTS_API_URL = '/api/products';

export function getStoreApiRoot() {
  return STORE_API_ROOT;
}

/** Always true for client — configuration lives on the server (WOOCOMMERCE_*). */
export function isRestOrderConfigured() {
  return true;
}

/** Phase test gateways only — never Omise/card/PromptPay in this phase. */
const TEST_PAYMENT_METHOD_PRIORITY = ['bacs', 'cod'];

const TEST_PAYMENT_METHOD_LABELS = {
  bacs: 'โอนเงินผ่านธนาคาร',
  cod: 'เก็บเงินปลายทาง',
};

/** Static test payment options for REST order create (does not depend on Store API). */
export function getRestTestPaymentOptions() {
  return TEST_PAYMENT_METHOD_PRIORITY.map((id) => ({
    id,
    label: TEST_PAYMENT_METHOD_LABELS[id] || id,
  }));
}

/** Filter/tab labels for existing Products UI (derived from Woo name/tags). */
const CATEGORY_LABELS = {
  cleaners: 'ทำความสะอาด',
  protectors: 'ปกป้อง',
  refresh: 'ฟื้นฟู',
  brushes: 'อุปกรณ์',
  kits: 'ชุดสุดคุ้ม',
};

function stripHtml(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/\s+/g, ' ')
    .trim();
}

function mapPrice(prices, field = 'price') {
  const minorUnit = Number(prices?.currency_minor_unit ?? 2);
  const raw = Number(prices?.[field] ?? prices?.price ?? 0);
  if (!Number.isFinite(raw)) return 0;
  return raw / 10 ** minorUnit;
}

function readStorage(key) {
  try {
    return localStorage.getItem(key) || '';
  } catch {
    return '';
  }
}

function writeStorage(key, value) {
  if (!value) return;
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore storage failures (private mode, quota, etc.)
  }
}

export function getCartToken() {
  return readStorage(CART_TOKEN_STORAGE_KEY);
}

export function setCartToken(token) {
  writeStorage(CART_TOKEN_STORAGE_KEY, token);
}

function getCartNonce() {
  return readStorage(CART_NONCE_STORAGE_KEY);
}

function setCartNonce(nonce) {
  writeStorage(CART_NONCE_STORAGE_KEY, nonce);
}

function clearStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore storage failures
  }
}

function clearCartNonce() {
  clearStorage(CART_NONCE_STORAGE_KEY);
}

function clearCartToken() {
  clearStorage(CART_TOKEN_STORAGE_KEY);
}

/** Clear cart session headers after a successful order (cart is spent). */
export function resetCartSession() {
  clearCartToken();
  clearCartNonce();
}

export function createEmptyCartState() {
  return {
    items: [],
    count: 0,
    itemsTotal: 0,
    shippingTotal: 0,
    discountTotal: 0,
    total: 0,
    needsShipping: false,
    shippingRates: [],
    paymentMethods: [],
    billingAddress: null,
    shippingAddress: null,
    raw: null,
  };
}

function parseJwtPayload(token) {
  try {
    const payload = String(token || '').split('.')[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      '=',
    );
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

function maskCartToken(token) {
  const value = String(token || '');
  if (!value) return '(none)';
  if (value.length < 20) return '(short-token)';
  return `${value.slice(0, 10)}…${value.slice(-6)}`;
}

/** Only accept a newer (or first) Cart-Token — never regress to a stale cached token. */
function shouldReplaceCartToken(currentToken, incomingToken) {
  if (!incomingToken) return false;
  if (!currentToken) return true;
  if (currentToken === incomingToken) return false;

  const current = parseJwtPayload(currentToken);
  const incoming = parseJwtPayload(incomingToken);
  if (!incoming) return false;
  if (!current) return true;

  const currentIat = Number(current.iat || 0);
  const incomingIat = Number(incoming.iat || 0);
  if (incomingIat < currentIat) return false;

  return true;
}

function logCartSession(label, details = {}) {
  if (!import.meta.env.DEV) return;
  console.log(`[cart-session] ${label}`, {
    token: maskCartToken(details.token || getCartToken()),
    nonce: details.nonce || getCartNonce() || '(none)',
    state: details.state ?? '',
    postcode: details.postcode ?? '',
    shipping_rates: details.shipping_rates ?? null,
  });
}

/**
 * Development-only: log raw Store API shipping evidence BEFORE mapCart /
 * extractShippingPackages. Never invents or remaps rates.
 */
function logRawStoreShippingEvidence(label, rawCart, tokenMeta = {}) {
  if (!import.meta.env.DEV) return;
  console.log(`[store-api-shipping] ${label}`, {
    cart_token: maskCartToken(tokenMeta.token || getCartToken()),
    cart_token_same_as_request: tokenMeta.requestToken
      ? (tokenMeta.requestToken || '') === (getCartToken() || '')
      : undefined,
    shipping_rates: rawCart?.shipping_rates ?? null,
    shipping_address: rawCart?.shipping_address ?? null,
    billing_address: rawCart?.billing_address ?? null,
    needs_shipping: rawCart?.needs_shipping ?? null,
    has_calculated_shipping: rawCart?.has_calculated_shipping ?? null,
    items_weight: rawCart?.items_weight ?? null,
    errors: rawCart?.errors ?? null,
  });
}

function syncCartHeadersFromResponse(response) {
  const token =
    response.headers.get('Cart-Token') || response.headers.get('cart-token');
  if (shouldReplaceCartToken(getCartToken(), token)) {
    setCartToken(token);
  }

  const nonce =
    response.headers.get('Nonce') || response.headers.get('nonce');
  if (nonce) {
    setCartNonce(nonce);
  }
}

function isNonceOrAuthError(status, message) {
  if (status === 401 || status === 403) return true;
  const text = String(message || '').toLowerCase();
  return (
    text.includes('nonce') ||
    text.includes('forbidden') ||
    text.includes('not allowed') ||
    text.includes('หมดอายุ')
  );
}

async function parseCartError(response) {
  try {
    const data = await response.json();
    if (typeof data?.message === 'string' && data.message.trim()) {
      return data.message;
    }
    if (Array.isArray(data) && data[0]?.message) {
      return data[0].message;
    }
  } catch {
    // fall through
  }
  return `คำสั่งตะกร้าไม่สำเร็จ (${response.status})`;
}

function buildCartUrl(path = '') {
  const base = `${STORE_CART_URL}${path}`;
  // Bust CDN/proxy caches on cart GET — stale responses overwrite Cart-Token.
  if (!path) {
    const join = base.includes('?') ? '&' : '?';
    return `${base}${join}_=${Date.now()}`;
  }
  return base;
}

async function cartRequest(path = '', options = {}, allowRetry = true) {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  headers.set('Cache-Control', 'no-cache');
  headers.set('Pragma', 'no-cache');

  const token = getCartToken();
  if (token) {
    headers.set('Cart-Token', token);
  }

  const nonce = getCartNonce();
  if (nonce) {
    headers.set('Nonce', nonce);
  }

  const method = String(options.method || 'GET').toUpperCase();
  logCartSession(`request ${method} ${path || '/cart'}`, {
    token,
    nonce,
  });

  const response = await fetch(buildCartUrl(path), {
    ...options,
    method,
    headers,
    cache: 'no-store',
    credentials: 'include',
  });

  syncCartHeadersFromResponse(response);

  if (!response.ok) {
    const message = await parseCartError(response);
    const canRetry =
      allowRetry &&
      method !== 'GET' &&
      path !== '' &&
      isNonceOrAuthError(response.status, message);

    if (canRetry) {
      // Refresh nonce only — keep existing Cart-Token / do not open a new cart.
      clearCartNonce();
      await cartRequest('', { method: 'GET' }, false);
      return cartRequest(path, options, false);
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function mapCartItem(item) {
  const image =
    item.images?.[0]?.src ||
    item.images?.[0]?.thumbnail ||
    item.image ||
    '';
  const quantity = Number(item.quantity) || 0;
  const unitPrice = mapPrice(item.prices, 'price');
  const lineTotal = item.totals
    ? mapPrice(item.totals, 'line_total') ||
      mapPrice(item.totals, 'line_subtotal')
    : unitPrice * quantity;

  return {
    id: item.id,
    key: item.key,
    name: stripHtml(item.name) || 'สินค้า',
    image,
    price: unitPrice,
    lineTotal,
    quantity,
  };
}

export function mapCart(cart) {
  const items = Array.isArray(cart?.items) ? cart.items.map(mapCartItem) : [];
  const count =
    Number(cart?.items_count) ||
    items.reduce((sum, item) => sum + item.quantity, 0);
  const itemsTotal = cart?.totals
    ? mapPrice(cart.totals, 'total_items')
    : items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingTotal = cart?.totals
    ? mapPrice(cart.totals, 'total_shipping')
    : 0;
  const discountTotal = cart?.totals
    ? mapPrice(cart.totals, 'total_discount')
    : 0;
  const total = cart?.totals
    ? mapPrice(cart.totals, 'total_price')
    : Math.max(0, itemsTotal + shippingTotal - discountTotal);

  const billing = cart?.billing_address || null;
  const shipping = cart?.shipping_address || null;

  logCartSession('mapCart', {
    state: shipping?.state || billing?.state || '',
    postcode: shipping?.postcode || billing?.postcode || '',
    shipping_rates: cart?.shipping_rates ?? null,
  });

  return {
    items,
    count,
    itemsTotal,
    shippingTotal,
    discountTotal,
    total,
    needsShipping: Boolean(cart?.needs_shipping),
    shippingRates: Array.isArray(cart?.shipping_rates) ? cart.shipping_rates : [],
    paymentMethods: extractCartPaymentMethods(cart),
    billingAddress: billing,
    shippingAddress: shipping,
    raw: cart,
  };
}

export async function fetchCart() {
  const requestToken = getCartToken();
  const cart = await cartRequest('');
  logRawStoreShippingEvidence('GET cart (raw, before mapCart)', cart, {
    requestToken,
    token: getCartToken(),
  });
  return mapCart(cart);
}

export async function updateCartCustomer({ billing_address, shipping_address }) {
  const payload = { billing_address, shipping_address };
  if (import.meta.env.DEV) {
    console.log('[store-api-shipping] update-customer payload (raw)', payload);
  }

  const requestToken = getCartToken();
  const cart = await cartRequest('/update-customer', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  // Log original Store API body only — before mapCart / extractShippingPackages.
  logRawStoreShippingEvidence('POST update-customer (raw, before mapCart)', cart, {
    requestToken,
    token: getCartToken(),
  });

  return mapCart(cart);
}

export async function selectShippingRate(packageId, rateId) {
  if (packageId === undefined || packageId === null || packageId === '') {
    throw new Error('ไม่พบ package การจัดส่ง');
  }
  if (!rateId) {
    throw new Error('ไม่พบวิธีจัดส่ง');
  }

  const cart = await cartRequest('/select-shipping-rate', {
    method: 'POST',
    body: JSON.stringify({
      package_id: packageId,
      rate_id: rateId,
    }),
  });

  return mapCart(cart);
}

/**
 * Flatten Woo cart shipping_rates packages into UI-friendly options.
 * Uses package_id and rate_id from the real response only — never invents rates.
 */
export function extractShippingPackages(cartOrRaw) {
  const raw = cartOrRaw?.raw ?? cartOrRaw;
  const packages = Array.isArray(raw?.shipping_rates)
    ? raw.shipping_rates
    : Array.isArray(cartOrRaw?.shippingRates)
      ? cartOrRaw.shippingRates
      : [];

  return packages
    .map((pkg) => {
      const rates = Array.isArray(pkg?.shipping_rates) ? pkg.shipping_rates : [];
      return {
        packageId: pkg.package_id,
        name: pkg.name || '',
        rates: rates
          .filter((rate) => rate?.rate_id)
          .map((rate) => ({
            rateId: rate.rate_id,
            name: rate.name || rate.rate_id,
            methodId: rate.method_id,
            selected: Boolean(rate.selected),
            price: mapPrice(rate, 'price'),
          })),
      };
    })
    .filter(
      (pkg) =>
        pkg.packageId !== undefined &&
        pkg.packageId !== null &&
        pkg.rates.length > 0,
    );
}

/** True when Woo returned a shipping_rates array (even if empty packages/rates). */
export function hasShippingRatesArray(cartOrRaw) {
  const raw = cartOrRaw?.raw ?? cartOrRaw;
  return Array.isArray(raw?.shipping_rates);
}

export async function addCartItem(productId, quantity = 1) {
  const id = Number(productId);
  if (!Number.isFinite(id)) {
    throw new Error('รหัสสินค้าไม่ถูกต้อง');
  }

  const cart = await cartRequest('/add-item', {
    method: 'POST',
    body: JSON.stringify({
      id,
      quantity: Number(quantity) || 1,
    }),
  });

  return mapCart(cart);
}

export async function updateCartItem(cartItemKey, quantity) {
  if (!cartItemKey) {
    throw new Error('ไม่พบรายการในตะกร้า');
  }

  const cart = await cartRequest('/update-item', {
    method: 'POST',
    body: JSON.stringify({
      key: cartItemKey,
      quantity: Number(quantity) || 0,
    }),
  });

  return mapCart(cart);
}

export async function removeCartItem(cartItemKey) {
  if (!cartItemKey) {
    throw new Error('ไม่พบรายการในตะกร้า');
  }

  const cart = await cartRequest('/remove-item', {
    method: 'POST',
    body: JSON.stringify({
      key: cartItemKey,
    }),
  });

  return mapCart(cart);
}

export async function clearCartItems(existingItems = []) {
  try {
    const cart = await cartRequest('/remove-items', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    return mapCart(cart);
  } catch (error) {
    let cart = { items: [], count: 0, total: 0 };

    for (const item of existingItems) {
      if (!item?.key) continue;
      cart = await removeCartItem(item.key);
    }

    if (!existingItems.length) {
      throw error;
    }

    return cart;
  }
}

function resolveFilterCategoryFromName(wooProduct) {
  const name = String(wooProduct.name || '');
  const nameLower = name.toLowerCase();
  const tags = (wooProduct.tags || []).map((item) => item.name).join(' ');
  const haystack = `${name} ${tags}`.toLowerCase();

  if (/refresh/.test(nameLower) || (/ดับกลิ่น/.test(name) && /spray/i.test(name))) {
    return 'refresh';
  }

  if (
    /set complete|โปรจับคู่|spray\s*\+|ชุด/.test(nameLower) ||
    (/spray/i.test(name) && /cleaner/i.test(name))
  ) {
    return 'kits';
  }

  if (
    (/protector|กันน้ำ|เคลือบกันน้ำ|สเปรย์กันน้ำ/.test(haystack) ||
      /protector spray/i.test(tags)) &&
    !/cleaner/i.test(name)
  ) {
    return 'protectors';
  }

  if (/cleaner|คลีนเนอร์|น้ำยา|โฟม/.test(nameLower)) {
    return 'cleaners';
  }

  if (/แปรง|brush|electric/.test(nameLower)) {
    return 'brushes';
  }

  return 'kits';
}

function getPrimaryWooCategory(wooProduct) {
  const categories = Array.isArray(wooProduct.categories)
    ? wooProduct.categories
    : [];
  const primary = categories.find((item) => {
    const name = String(item?.name || '')
      .trim()
      .toLowerCase();
    if (!name) return false;
    if (name === 'uncategorized' || name === 'ไม่มีหมวดหมู่') return false;
    return true;
  });
  return primary || null;
}

function mapWooCategoryToFilter(category) {
  const text = `${category?.name || ''} ${category?.slug || ''}`.toLowerCase();

  if (/refresh|ฟื้นฟู|ดับกลิ่น/.test(text)) return 'refresh';
  if (/protect|protector|กันน้ำ|ปกป้อง/.test(text)) return 'protectors';
  if (/clean|cleaner|คลีน|ทำความสะอาด/.test(text)) return 'cleaners';
  if (/brush|แปรง|อุปกรณ์|accessory/.test(text)) return 'brushes';
  if (/kit|bundle|set|ชุด|ครบ/.test(text)) return 'kits';

  return resolveFilterCategoryFromName({ name: category?.name || '' });
}

function resolveFilterCategory(wooProduct) {
  const wooCategory = getPrimaryWooCategory(wooProduct);
  if (wooCategory) {
    return mapWooCategoryToFilter(wooCategory);
  }
  return resolveFilterCategoryFromName(wooProduct);
}

function resolveIsBestseller(wooProduct) {
  if (wooProduct.on_sale) return true;
  const name = String(wooProduct.name || '').toLowerCase();
  return /set complete|โปรจับคู่|spray\s*\+|pro2|1แถม1|2-in-1|ฟรี\s*ผ้าแปรง/.test(
    name,
  );
}

/** True when Store API image URL is a real asset (not Woo placeholder). */
export function isUsableWooImageSrc(src) {
  const value = String(src || '').trim();
  if (!value) return false;
  if (/woocommerce-placeholder/i.test(value)) return false;
  if (/\/placeholder\.(png|jpe?g|webp|gif|svg)(\?|$)/i.test(value)) return false;
  return true;
}

/**
 * Map Woo `images[]` → gallery entries.
 * Primary listing/PDP image is always `images[0]` (first usable src).
 */
function mapWooGallery(wooProduct, alt = '') {
  const images = Array.isArray(wooProduct.images) ? wooProduct.images : [];
  return images
    .map((image) => ({
      src: String(image.src || image.thumbnail || '').trim(),
      alt: image.alt || alt || wooProduct.name || '',
    }))
    .filter((image) => isUsableWooImageSrc(image.src));
}

function cleanDescriptionLines(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li[^>]*>/gi, '– ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/\*\*/g, '')
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter((line) => line && !/^[\-—–_*\s]{6,}$/.test(line));
}

function extractBenefitsFromLines(lines, limit = 6) {
  const bullets = [];
  for (const line of lines) {
    if (!/^[-–—*•]/.test(line)) continue;
    const text = line.replace(/^[-–—*•]\s*/, '').trim();
    if (text.length < 8 || text.length > 140) continue;
    if (/คำเตือน|ห้ามรับประทาน/.test(text)) continue;
    bullets.push(text);
  }
  return [...new Set(bullets)].slice(0, limit);
}

function extractHowToText(lines) {
  const start = lines.findIndex((line) =>
    /^(วิธีการใช้งาน|วิธีใช้|วิธีทำความสะอาด|ขั้นตอน)/.test(line),
  );
  if (start < 0) return '';

  const parts = [];
  for (let i = start + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (
      /^(คุณสมบัติ|วัสดุที่ใช้ได้|คำเตือน|หมายเหตุ|การดูแลรักษา|รายละเอียด|จุดเด่น)/.test(
        line,
      )
    ) {
      break;
    }
    parts.push(line);
  }
  return parts.join('\n').trim();
}

function extractAboutText(lines) {
  const parts = [];
  for (const line of lines) {
    if (/^(วิธีการใช้งาน|วิธีใช้|วิธีทำความสะอาด|ขั้นตอน)/.test(line)) break;
    if (/^(คำเตือน|หมายเหตุ)/.test(line)) break;
    if (/^[-–—*•]/.test(line)) continue;
    if (line.length < 8) continue;
    parts.push(line);
    if (parts.length >= 6) break;
  }
  return parts.join('\n').trim();
}

function shortenHeroText(text, maxLen = 140) {
  const value = String(text || '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!value) return '';
  if (value.length <= maxLen) return value;
  const sliced = value.slice(0, maxLen);
  const cut = Math.max(sliced.lastIndexOf(' '), sliced.lastIndexOf('。'));
  return `${(cut > maxLen * 0.5 ? sliced.slice(0, cut) : sliced).trim()}…`;
}

function shortenStockLabel(wooProduct) {
  if (!wooProduct.is_in_stock) return 'สินค้าหมด';
  return 'มีสินค้า';
}

function resolveCategoryLabel(wooProduct, filterCategory) {
  const wooCategory = getPrimaryWooCategory(wooProduct);
  if (wooCategory?.name) {
    return stripHtml(wooCategory.name);
  }
  return CATEGORY_LABELS[filterCategory] || CATEGORY_LABELS.kits;
}

export function mapStoreProduct(wooProduct) {
  const name = stripHtml(wooProduct.name) || 'สินค้า BAZOOKA';
  const gallery = mapWooGallery(wooProduct, name);
  const filterCategory = resolveFilterCategory(wooProduct);
  const shortDescription = stripHtml(wooProduct.short_description);
  const description = stripHtml(wooProduct.description);
  const cardDescription = shortDescription || description;
  const categories = Array.isArray(wooProduct.categories)
    ? wooProduct.categories.map((item) => ({
        id: item.id,
        name: stripHtml(item.name),
        slug: item.slug || '',
      }))
    : [];
  const stockStatus = wooProduct.is_in_stock
    ? 'instock'
    : wooProduct.is_on_backorder
      ? 'onbackorder'
      : 'outofstock';

  return {
    id: wooProduct.id,
    sku: wooProduct.sku || '',
    slug: wooProduct.slug,
    name,
    shortDescription,
    description: cardDescription,
    longDescription: description,
    price: mapPrice(wooProduct.prices),
    image: gallery[0]?.src || '',
    imageFit: 'contain',
    category: resolveCategoryLabel(wooProduct, filterCategory),
    categories,
    filterCategory,
    isBestseller: resolveIsBestseller(wooProduct),
    isInStock: Boolean(wooProduct.is_in_stock),
    stockStatus,
    stockLabel:
      wooProduct.stock_availability?.text ||
      (wooProduct.is_in_stock ? 'มีสินค้า' : 'สินค้าหมด'),
    gallery,
  };
}

export function mapStoreProductDetail(wooProduct) {
  const product = mapStoreProduct(wooProduct);
  const descLines = cleanDescriptionLines(wooProduct.description);
  const shortLines = cleanDescriptionLines(wooProduct.short_description);
  const aboutDescription = extractAboutText(descLines);
  const howToText = extractHowToText(descLines);
  const benefits = extractBenefitsFromLines(descLines, 6);
  const heroSource =
    shortLines.join(' ') ||
    aboutDescription.split('\n')[0] ||
    '';

  const gallery =
    product.gallery.length > 0
      ? product.gallery
      : product.image
        ? [{ src: product.image, alt: product.name }]
        : [];

  return {
    ...product,
    breadcrumbLabel: product.name,
    heroDescription: shortenHeroText(heroSource, 140),
    aboutDescription,
    howToText,
    benefits,
    stockLabelShort: shortenStockLabel(wooProduct),
    gallery,
  };
}

/**
 * Fetch one product via same-origin serverless `/api/products?id=`.
 * Avoids browser → WordPress /wp-json (Vercel 403 on www).
 */
export async function fetchStoreProductById(productId) {
  const id = String(productId || '').trim();
  if (!id || !/^\d+$/.test(id)) {
    return null;
  }

  const response = await fetch(
    `${PRODUCTS_API_URL}?id=${encodeURIComponent(id)}`,
    {
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
    },
  );

  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const message =
      (data && typeof data.message === 'string' && data.message.trim()) ||
      `โหลดสินค้าไม่สำเร็จ (${response.status})`;
    throw new Error(message);
  }

  const product = data?.product;
  if (!product || typeof product !== 'object' || Array.isArray(product)) {
    throw new Error('รูปแบบข้อมูลสินค้าไม่ถูกต้อง');
  }

  return mapStoreProductDetail(product);
}

/**
 * Fetch all published products via same-origin serverless `/api/products`.
 * Count and order follow the API response (no local catalog / ID allowlist).
 */
export async function fetchStoreProducts() {
  const response = await fetch(PRODUCTS_API_URL, {
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
    },
  });

  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      (data && typeof data.message === 'string' && data.message.trim()) ||
      `โหลดสินค้าไม่สำเร็จ (${response.status})`;
    throw new Error(message);
  }

  const products = data?.products;
  if (!Array.isArray(products)) {
    throw new Error('รูปแบบข้อมูลสินค้าไม่ถูกต้อง');
  }

  return products.map(mapStoreProduct);
}

function splitFullName(fullName) {
  const parts = String(fullName || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return { first_name: '', last_name: '' };
  }

  if (parts.length === 1) {
    return { first_name: parts[0], last_name: parts[0] };
  }

  return {
    first_name: parts[0],
    last_name: parts.slice(1).join(' '),
  };
}

export function resolveWooPaymentMethod(uiPaymentId) {
  const id = String(uiPaymentId || '').trim();
  if (TEST_PAYMENT_METHOD_PRIORITY.includes(id)) return id;
  return '';
}

/**
 * Pick a Phase 3.1 test payment method from live cart `payment_methods`.
 * Prefers bacs, then cod. Never invents Omise/card/PromptPay.
 */
export function pickTestPaymentMethod(availableMethods) {
  const available = Array.isArray(availableMethods)
    ? availableMethods.filter((id) => typeof id === 'string' && id.trim())
    : [];
  const selected =
    TEST_PAYMENT_METHOD_PRIORITY.find((id) => available.includes(id)) || '';

  return {
    selected,
    available,
    testOptions: TEST_PAYMENT_METHOD_PRIORITY.filter((id) =>
      available.includes(id),
    ).map((id) => ({
      id,
      label: TEST_PAYMENT_METHOD_LABELS[id] || id,
    })),
  };
}

export function getTestPaymentMethodLabel(methodId) {
  return TEST_PAYMENT_METHOD_LABELS[methodId] || methodId || '';
}

/**
 * Build Store API billing/shipping addresses from checkout form.
 * `state` MUST be a Woo TH-xx code (not Thai province label) for shipping zones.
 */
export function buildStoreAddressesFromForm(form) {
  const explicitFirst = String(form.firstName || '').trim();
  const explicitLast = String(form.lastName || '').trim();
  const split = splitFullName(form.fullName);
  const first_name = explicitFirst || split.first_name;
  const last_name = explicitLast || split.last_name || first_name;

  const province = String(form.province || '').trim();
  const stateCode = resolveThaiWooStateCode(province);
  const district = String(form.district || '').trim();
  const subdistrict = String(form.subdistrict || '').trim();
  const street = String(form.street || '').trim();
  const addressNote = String(form.addressNote || '').trim();

  const address2Parts = [
    street ? (street.startsWith('ถนน') ? street : `ถนน${street}`) : '',
    subdistrict,
    addressNote,
  ].filter(Boolean);

  const base = {
    first_name,
    last_name,
    company: '',
    address_1: String(form.addressLine || '').trim(),
    address_2: address2Parts.join(', '),
    city: district || subdistrict,
    state: stateCode || province,
    postcode: String(form.postalCode || '').trim(),
    country: 'TH',
    phone: String(form.phone || '').trim(),
  };

  const billing_address = {
    ...base,
    email: String(form.email || '').trim(),
  };

  // shipping_address schema has no email field
  const shipping_address = { ...base };

  return { billing_address, shipping_address, stateCode };
}

function normalizePhoneDigits(phone) {
  return String(phone || '').replace(/\D/g, '');
}

/**
 * Field-level validation for checkout customer + address.
 * Returns `{ ok, errors: string[], fieldErrors: Record<field, message>, stateCode }`.
 */
export function validateCheckoutCustomerForm(form) {
  const fieldErrors = {};
  const firstName = String(form.firstName || '').trim();
  const lastName = String(form.lastName || '').trim();
  const fullName = String(form.fullName || '').trim();
  const email = String(form.email || '').trim();
  const phone = String(form.phone || '').trim();
  const phoneDigits = normalizePhoneDigits(phone);
  const addressLine = String(form.addressLine || '').trim();
  const province = String(form.province || '').trim();
  const district = String(form.district || '').trim();
  const subdistrict = String(form.subdistrict || '').trim();
  const postalCode = String(form.postalCode || '').trim();
  const stateCode = resolveThaiWooStateCode(province);

  const hasSplitName = Boolean(form.firstName !== undefined || form.lastName !== undefined);
  if (hasSplitName || firstName || lastName) {
    if (!firstName) fieldErrors.firstName = 'กรุณากรอกชื่อ';
    if (!lastName) fieldErrors.lastName = 'กรุณากรอกนามสกุล';
  } else if (!fullName) {
    fieldErrors.fullName = 'กรุณากรอกชื่อ-นามสกุล';
  }

  if (!email) fieldErrors.email = 'กรุณากรอกอีเมล';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fieldErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
  }

  if (!phone) fieldErrors.phone = 'กรุณากรอกเบอร์โทรศัพท์';
  else if (phoneDigits.length < 9 || phoneDigits.length > 10) {
    fieldErrors.phone = 'เบอร์โทรศัพท์ต้องมี 9–10 หลัก';
  }

  if (!addressLine) fieldErrors.addressLine = 'กรุณากรอกที่อยู่';

  if (!province) fieldErrors.province = 'กรุณาเลือกจังหวัด';
  else if (!stateCode) {
    fieldErrors.province = 'ไม่สามารถแปลงจังหวัดเป็นรหัสสำหรับ WooCommerce ได้';
  }

  if (!district) fieldErrors.district = 'กรุณาเลือกเขต/อำเภอ';
  if (!subdistrict) fieldErrors.subdistrict = 'กรุณาเลือกแขวง/ตำบล';

  if (!postalCode) fieldErrors.postalCode = 'กรุณากรอกรหัสไปรษณีย์';
  else if (!/^\d{5}$/.test(postalCode)) {
    fieldErrors.postalCode = 'รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก';
  }

  const errors = Object.values(fieldErrors);

  return {
    ok: errors.length === 0,
    errors,
    fieldErrors,
    stateCode,
  };
}

export function buildCheckoutRequestBody({
  form,
  payment,
  paymentData = [],
}) {
  const { billing_address, shipping_address } = buildStoreAddressesFromForm(form);
  const payment_method = resolveWooPaymentMethod(payment);

  return {
    billing_address,
    shipping_address,
    customer_note: String(form.note || '').trim(),
    payment_method,
    payment_data: Array.isArray(paymentData) ? paymentData : [],
  };
}

/** Read UI fields from raw Woo checkout response without inventing a new schema. */
export function readCheckoutOrderFields(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return null;
  }

  const orderId = raw.order_id;
  if (orderId == null || orderId === '') {
    return null;
  }

  return {
    order_id: orderId,
    order_key: raw.order_key ?? null,
    order_number: raw.order_number ?? String(orderId),
    status: raw.status ?? null,
    payment_result: raw.payment_result ?? null,
  };
}

function checkoutErrorMessage(data, status) {
  if (data && typeof data.message === 'string' && data.message.trim()) {
    return data.message.trim();
  }
  if (Array.isArray(data) && data[0]?.message) {
    return String(data[0].message);
  }
  if (data?.code && typeof data.code === 'string') {
    return `สร้างคำสั่งซื้อไม่สำเร็จ (${data.code})`;
  }
  return `สร้างคำสั่งซื้อไม่สำเร็จ (${status})`;
}

/**
 * POST Store API checkout once (no automatic re-POST — avoids duplicate orders).
 * Caller should refresh Nonce via GET cart before calling if needed.
 */
export async function submitCheckout(body) {
  const headers = new Headers({
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
  });

  const token = getCartToken();
  if (token) {
    headers.set('Cart-Token', token);
  }

  const nonce = getCartNonce();
  if (nonce) {
    headers.set('Nonce', nonce);
  }

  if (import.meta.env.DEV) {
    console.log('[checkout] POST', STORE_CHECKOUT_URL, {
      payment_method: body?.payment_method,
      has_billing: Boolean(body?.billing_address),
      has_shipping: Boolean(body?.shipping_address),
      cart_token: maskCartToken(token),
      has_nonce: Boolean(nonce),
    });
  }

  const response = await fetch(STORE_CHECKOUT_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    cache: 'no-store',
    credentials: 'include',
  });

  syncCartHeadersFromResponse(response);

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (import.meta.env.DEV) {
    console.log('[checkout] response', {
      status: response.status,
      order_id: data?.order_id ?? null,
      order_number: data?.order_number ?? null,
      status_field: data?.status ?? null,
      code: data?.code ?? null,
      message: data?.message ?? null,
    });
  }

  if (!response.ok) {
    const err = new Error(checkoutErrorMessage(data, response.status));
    err.status = response.status;
    err.data = data;
    throw err;
  }

  const order = readCheckoutOrderFields(data);
  if (!order) {
    const err = new Error('ไม่พบเลขที่คำสั่งซื้อจาก WooCommerce');
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return { raw: data, order };
}

/** Payment method ids currently offered by the cart (Store API). */
export function extractCartPaymentMethods(cartOrRaw) {
  const raw = cartOrRaw?.raw ?? cartOrRaw;
  const methods = raw?.payment_methods;
  return Array.isArray(methods)
    ? methods.filter((id) => typeof id === 'string' && id.trim())
    : [];
}

function toRestAddress(address, { includeEmail = false } = {}) {
  const src = address && typeof address === 'object' ? address : {};
  const out = {
    first_name: String(src.first_name || '').trim(),
    last_name: String(src.last_name || '').trim(),
    company: String(src.company || '').trim(),
    address_1: String(src.address_1 || '').trim(),
    address_2: String(src.address_2 || '').trim(),
    city: String(src.city || '').trim(),
    state: String(src.state || '').trim(),
    postcode: String(src.postcode || '').trim(),
    country: String(src.country || 'TH').trim() || 'TH',
    phone: String(src.phone || '').trim(),
  };
  if (includeEmail) {
    out.email = String(src.email || '').trim();
  }
  return out;
}

/**
 * Create a WooCommerce order via same-origin serverless `/api/create-order`.
 * Consumer key/secret stay on the server — never sent to the browser.
 */
export async function createRestOrder({
  form,
  items,
  shippingTotal = 0,
  paymentMethod = 'bacs',
}) {
  const method = resolveWooPaymentMethod(paymentMethod);
  if (!method) {
    throw new Error('วิธีชำระเงินทดสอบไม่ถูกต้อง (ใช้ bacs หรือ cod เท่านั้น)');
  }

  const lineItems = (Array.isArray(items) ? items : [])
    .map((item) => {
      const productId = Number(item?.id);
      const quantity = Number(item?.quantity) || 0;
      if (!Number.isFinite(productId) || productId <= 0 || quantity < 1) {
        return null;
      }
      return { product_id: productId, quantity };
    })
    .filter(Boolean);

  if (!lineItems.length) {
    throw new Error('ไม่มีสินค้าในตะกร้าสำหรับสร้างคำสั่งซื้อ');
  }

  const { billing_address, shipping_address } =
    buildStoreAddressesFromForm(form);

  const payload = {
    paymentMethod: method,
    customer_note: String(form?.note || '').trim(),
    billing: toRestAddress(billing_address, { includeEmail: true }),
    shipping: toRestAddress(shipping_address),
    line_items: lineItems,
    shippingTotal: Number(shippingTotal) || 0,
  };

  if (import.meta.env.DEV) {
    console.log('[create-order] POST', CREATE_ORDER_API_URL, {
      paymentMethod: payload.paymentMethod,
      line_items: payload.line_items,
      shippingTotal: payload.shippingTotal,
      billing: {
        ...payload.billing,
        first_name: '[set]',
        last_name: '[set]',
        address_1: '[set]',
        email: '[set]',
        phone: '[set]',
      },
      shipping: {
        ...payload.shipping,
        first_name: '[set]',
        last_name: '[set]',
        address_1: '[set]',
        phone: payload.shipping.phone ? '[set]' : '',
      },
    });
  }

  const response = await fetch(CREATE_ORDER_API_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (import.meta.env.DEV) {
    console.log('[create-order] response', {
      status: response.status,
      order_id: data?.order?.order_id ?? null,
      order_number: data?.order?.order_number ?? null,
      message: data?.message ?? null,
    });
  }

  if (!response.ok) {
    const err = new Error(checkoutErrorMessage(data, response.status));
    err.status = response.status;
    err.data = data;
    throw err;
  }

  const order = data?.order;
  if (!order?.order_id) {
    const err = new Error('ไม่พบเลขที่คำสั่งซื้อจากเซิร์ฟเวอร์');
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return { raw: data?.raw ?? data, order };
}
