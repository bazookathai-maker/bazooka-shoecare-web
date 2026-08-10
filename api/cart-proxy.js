import { proxyWooStoreCart } from '../server/wooCartProxy.js';

/**
 * Vercel serverless: /api/cart-proxy
 * Rewrites from /api/cart and /api/cart/* land here.
 * Proxies WooCommerce Store API cart (session via Cart-Token / Nonce).
 */
export default async function handler(req, res) {
  try {
    const url = new URL(req.url || '/', 'http://localhost');
    const pathParam = url.searchParams.get('path') || '';
    const subPath = pathParam ? `/${String(pathParam).replace(/^\/+/, '')}` : '';
    await proxyWooStoreCart(req, res, subPath);
  } catch (err) {
    res.statusCode = Number(err?.status) || 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.end(
      JSON.stringify({
        message:
          err instanceof Error ? err.message : 'คำสั่งตะกร้าไม่สำเร็จ',
      }),
    );
  }
}
