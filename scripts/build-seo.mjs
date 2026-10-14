/**
 * Post-build SEO step (runs after `vite build`):
 * - pre-renders public pages to dist/<path>/index.html with that page's title, description, canonical
 *   and Open Graph tags, plus a plain-HTML copy of its main content and links. The React app replaces
 *   that copy on load (createRoot clears #root), so price and stock still come from live data and are
 *   deliberately left out of the pre-rendered HTML;
 * - keeps the untouched SPA shell as dist/app.html, which vercel.json serves for every other route;
 * - writes dist/sitemap.xml.
 * If products can't be fetched, product pages fall back to the SPA shell and the sitemap copied from
 * public/sitemap.xml is kept.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'vite';
import { fetchAllWooProducts } from '../server/wooProducts.js';

const DIST = path.resolve('dist');
const PUBLIC = path.resolve('public');

const vite = await createServer({
  configFile: false,
  appType: 'custom',
  logLevel: 'error',
  server: { middlewareMode: true, hmr: false, ws: false },
  optimizeDeps: { noDiscovery: true, include: [] },
});

let seo;
let woo;
let homeCatalog;
let careGuides;
let faqItems;
let googleReviews;
let contact;
let hiddenIds;
try {
  [seo, woo, homeCatalog, { careGuides }, { faqItems }, { googleReviews }, contact, { LISTING_HIDDEN_PRODUCT_IDS: hiddenIds }] =
    await Promise.all(
      [
        '/src/utils/seo.js',
        '/src/api/woocommerce.js',
        '/src/utils/homeCatalog.js',
        '/src/data/careGuides.js',
        '/src/data/faqPage.js',
        '/src/data/googleReviews.js',
        '/src/data/contact.js',
        '/src/data/hiddenProducts.js',
      ].map((id) => vite.ssrLoadModule(id)),
    );
} finally {
  await vite.close();
}

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const text = (value) => esc(value).replace(/\n+/g, '<br>');
const link = (href, label) => `<a href="${esc(href)}">${esc(label)}</a>`;
const list = (items) => (items.length ? `<ul>${items.map((item) => `<li>${item}</li>`).join('')}</ul>` : '');

const NAV = [
  ['/', 'หน้าแรก'],
  ['/products', 'สินค้า'],
  ['/recommended', 'TOP PRODUCT'],
  ['/articles', 'บทความ'],
  ['/reviews', 'รีวิว'],
  ['/faq', 'FAQ'],
  ['/contact', 'ติดต่อเรา'],
];

const PRERENDER_STYLE = `<style>.seo-prerender{max-width:1080px;margin:0 auto;padding:96px 20px 48px;line-height:1.7;animation:seo-prerender-reveal 0s 2.5s both}.seo-prerender nav a{margin-right:16px}@keyframes seo-prerender-reveal{from{visibility:hidden}to{visibility:visible}}</style>`;

const template = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
fs.writeFileSync(path.join(DIST, 'app.html'), template);

const MANAGED_HEAD = [
  /<title>[\s\S]*?<\/title>\s*/,
  /<meta\s+name="description"[\s\S]*?\/>\s*/,
  /<meta\s+property="og:(type|title|description|image|url)"[\s\S]*?\/>\s*/g,
  /<meta\s+name="twitter:(title|description)"[\s\S]*?\/>\s*/g,
];

function renderPage({ seo: page, body }) {
  const title = seo.formatTitle(page);
  const description = page.description || seo.DEFAULT_DESCRIPTION;
  const canonical = seo.absoluteUrl(page.path);
  const image = page.image || seo.DEFAULT_OG_IMAGE;
  const head = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}" />`,
    `<link rel="canonical" href="${esc(canonical)}" />`,
    `<meta property="og:type" content="${esc(page.type || 'website')}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:url" content="${esc(canonical)}" />`,
    `<meta property="og:image" content="${esc(image)}" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(description)}" />`,
    PRERENDER_STYLE,
  ].join('\n    ');

  let html = template;
  for (const pattern of MANAGED_HEAD) html = html.replace(pattern, '');
  html = html.replace(/\s*<\/head>/, `\n    ${head}\n  </head>`);

  const nav = `<nav aria-label="เมนูหลัก">${NAV.map(([href, label]) => link(href, label)).join('')}</nav>`;
  const snapshot = `<div class="seo-prerender">${nav}<main>${body}</main></div>`;
  if (!html.includes('<div id="root"></div>')) throw new Error('#root not found in dist/index.html');
  return html.replace('<div id="root"></div>', `<div id="root">${snapshot}</div>`);
}

function writePage(route, page) {
  const file = route === '/' ? path.join(DIST, 'index.html') : path.join(DIST, route.slice(1), 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, renderPage(page));
  return route;
}

let products = [];
try {
  products = (await fetchAllWooProducts())
    .filter((product) => !hiddenIds.has(String(product.id)))
    .map((product) => woo.mapStoreProductDetail(product));
} catch (err) {
  console.warn(`[seo] product fetch failed, product pages fall back to the SPA shell: ${err?.message || err}`);
}

const productLinks = (items) => list(items.map((product) => link(seo.productPath(product.id), product.name)));
const guideHasVideo = (guide) => Boolean(guide.video) && fs.existsSync(path.join(PUBLIC, guide.video));
const rendered = [];

rendered.push(
  writePage('/', {
    seo: seo.PAGE_SEO.home,
    body: [
      '<h1>ดูแลรองเท้าคู่โปรด ได้ครบในเซตเดียว</h1>',
      `<p>${text(seo.DEFAULT_DESCRIPTION)}</p>`,
      products.length
        ? `<h2>TOP PRODUCT</h2>${productLinks(
            homeCatalog.buildHomeTopPicks(products, 6, homeCatalog.HOME_TOP_PICKS_APPEND_IDS),
          )}`
        : '',
      `<p>${link('/products', 'ดูสินค้าทั้งหมด')}</p>`,
      `<h2>บทความ</h2>${list(careGuides.map((guide) => link(seo.articlePath(guide.slug), guide.title.replace(/\s+/g, ' '))))}`,
    ].join(''),
  }),
);

rendered.push(
  writePage('/products', {
    seo: seo.PAGE_SEO.products,
    body: `<h1>BAZOOKA STORE</h1>${productLinks(products)}`,
  }),
);

rendered.push(
  writePage('/recommended', {
    seo: seo.PAGE_SEO.recommended,
    body: `<h1>TOP PRODUCT</h1>${products.length ? productLinks(homeCatalog.buildHomeTopPicks(products, 6)) : ''}`,
  }),
);

for (const product of products) {
  rendered.push(
    writePage(seo.productPath(product.id), {
      seo: seo.productSeo(product),
      body: [
        `<nav aria-label="เส้นทางนำทาง">${link('/', 'หน้าแรก')} / ${link('/products', 'สินค้า')} / ${esc(product.name)}</nav>`,
        `<h1>${esc(product.name)}</h1>`,
        product.heroDescription ? `<p>${text(product.heroDescription)}</p>` : '',
        product.aboutDescription ? `<h2>เกี่ยวกับสินค้า</h2><p>${text(product.aboutDescription)}</p>` : '',
        product.benefits?.length ? `<h2>จุดเด่น</h2>${list(product.benefits.slice(0, 6).map(esc))}` : '',
        product.howToText ? `<h2>วิธีใช้</h2><p>${text(product.howToText)}</p>` : '',
        product.sku ? `<p>SKU: ${esc(product.sku)}</p>` : '',
        `<p>${link('/products', 'กลับไปที่สินค้า')}</p>`,
      ].join(''),
    }),
  );
}

rendered.push(
  writePage('/articles', {
    seo: seo.PAGE_SEO.articles,
    body: [
      '<h1>Journal</h1>',
      '<p>คู่มือดูแลรองเท้าสั้นๆ จากทีม BAZOOKA</p>',
      list(
        careGuides.map(
          (guide) =>
            `<h2>${link(seo.articlePath(guide.slug), guide.title.replace(/\s+/g, ' '))}</h2><p>${text(guide.summary)}</p>`,
        ),
      ),
    ].join(''),
  }),
);

for (const guide of careGuides) {
  rendered.push(
    writePage(seo.articlePath(guide.slug), {
      seo: seo.articleSeo(guide),
      body: [
        `<p>${link('/articles', '← กลับไปดูบทความทั้งหมด')}</p>`,
        '<h1>เรื่องราวการดูแลรองเท้า</h1>',
        `<h2>${text(guide.title)}</h2>`,
        `<p>${text(guide.summary)}</p>`,
        guide.products?.length
          ? `<h3>สินค้าแนะนำ</h3>${list(guide.products.map((item) => esc(item.label)))}`
          : '',
      ].join(''),
    }),
  );
}

rendered.push(
  writePage('/reviews', {
    seo: seo.PAGE_SEO.reviews,
    body: [
      '<h1>Reviews</h1>',
      '<p>เสียงจากลูกค้าที่ใช้ BAZOOKA จริง</p>',
      list(
        googleReviews.map(
          (review) =>
            `<p><strong>${esc(review.name)}</strong>${review.productName ? ` – ${esc(review.productName)}` : ''}</p><p>${text(review.text)}</p>`,
        ),
      ),
    ].join(''),
  }),
);

rendered.push(
  writePage('/faq', {
    seo: seo.PAGE_SEO.faq,
    body: [
      '<h1>FAQ</h1>',
      '<p>คำตอบสั้น ๆ เกี่ยวกับสินค้า การสั่งซื้อ และการจัดส่ง</p>',
      faqItems.map((item) => `<h2>${esc(item.question)}</h2><p>${text(item.answer)}</p>`).join(''),
    ].join(''),
  }),
);

rendered.push(
  writePage('/contact', {
    seo: seo.PAGE_SEO.contact,
    body: [
      '<h1>Contact</h1>',
      '<p>ติดต่อทีม BAZOOKA สำหรับคำถามเรื่องสินค้าและการดูแลรองเท้า</p>',
      list(
        contact.contactInfo.map(
          (item) => `${esc(item.label)}: ${item.href ? link(item.href, item.value) : esc(item.value)}`,
        ),
      ),
      list(contact.socialLinks.map((item) => link(item.href, item.label))),
    ].join(''),
  }),
);

console.log(`[seo] pre-rendered ${rendered.length} pages (${products.length} products)`);

if (products.length === 0) {
  console.warn('[seo] keeping the committed sitemap because no products were loaded');
} else {
  const sitemapPaths = [
    ...Object.values(seo.PAGE_SEO).map((page) => page.path),
    ...products.map((product) => seo.productPath(product.id)),
    ...careGuides.filter(guideHasVideo).map((guide) => seo.articlePath(guide.slug)),
  ];
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...sitemapPaths.map((route) => `  <url><loc>${esc(seo.absoluteUrl(route))}</loc></url>`),
    '</urlset>',
    '',
  ].join('\n');
  fs.writeFileSync(path.join(DIST, 'sitemap.xml'), xml);
  console.log(`[seo] sitemap: ${sitemapPaths.length} URLs (${products.length} products)`);
}
