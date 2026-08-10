import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import {
  createWooCommerceOrder,
  readJsonBody,
} from './server/wooCreateOrder.js'

const WOO_ENV_KEYS = [
  'WOOCOMMERCE_URL',
  'WOOCOMMERCE_CONSUMER_KEY',
  'WOOCOMMERCE_CONSUMER_SECRET',
]

/**
 * DEV-only: handle POST /api/create-order before the Store API `/api` proxy.
 * Mirrors Vercel serverless `api/create-order.js` using the same server module.
 */
function createOrderDevApi(env) {
  return {
    name: 'create-order-dev-api',
    configureServer(server) {
      for (const key of WOO_ENV_KEYS) {
        if (env[key]) process.env[key] = env[key]
      }

      server.middlewares.use(async (req, res, next) => {
        const path = req.url?.split('?')[0]
        if (path !== '/api/create-order') {
          next()
          return
        }

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
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [createOrderDevApi(env), react()],
    server: {
      proxy: {
        // Store API (cart/products). create-order is handled by middleware above.
        '/api': {
          target: 'https://bazookashoecare.com/wp-json/wc/store/v1',
          changeOrigin: true,
          secure: true,
          // Keep Woo cookies usable on localhost so session stays consistent.
          cookieDomainRewrite: 'localhost',
          cookiePathRewrite: '/',
          rewrite: (path) => path.replace(/^\/api/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              // Avoid serving a stale empty cart from intermediary caches.
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

              // Browser must be able to read cart session headers.
              proxyRes.headers['access-control-expose-headers'] =
                'Cart-Token, Nonce, X-WC-Store-API-Nonce, Authorization'

              // Help browsers accept rewritten cookies on localhost.
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
