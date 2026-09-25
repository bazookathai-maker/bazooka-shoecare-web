import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { readJsonBody } from './server/wooCreateOrder.js'
import {
  fetchAllWooProducts,
  fetchWooProductById,
} from './server/wooProducts.js'
import { proxyWooStoreCart } from './server/wooCartProxy.js'
import {
  handleOmiseWebhookEvent,
} from './server/omisePromptPay.js'
import {
  getAuthenticatedCustomer,
  getAuthenticatedOrders,
  getSessionFromRequest,
  loginCustomer,
  registerCustomer,
  updateCustomerBilling,
} from './server/wooCustomerAuth.js'

const WOO_ENV_KEYS = [
  'WOOCOMMERCE_URL',
  'WOOCOMMERCE_CONSUMER_KEY',
  'WOOCOMMERCE_CONSUMER_SECRET',
  'OMISE_SECRET_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'PUBLIC_SITE_URL',
  'SITE_URL',
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

        if (path === '/api/auth/register' || path === '/api/auth-register') {
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
            const result = await registerCustomer(payload)
            res.statusCode = 200
            res.end(JSON.stringify(result))
          } catch (err) {
            const status = Number(err?.status) || 500
            res.statusCode = status
            res.end(
              JSON.stringify({
                message:
                  err instanceof Error ? err.message : 'สมัครบัญชีไม่สำเร็จ',
              }),
            )
          }
          return
        }

        if (path === '/api/auth/login' || path === '/api/auth-login') {
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
            const result = await loginCustomer(payload)
            res.statusCode = 200
            res.end(JSON.stringify(result))
          } catch (err) {
            const status = Number(err?.status) || 500
            res.statusCode = status
            res.end(
              JSON.stringify({
                message:
                  err instanceof Error ? err.message : 'เข้าสู่ระบบไม่สำเร็จ',
              }),
            )
          }
          return
        }

        if (path === '/api/auth/me' || path === '/api/auth-me') {
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
            const customer = await getAuthenticatedCustomer(req)
            res.statusCode = 200
            res.end(JSON.stringify({ customer }))
          } catch (err) {
            const status = Number(err?.status) || 500
            res.statusCode = status
            res.end(
              JSON.stringify({
                message:
                  err instanceof Error
                    ? err.message
                    : 'โหลดข้อมูลบัญชีไม่สำเร็จ',
              }),
            )
          }
          return
        }

        if (path === '/api/auth/orders' || path === '/api/auth-orders') {
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
            const orders = await getAuthenticatedOrders(req)
            res.statusCode = 200
            res.end(JSON.stringify({ orders }))
          } catch (err) {
            const status = Number(err?.status) || 500
            res.statusCode = status
            res.end(
              JSON.stringify({
                message:
                  err instanceof Error
                    ? err.message
                    : 'โหลดประวัติคำสั่งซื้อไม่สำเร็จ',
              }),
            )
          }
          return
        }

        if (
          path === '/api/auth/update-billing' ||
          path === '/api/auth-update-billing'
        ) {
          res.setHeader('Cache-Control', 'no-store')
          res.setHeader('Content-Type', 'application/json; charset=utf-8')

          if (req.method === 'OPTIONS') {
            res.statusCode = 204
            res.end()
            return
          }

          if (req.method !== 'PUT' && req.method !== 'POST') {
            res.statusCode = 405
            res.end(JSON.stringify({ message: 'Method Not Allowed' }))
            return
          }

          try {
            const payload = await readJsonBody(req)
            console.log('[debug-billing-server] received PUT /api/auth/update-billing')
            console.log('[debug-billing-server] billing payload phone:', payload?.billing?.phone)
            console.log('[debug-billing-server] billing payload address_1:', payload?.billing?.address_1)
            const customer = await updateCustomerBilling(req, payload.billing)
            console.log('[debug-billing-server] WooCommerce updated, customer.id:', customer?.id)
            res.statusCode = 200
            res.end(JSON.stringify({ customer }))
          } catch (err) {
            const status = Number(err?.status) || 500
            console.error('[debug-billing-server] FAILED status:', status, 'message:', err?.message)
            res.statusCode = status
            res.end(
              JSON.stringify({
                message:
                  err instanceof Error
                    ? err.message
                    : 'อัปเดตข้อมูลบัญชีไม่สำเร็จ',
              }),
            )
          }
          return
        }

        if (path === '/api/track-order') {
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
            const { trackWooOrderByIdAndPhone } = await server.ssrLoadModule(
              '/server/wooTrackOrder.js',
            )
            const payload = await readJsonBody(req)
            const result = await trackWooOrderByIdAndPhone(payload)
            console.log('[dev track-order] ok', {
              orderId: result?.order?.id,
              wooStatus: result?.order?.wooStatus,
            })
            res.statusCode = 200
            res.end(JSON.stringify(result))
          } catch (err) {
            const status = Number(err?.status) || 500
            console.error('[dev track-order] error', {
              status,
              message: err instanceof Error ? err.message : String(err),
            })
            res.statusCode = status
            res.end(
              JSON.stringify({
                message:
                  err instanceof Error
                    ? err.message
                    : 'ค้นหาคำสั่งซื้อไม่สำเร็จ',
              }),
            )
          }
          return
        }

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
            // Always reload server module — static import stays stale across HMR.
            const { createWooCommerceOrder } = await server.ssrLoadModule(
              '/server/wooCreateOrder.js',
            )
            const payload = await readJsonBody(req)
            delete payload.customer_id
            const method = String(
              payload.paymentMethod || payload.payment_method || '',
            ).trim()
            console.log('[dev create-order] paymentMethod from client =', method)
            if (method !== 'stripe_promptpay') {
              res.statusCode = 400
              res.end(
                JSON.stringify({
                  message:
                    'วิธีชำระเงินไม่ถูกต้อง — รองรับเฉพาะพร้อมเพย์ผ่าน Stripe (stripe_promptpay)',
                }),
              )
              return
            }
            const session = getSessionFromRequest(req)
            if (session?.customerId) {
              payload.customer_id = session.customerId
            }
            const result = await createWooCommerceOrder(payload)
            console.log('[dev create-order] stored payment_method =', {
              requested: method,
              stored: result?.order?.payment_method ?? result?.raw?.payment_method,
              order_id: result?.order?.order_id,
              trace: result?.trace,
            })
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

          res.statusCode = 410
          res.end(
            JSON.stringify({
              message:
                'Omise PromptPay ถูกปิดแล้ว — ใช้ xendit_gateway ผ่าน WooCommerce payment_url',
            }),
          )
          return
        }

        if (path === '/api/create-stripe-checkout') {
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
            const orderId = payload.orderId ?? payload.order_id
            const orderKey = payload.orderKey ?? payload.order_key ?? ''
            const successOrigin =
              String(payload.successOrigin || req.headers.origin || '').trim() ||
              'http://localhost:5173'
            console.log('[dev create-stripe-checkout] request', {
              orderId,
              orderKey: orderKey ? '[set]' : null,
              successOrigin,
            })
            const {
              createStripeCheckoutForWooOrder,
            } = await server.ssrLoadModule('/server/stripeCheckout.js')
            const result = await createStripeCheckoutForWooOrder(orderId, {
              orderKey,
              successOrigin,
            })
            console.log('[dev create-stripe-checkout] ok', {
              orderId: result.orderId,
              sessionId: result.sessionId ? '[set]' : null,
              url: result.url ? '[set]' : null,
            })
            res.statusCode = 200
            res.end(JSON.stringify(result))
          } catch (err) {
            const status = Number(err?.status) || 500
            console.error('[dev create-stripe-checkout] error', {
              status,
              message: err instanceof Error ? err.message : String(err),
            })
            res.statusCode = status
            res.end(
              JSON.stringify({
                message:
                  err instanceof Error
                    ? err.message
                    : 'สร้าง Stripe Checkout ไม่สำเร็จ',
              }),
            )
          }
          return
        }

        if (path === '/api/stripe-webhook') {
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
            const { handleStripeWebhook, readRawBody } =
              await server.ssrLoadModule('/server/stripeCheckout.js')
            const rawBody = await readRawBody(req)
            const signature = req.headers['stripe-signature']
            const result = await handleStripeWebhook(rawBody, signature)
            console.log('[dev stripe-webhook]', {
              type: result?.type,
              orderId: result?.orderId,
              markedPaid: result?.markedPaid,
              skipped: result?.skipped,
            })
            res.statusCode = 200
            res.end(JSON.stringify(result))
          } catch (err) {
            const status = Number(err?.status) || 500
            res.statusCode = status
            res.end(
              JSON.stringify({
                ok: false,
                message:
                  err instanceof Error
                    ? err.message
                    : 'ประมวลผล Stripe webhook ไม่สำเร็จ',
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
