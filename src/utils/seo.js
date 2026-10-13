export const SITE_URL = 'https://www.bazookashoecare.com';
export const SITE_NAME = 'BAZOOKA Thailand';
export const BRAND_NAME = 'BAZOOKA';
export const HOME_TITLE = `${SITE_NAME} | ดูแลรองเท้าคู่โปรด ได้ครบในเซตเดียว`;
export const DEFAULT_DESCRIPTION =
  'ดูแลรองเท้าคู่โปรดได้ครบในเซตเดียวกับ BAZOOKA น้ำยาทำความสะอาดรองเท้า สเปรย์กันน้ำ กันคราบ และสเปรย์ดับกลิ่นรองเท้า';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/hero.jpg`;

/** Public, content-bearing pages listed in the sitemap (products and articles are added separately). */
export const SITEMAP_STATIC_PATHS = [
  '/',
  '/products',
  '/recommended',
  '/articles',
  '/reviews',
  '/faq',
  '/contact',
];

export function absoluteUrl(path) {
  return `${SITE_URL}${path === '/' ? '/' : path}`;
}

export function productPath(id) {
  return `/products/${id}`;
}

export function articlePath(slug) {
  return `/articles/${slug}`;
}

export function shortenText(text, maxLen = 155) {
  const value = String(text || '')
    .replace(/\s+/g, ' ')
    .trim();
  if (value.length <= maxLen) return value;
  const sliced = value.slice(0, maxLen);
  const cut = sliced.lastIndexOf(' ');
  return `${(cut > maxLen * 0.6 ? sliced.slice(0, cut) : sliced).trim()}…`;
}

const SCHEMA_AVAILABILITY = {
  instock: 'https://schema.org/InStock',
  onbackorder: 'https://schema.org/BackOrder',
  outofstock: 'https://schema.org/OutOfStock',
};

/** Product JSON-LD built only from the fields the product page renders. */
export function buildProductJsonLd(product) {
  const url = absoluteUrl(productPath(product.id));
  const images = (product.gallery || []).map((image) => image.src).filter(Boolean);
  const description = product.aboutDescription || product.heroDescription || '';

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    ...(images.length > 0 ? { image: images } : {}),
    ...(description ? { description } : {}),
    ...(product.sku ? { sku: product.sku } : {}),
    brand: { '@type': 'Brand', name: BRAND_NAME },
    url,
    offers: {
      '@type': 'Offer',
      url,
      price: String(product.price),
      priceCurrency: product.currency || 'THB',
      availability:
        SCHEMA_AVAILABILITY[product.stockStatus] || SCHEMA_AVAILABILITY.outofstock,
    },
  };
}
