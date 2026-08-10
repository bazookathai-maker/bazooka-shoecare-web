import {
  fetchAllWooProducts,
  fetchWooProductById,
} from '../server/wooProducts.js';

function setJson(res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
}

/**
 * Vercel serverless: GET /api/products
 * Optional query: ?id=123 for a single product.
 * Secrets stay on the server (WOOCOMMERCE_* env vars).
 */
export default async function handler(req, res) {
  setJson(res);

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.end(JSON.stringify({ message: 'Method Not Allowed' }));
    return;
  }

  try {
    const url = new URL(req.url || '/', 'http://localhost');
    const id = url.searchParams.get('id');

    if (id) {
      const product = await fetchWooProductById(id);
      if (!product) {
        res.statusCode = 404;
        res.end(JSON.stringify({ message: 'ไม่พบสินค้า', product: null }));
        return;
      }
      res.statusCode = 200;
      res.end(JSON.stringify({ product }));
      return;
    }

    const products = await fetchAllWooProducts();
    res.statusCode = 200;
    res.end(JSON.stringify({ products }));
  } catch (err) {
    const status = Number(err?.status) || 500;
    res.statusCode = status;
    res.end(
      JSON.stringify({
        message:
          err instanceof Error ? err.message : 'โหลดสินค้าไม่สำเร็จ',
        code: err?.data?.code || undefined,
      }),
    );
  }
}
