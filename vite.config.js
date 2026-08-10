import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const restTarget =
    (env.VITE_WC_REST_PROXY_TARGET || env.VITE_WC_REST_URL || '')
      .replace(/\/$/, '')
      .replace(/\/wp-json\/wc\/v3$/i, '') || 'https://bazookashoecare.com'

  return {
    plugins: [react()],
    server: {
      proxy: {
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
              proxyReq.setHeader('Cache-Control', 'no-cache');
              proxyReq.setHeader('Pragma', 'no-cache');
            });

            proxy.on('proxyRes', (proxyRes) => {
              proxyRes.headers['cache-control'] =
                'no-store, no-cache, must-revalidate, max-age=0';
              proxyRes.headers['pragma'] = 'no-cache';
              proxyRes.headers['expires'] = '0';
              delete proxyRes.headers['etag'];
              delete proxyRes.headers['last-modified'];
              delete proxyRes.headers['age'];

              // Browser must be able to read cart session headers.
              proxyRes.headers['access-control-expose-headers'] =
                'Cart-Token, Nonce, X-WC-Store-API-Nonce, Authorization';

              // Help browsers accept rewritten cookies on localhost.
              const setCookie = proxyRes.headers['set-cookie'];
              if (setCookie) {
                const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
                proxyRes.headers['set-cookie'] = cookies.map((cookie) =>
                  String(cookie)
                    .replace(/;\s*Domain=[^;]*/gi, '; Domain=localhost')
                    .replace(/;\s*Secure/gi, '')
                    .replace(/;\s*SameSite=[^;]*/gi, '; SameSite=Lax'),
                );
              }
            });
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
                'no-store, no-cache, must-revalidate, max-age=0';
              proxyRes.headers['pragma'] = 'no-cache';
              delete proxyRes.headers['etag'];
              delete proxyRes.headers['age'];
            });
          },
        },
        // WooCommerce REST API v3 (order create) — avoids browser CORS in DEV.
        '/wc-rest': {
          target: `${restTarget}/wp-json/wc/v3`,
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/wc-rest/, ''),
        },
      },
    },
  }
})
