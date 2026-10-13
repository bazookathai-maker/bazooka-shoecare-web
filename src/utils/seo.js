export const SITE_URL = 'https://www.bazookashoecare.com';
export const SITE_NAME = 'BAZOOKA Thailand';
export const BRAND_NAME = 'BAZOOKA';
export const HOME_TITLE = `${SITE_NAME} | ดูแลรองเท้าคู่โปรด ได้ครบในเซตเดียว`;
export const DEFAULT_DESCRIPTION =
  'ดูแลรองเท้าคู่โปรดได้ครบในเซตเดียวกับ BAZOOKA น้ำยาทำความสะอาดรองเท้า สเปรย์กันน้ำ กันคราบ และสเปรย์ดับกลิ่นรองเท้า';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/hero.jpg`;

/**
 * Public, content-bearing pages: used by each page's useSeo, the build-time pre-render, and the sitemap.
 * Products and articles are added separately.
 */
export const PAGE_SEO = {
  home: { path: '/', fullTitle: HOME_TITLE, description: DEFAULT_DESCRIPTION },
  products: {
    path: '/products',
    title: 'สินค้าทั้งหมด',
    description:
      'สินค้าทั้งหมดจาก BAZOOKA น้ำยาทำความสะอาดรองเท้า สเปรย์กันน้ำ สเปรย์ดับกลิ่น แปรง และชุดดูแลรองเท้าครบเซต',
  },
  recommended: {
    path: '/recommended',
    title: 'TOP PRODUCT สินค้าแนะนำ',
    description: 'TOP PRODUCT สินค้าขายดีและสินค้าแนะนำจาก BAZOOKA สำหรับดูแลรองเท้าคู่โปรด',
  },
  articles: {
    path: '/articles',
    title: 'บทความดูแลรองเท้า',
    description:
      'คู่มือดูแลรองเท้าสั้นๆ จากทีม BAZOOKA วิธีทำความสะอาดรองเท้าสีขาว รองเท้าหนังกลับ รองเท้าวิ่ง รองเท้า CROCS การปกป้อง และการดับกลิ่น',
  },
  reviews: {
    path: '/reviews',
    title: 'รีวิวจากลูกค้า',
    description: 'รีวิว BAZOOKA เสียงจากลูกค้าที่ใช้ผลิตภัณฑ์ดูแลรองเท้า BAZOOKA จริง',
  },
  faq: {
    path: '/faq',
    title: 'คำถามที่พบบ่อย',
    description: 'คำถามที่พบบ่อยเกี่ยวกับสินค้า BAZOOKA การสั่งซื้อ และการจัดส่ง',
  },
  contact: {
    path: '/contact',
    title: 'ติดต่อเรา',
    description:
      'ติดต่อทีม BAZOOKA สำหรับคำถามเรื่องสินค้าและการดูแลรองเท้า ทางอีเมล LINE @bazookath และโซเชียลมีเดีย',
  },
};

export function formatTitle({ title, fullTitle }) {
  return fullTitle || (title ? `${title} | ${SITE_NAME}` : SITE_NAME);
}

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

export function toAbsoluteAssetUrl(src) {
  if (!src) return '';
  return src.startsWith('/') ? absoluteUrl(src) : src;
}

/** title/description/path/image for a product detail (output of mapStoreProductDetail). */
export function productSeo(product) {
  return {
    title: product.name,
    description: shortenText(
      [product.name, product.heroDescription || product.aboutDescription]
        .filter(Boolean)
        .join(' – '),
    ),
    path: productPath(product.id),
    image: product.gallery?.[0]?.src || product.image,
    type: 'product',
  };
}

/** title/description/path/image for a care guide or WordPress post. */
export function articleSeo(article) {
  return {
    title: article.title.replace(/\s+/g, ' ').trim(),
    description: shortenText(article.summary),
    path: articlePath(article.slug),
    image: toAbsoluteAssetUrl(article.cover),
    type: 'article',
  };
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
