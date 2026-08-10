import fs from 'fs';

const file = fs
  .readdirSync('dist/assets')
  .find((f) => f.endsWith('.js'));
const j = fs.readFileSync(`dist/assets/${file}`, 'utf8');

const markers = [
  '/api/cart',
  '/api/products',
  '/api/create-order',
  'wp-json/wc/store/v1',
  'WOOCOMMERCE_CONSUMER',
  '/add-item',
  '${',
];

for (const m of markers) {
  console.log(m, j.includes(m));
}

const i = j.indexOf('/add-item');
console.log('add-item context:', j.slice(Math.max(0, i - 100), i + 40));

const i2 = j.indexOf('/cart');
console.log('cart context:', j.slice(Math.max(0, i2 - 80), i2 + 40));
