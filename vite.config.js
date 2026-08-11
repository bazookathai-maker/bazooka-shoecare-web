import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import {
  createWooCommerceOrder,
  readJsonBody,
} from './server/wooCreateOrder.js'
import {
  fetchAllWooProducts,
  fetchWooProductById,
} from './server/wooProducts.js'
import { proxyWooStoreCart } from './server/wooCartProxy.js'
import {
  createPromptPayForWooOrder,
  handleOmiseWebhookEvent,
} from './server/omisePromptPay.js'

const WOO_ENV_KEYS = [
  'WOOCOMMERCE_URL',
  'WOOCOMMERCE_CONSUMER_KEY',
  'WOOCOMMERCE_CONSUMER_SECRET',
  'OMISE_SECRET_KEY',
]

/**
 * DEV-only: handle serverless routes before the leftover Store API `/api` proxy.
 * Mirrors Vercel handlers using the same server modules.
 */
function wooServerDevApi(env) {
  return {
    name: 'woo-server-dev-api',
    configureServer(server) {
      for (const key of WOO_ENV_KEYS) {
        if (env[key]) process.env[key] = env[key]
      }

      server.middlewares.use(async (req, res, next) => {
        const path = req.url?.split('?')[0]

        if (path === '/api/create-order') {
          res.setHeader('Cache-Control', 'no-store')
          res.setHeader('Content-Type', 'application/json; charset=utf-8')

          if (req.method === 'OPTIONS') {
            res.statusCode = 204
            res.end()
            return
          }

          if (req.method !== 'POST') {
            res.statusCode = 405
            res.end(JSON.stringify({ message: 'Method Not Allowed' }))
            return
          }

          try {
            const payload = await readJsonBody(req)
            const result = await createWooCommerceOrder(payload)
            res.statusCode = 200
            res.end(JSON.stringify(result))
          } catch (err) {
            const status = Number(err?.status) || 500
            res.statusCode = status
            res.end(
              JSON.stringify({
                message:
                  err instanceof Error
                    ? err.message
                    : 'สร้างคำสั่งซื้อไม่สำเร็จ',
                code: err?.data?.code || undefined,
              }),
            )
          }
          return
        }

        if (path === '/api/create-promptpay') {
          res.setHeader('Cache-Control', 'no-store')
          res.setHeader('Content-Type', 'application/json; charset=utf-8')

          if (req.method === 'OPTIONS') {
            res.statusCode = 204
            res.end()
            return
          }

          if (req.method !== 'POST') {
            res.statusCode = 405
            res.end(JSON.stringify({ message: 'Method Not Allowed' }))
            return
          }

          try {
            const payload = await readJsonBody(req)
            const result = await createPromptPayForWooOrder(
              payload?.orderId ?? payload?.order_id,
            )
            res.statusCode = 200
            res.end(JSON.stringify({ promptpay: result }))
          } catch (err) {
            const status = Number(err?.status) || 500
            res.statusCode = status
            res.end(
              JSON.stringify({
                message:
                  err instanceof Error
                    ? err.message
                    : 'สร้าง QR พร้อมเพย์ไม่สำเร็จ',
              }),
            )
          }
          return
        }

        if (path === '/api/omise-webhook') {
          res.setHeader('Cache-Control', 'no-store')
          res.setHeader('Content-Type', 'application/json; charset=utf-8')

          if (req.method === 'OPTIONS') {
            res.statusCode = 204
            res.end()
            return
          }

          if (req.method !== 'POST') {
            res.statusCode = 405
            res.end(JSON.stringify({ message: 'Method Not Allowed' }))
            return
          }

          try {
            const event = await readJsonBody(req)
            const result = await handleOmiseWebhookEvent(event)
            res.statusCode = 200
            res.end(JSON.stringify({ ok: true, ...result }))
          } catch (err) {
            const status = Number(err?.status) || 500
            res.statusCode = status
            res.end(
              JSON.stringify({
                ok: false,
                message:
                  err instanceof Error
                    ? err.message
                    : 'ประมวลผล webhook ไม่สำเร็จ',
              }),
            )
          }
          return
        }

        if (path === '/api/products') {
          res.setHeader('Cache-Control', 'no-store')
          res.setHeader('Content-Type', 'application/json; charset=utf-8')

          if (req.method === 'OPTIONS') {
            res.statusCode = 204
            res.end()
            return
          }

          if (req.method !== 'GET') {
            res.statusCode = 405
            res.end(JSON.stringify({ message: 'Method Not Allowed' }))
            return
          }

          try {
            const url = new URL(req.url || '/', 'http://localhost')
            const id = url.searchParams.get('id')

            if (id) {
              const product = await fetchWooProductById(id)
              if (!product) {
                res.statusCode = 404
                res.end(
                  JSON.stringify({ message: 'ไม่พบสินค้า', product: null }),
                )
                return
              }
              res.statusCode = 200
              res.end(JSON.stringify({ product }))
              return
            }

            const products = await fetchAllWooProducts()
            res.statusCode = 200
            res.end(JSON.stringify({ products }))
          } catch (err) {
            const status = Number(err?.status) || 500
            res.statusCode = status
            res.end(
              JSON.stringify({
                message:
                  err instanceof Error ? err.message : 'โหลดสินค้าไม่สำเร็จ',
                code: err?.data?.code || undefined,
              }),
            )
          }
          return
        }

        if (path === '/api/cart' || path?.startsWith('/api/cart/')) {
          try {
            const subPath =
              path === '/api/cart' ? '' : path.slice('/api/cart'.length)
            await proxyWooStoreCart(req, res, subPath)
          } catch (err) {
            res.statusCode = Number(err?.status) || 500
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.setHeader('Cache-Control', 'no-store')
            res.end(
              JSON.stringify({
                message:
                  err instanceof Error
                    ? err.message
                    : 'คำสั่งตะกร้าไม่สำเร็จ',
              }),
            )
          }
          return
        }

        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [wooServerDevApi(env), react()],
    server: {
      proxy: {
        // Leftover Store API paths (not products / create-order / cart).
        '/api': {
          target: 'https://bazookashoecare.com/wp-json/wc/store/v1',
          changeOrigin: true,
          secure: true,
          cookieDomainRewrite: 'localhost',
          cookiePathRewrite: '/',
          rewrite: (path) => path.replace(/^\/api/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('Cache-Control', 'no-cache')
              proxyReq.setHeader('Pragma', 'no-cache')
            })

            proxy.on('proxyRes', (proxyRes) => {
              proxyRes.headers['cache-control'] =
                'no-store, no-cache, must-revalidate, max-age=0'
              proxyRes.headers['pragma'] = 'no-cache'
              proxyRes.headers['expires'] = '0'
              delete proxyRes.headers['etag']
              delete proxyRes.headers['last-modified']
              delete proxyRes.headers['age']

              proxyRes.headers['access-control-expose-headers'] =
                'Cart-Token, Nonce, X-WC-Store-API-Nonce, Authorization'

              const setCookie = proxyRes.headers['set-cookie']
              if (setCookie) {
                const cookies = Array.isArray(setCookie)
                  ? setCookie
                  : [setCookie]
                proxyRes.headers['set-cookie'] = cookies.map((cookie) =>
                  String(cookie)
                    .replace(/;\s*Domain=[^;]*/gi, '; Domain=localhost')
                    .replace(/;\s*Secure/gi, '')
                    .replace(/;\s*SameSite=[^;]*/gi, '; SameSite=Lax'),
                )
              }
            })
          },
        },
        '/wp': {
          target: 'https://bazookashoecare.com/wp-json',
          changeOrigin: true,
          secure: true,
          cookieDomainRewrite: 'localhost',
          cookiePathRewrite: '/',
          rewrite: (path) => path.replace(/^\/wp/, ''),
          configure: (proxy) => {
            proxy.on('proxyRes', (proxyRes) => {
              proxyRes.headers['cache-control'] =
                'no-store, no-cache, must-revalidate, max-age=0'
              proxyRes.headers['pragma'] = 'no-cache'
              delete proxyRes.headers['etag']
              delete proxyRes.headers['age']
            })
          },
        },
      },
    },
  }
})
