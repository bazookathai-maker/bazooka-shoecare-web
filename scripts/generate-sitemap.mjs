/**
 * Writes sitemap.xml: public content pages, care-guide articles, and the products shown on /products.
 * Usage: node scripts/generate-sitemap.mjs <output file>
 * Runs after `vite build` (output dist/sitemap.xml). If the product list can't be fetched,
 * the existing file (copied from public/sitemap.xml) is left in place and the build continues.
 */
import fs from 'node:fs';
import { fetchAllWooProducts } from '../server/wooProducts.js';
import { careGuides } from '../src/data/careGuides.js';
import { LISTING_HIDDEN_PRODUCT_IDS } from '../src/data/hiddenProducts.js';
import {
  SITEMAP_STATIC_PATHS,
  absoluteUrl,
  articlePath,
  productPath,
} from '../src/utils/seo.js';

const outFile = process.argv[2];
if (!outFile) {
  console.error('Usage: node scripts/generate-sitemap.mjs <output file>');
  process.exit(1);
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

let products;
try {
  products = await fetchAllWooProducts();
} catch (err) {
  console.warn(`[sitemap] product fetch failed, keeping existing ${outFile}: ${err?.message || err}`);
  process.exit(0);
}

const listedProductIds = products
  .map((product) => String(product.id))
  .filter((id) => !LISTING_HIDDEN_PRODUCT_IDS.has(id));

if (listedProductIds.length === 0) {
  console.warn(`[sitemap] no products returned, keeping existing ${outFile}`);
  process.exit(0);
}

const paths = [
  ...SITEMAP_STATIC_PATHS,
  ...listedProductIds.map(productPath),
  ...careGuides.map((guide) => articlePath(guide.slug)),
];

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...paths.map((path) => `  <url><loc>${escapeXml(absoluteUrl(path))}</loc></url>`),
  '</urlset>',
  '',
].join('\n');

fs.writeFileSync(outFile, xml);
console.log(`[sitemap] ${outFile}: ${paths.length} URLs (${listedProductIds.length} products)`);
