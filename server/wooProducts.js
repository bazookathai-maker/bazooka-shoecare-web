/**
 * Shared WooCommerce product fetch (server-only).
 * Prefers REST API with WOOCOMMERCE_URL + CONSUMER_KEY + CONSUMER_SECRET.
 * Falls back to public Store API on the same host when REST credentials are
 * missing/unusable (e.g. local `vercel env pull` of Sensitive placeholders).
 * Never import this module from browser/client code.
 */

const SENSITIVE_PLACEHOLDER = /^\[SENSITIVE]$/i;
const DEFAULT_WOO_HOST = 'https://bazookashoecare.com';

function trimSlash(url) {
  return String(url || '').replace(/\/$/, '');
}

/**
 * Normalize host/base into .../wp-json/wc/v3
 * Accepts: https://host | https://host/wp-json | https://host/wp-json/wc/v3
 */
export function resolveWooRestBaseUrl(wooUrl) {
  const raw = trimSlash(wooUrl);
  if (!raw) return '';
  if (/\/wp-json\/wc\/v3$/i.test(raw)) return raw;
  if (/\/wp-json$/i.test(raw)) return `${raw}/wc/v3`;
  return `${raw}/wp-json/wc/v3`;
}

/**
 * Normalize host/base into .../wp-json/wc/store/v1
 */
export function resolveWooStoreBaseUrl(wooUrl) {
  const raw = trimSlash(wooUrl);
  if (!raw) return '';
  if (/\/wp-json\/wc\/store\/v1$/i.test(raw)) return raw;
  if (/\/wp-json$/i.test(raw)) return `${raw}/wc/store/v1`;
  return `${raw}/wp-json/wc/store/v1`;
}

function cleanEnvValue(value) {
  const raw = String(value || '').trim();
  if (!raw || SENSITIVE_PLACEHOLDER.test(raw)) return '';
  return raw;
}

function getServerCredentials() {
  const url = cleanEnvValue(process.env.WOOCOMMERCE_URL);
  const key = cleanEnvValue(process.env.WOOCOMMERCE_CONSUMER_KEY);
  const secret = cleanEnvValue(process.env.WOOCOMMERCE_CONSUMER_SECRET);
  const restReady =
    /^https?:\/\//i.test(url) &&
    key.startsWith('ck_') &&
    secret.startsWith('cs_');
  return { url, key, secret, restReady };
}

function resolveWooHost() {
  const { url } = getServerCredentials();
  if (/^https?:\/\//i.test(url)) return url;
  return DEFAULT_WOO_HOST;
}

function buildAuthHeader(key, secret) {
  return `Basic ${Buffer.from(`${key}:${secret}`).toString('base64')}`;
}

/**
 * Normalize REST API v3 product → Store API-like shape so client mappers stay unchanged.
 */
export function restProductToStoreShape(product) {
  if (!product || typeof product !== 'object') return null;

  const priceMajor = Number(
    product.price || product.regular_price || product.sale_price || 0,
  );
  const minorUnit = 2;
  const priceMinor = Number.isFinite(priceMajor)
    ? Math.round(priceMajor * 10 ** minorUnit)
    : 0;

  const stockStatus = String(product.stock_status || '').toLowerCase();
  const isInStock = stockStatus === 'instock' || product.in_stock === true;
  const isOnBackorder = stockStatus === 'onbackorder';

  return {
    id: product.id,
    name: product.name || '',
    slug: product.slug || '',
    sku: product.sku || '',
    description: product.description || '',
    short_description: product.short_description || '',
    categories: Array.isArray(product.categories) ? product.categories : [],
    tags: Array.isArray(product.tags) ? product.tags : [],
    images: Array.isArray(product.images) ? product.images : [],
    on_sale: Boolean(product.on_sale),
    is_in_stock: isInStock,
    is_on_backorder: isOnBackorder,
    stock_availability: {
      text: isInStock ? 'มีสินค้า' : 'สินค้าหมด',
    },
    prices: {
      price: String(priceMinor),
      regular_price: String(
        Math.round(
          (Number(product.regular_price || priceMajor) || 0) * 10 ** minorUnit,
        ),
      ),
      sale_price: product.sale_price
        ? String(
            Math.round((Number(product.sale_price) || 0) * 10 ** minorUnit),
          )
        : '',
      currency_minor_unit: minorUnit,
    },
  };
}

async function parseJsonResponse(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function httpError(message, status, data) {
  const err = new Error(message);
  err.status = status;
  err.data = data;
  return err;
}

async function wooRestGet(pathWithQuery) {
  const { url, key, secret, restReady } = getServerCredentials();
  if (!restReady) {
    throw httpError(
      'ยังไม่ได้ตั้งค่า WooCommerce บนเซิร์ฟเวอร์ (WOOCOMMERCE_URL / KEY / SECRET)',
      500,
    );
  }

  const base = resolveWooRestBaseUrl(url);
  const target = `${base}${pathWithQuery.startsWith('/') ? '' : '/'}${pathWithQuery}`;

  const response = await fetch(target, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: buildAuthHeader(key, secret),
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
    },
    cache: 'no-store',
  });

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    const message =
      (data && typeof data.message === 'string' && data.message.trim()) ||
      (Array.isArray(data) && data[0]?.message) ||
      `โหลดสินค้าไม่สำเร็จ (${response.status})`;
    throw httpError(message, response.status, data);
  }

  return { data, response };
}

async function wooStoreGet(pathWithQuery) {
  const base = resolveWooStoreBaseUrl(resolveWooHost());
  const target = `${base}${pathWithQuery.startsWith('/') ? '' : '/'}${pathWithQuery}`;

  const response = await fetch(target, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
    },
    cache: 'no-store',
  });

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    const message =
      (data && typeof data.message === 'string' && data.message.trim()) ||
      (Array.isArray(data) && data[0]?.message) ||
      `โหลดสินค้าไม่สำเร็จ (${response.status})`;
    throw httpError(message, response.status, data);
  }

  return { data, response };
}

async function fetchAllViaRest() {
  const products = [];
  let page = 1;
  let totalPages;

  do {
    const { data, response } = await wooRestGet(
      `/products?per_page=100&page=${page}&status=publish`,
    );
    if (!Array.isArray(data)) {
      throw httpError('รูปแบบข้อมูลสินค้าไม่ถูกต้อง', 502, data);
    }
    products.push(...data.map(restProductToStoreShape).filter(Boolean));
    totalPages = Number(response.headers.get('X-WP-TotalPages') || 1);
    page += 1;
  } while (page <= totalPages);

  return products;
}

async function fetchAllViaStore() {
  const products = [];
  let page = 1;
  let totalPages;

  do {
    const { data, response } = await wooStoreGet(
      `/products?per_page=100&page=${page}`,
    );
    if (!Array.isArray(data)) {
      throw httpError('รูปแบบข้อมูลสินค้าไม่ถูกต้อง', 502, data);
    }
    products.push(...data);
    totalPages = Number(response.headers.get('X-WP-TotalPages') || 1);
    page += 1;
  } while (page <= totalPages);

  return products;
}

/**
 * Fetch all published products (paginated on server).
 * @returns {Promise<object[]>} Store API-shaped products
 */
export async function fetchAllWooProducts() {
  const { restReady } = getServerCredentials();
  if (restReady) {
    try {
      return await fetchAllViaRest();
    } catch (err) {
      // Auth/config failures → public Store API fallback (read-only catalog).
      if (err?.status === 401 || err?.status === 403 || err?.status === 500) {
        return fetchAllViaStore();
      }
      throw err;
    }
  }
  return fetchAllViaStore();
}

/**
 * Fetch one product by numeric id.
 * @returns {Promise<object|null>} Store API-shaped product or null if 404
 */
export async function fetchWooProductById(productId) {
  const id = String(productId || '').trim();
  if (!id || !/^\d+$/.test(id)) {
    return null;
  }

  const { restReady } = getServerCredentials();

  if (restReady) {
    try {
      const { data } = await wooRestGet(`/products/${id}`);
      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw httpError('รูปแบบข้อมูลสินค้าไม่ถูกต้อง', 502, data);
      }
      return restProductToStoreShape(data);
    } catch (err) {
      if (err?.status === 404) return null;
      if (err?.status !== 401 && err?.status !== 403 && err?.status !== 500) {
        throw err;
      }
      // fall through to Store API
    }
  }

  try {
    const { data } = await wooStoreGet(`/products/${id}`);
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw httpError('รูปแบบข้อมูลสินค้าไม่ถูกต้อง', 502, data);
    }
    return data;
  } catch (err) {
    if (err?.status === 404) return null;
    throw err;
  }
}
