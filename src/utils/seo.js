import { CONTACT_EMAIL, contactInfo, socialLinks } from '../data/contact';
import { getArticleStoreProducts } from '../data/knowledgeHub';
import { RETURN_POLICY, SHIPPING_POLICY } from '../data/storePolicies';
import { localizePath, stripLocale } from '../i18n/locale';
import { localizedProductName } from '../i18n/productCopy';

/**
 * English public pages are in the sitemap.
 * Member, cart, checkout, order, and hidden-product pages stay noindex.
 * Private /en routes keep their own X-Robots-Tag headers in vercel.json.
 */
export const INDEX_ENGLISH = true;

export const SITE_URL = 'https://www.bazookashoecare.com';
export const SITE_NAME = 'BAZOOKA Thailand';
export const BRAND_NAME = 'BAZOOKA';
export const HOME_TITLE = `${SITE_NAME} | ดูแลรองเท้าคู่โปรด ได้ครบในเซตเดียว`;
export const DEFAULT_DESCRIPTION =
  'ดูแลรองเท้าคู่โปรดได้ครบในเซตเดียวกับ BAZOOKA น้ำยาทำความสะอาดรองเท้า สเปรย์กันน้ำ กันคราบ และสเปรย์ดับกลิ่นรองเท้า';
export const DEFAULT_DESCRIPTION_EN =
  'Care for the shoes you love with BAZOOKA shoe cleaner, water-repellent spray, and deodorizing spray in one set.';
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
    description:
      'คำถามที่พบบ่อยเรื่องการทำความสะอาดรองเท้า สเปรย์กันน้ำ สเปรย์ดับกลิ่น การสั่งซื้อ และการจัดส่ง',
  },
  contact: {
    path: '/contact',
    title: 'ติดต่อเรา',
    description:
      'ติดต่อทีม BAZOOKA สำหรับคำถามเรื่องสินค้าและการดูแลรองเท้า ทางอีเมล LINE @bazookath และโซเชียลมีเดีย',
  },
  shippingPolicy: {
    path: SHIPPING_POLICY.path,
    title: SHIPPING_POLICY.title,
    description: SHIPPING_POLICY.description,
  },
  returnPolicy: {
    path: RETURN_POLICY.path,
    title: RETURN_POLICY.title,
    description: RETURN_POLICY.description,
  },
};

export function formatTitle({ title, fullTitle }) {
  return fullTitle || (title ? `${title} | ${SITE_NAME}` : SITE_NAME);
}

export function absoluteUrl(path) {
  return `${SITE_URL}${path === '/' ? '/' : path}`;
}

export function barePublicPath(path) {
  const value = String(path || '/').split(/[?#]/)[0] || '/';
  return stripLocale(value);
}

export function localizedPublicPath(path, locale) {
  return localizePath(barePublicPath(path), locale === 'en' ? 'en' : 'th');
}

/** Reciprocal alternates. x-default is the original Thai URL. */
export function hreflangAlternates(path) {
  const bare = barePublicPath(path);
  const thai = absoluteUrl(localizedPublicPath(bare, 'th'));
  const english = absoluteUrl(localizedPublicPath(bare, 'en'));
  return [
    { hreflang: 'th', href: thai },
    { hreflang: 'en', href: english },
    { hreflang: 'x-default', href: thai },
  ];
}

export function isEnglishPath(path) {
  const value = String(path || '');
  return value === '/en' || value.startsWith('/en/');
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

/**
 * The primary image is the first picture the product page shows.
 * Only a file hosted on this site is used. WooCommerce gallery URLs are left out
 * until each one has been checked against the live page.
 */
export function productPrimaryImage(product) {
  const src = product?.gallery?.[0]?.src || product?.image || '';
  const absolute = toAbsoluteAssetUrl(src);
  if (!absolute.startsWith(`${SITE_URL}/images/`)) return '';
  return absolute;
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
    image: productPrimaryImage(product),
    type: 'product',
  };
}

/** title/description/path/image for a care guide or WordPress post. */
export function articleSeo(article) {
  return {
    title: article.title.replace(/\s+/g, ' ').trim(),
    description: article.description || shortenText(article.summary),
    path: articlePath(article.slug),
    image: toAbsoluteAssetUrl(article.cover),
    type: 'article',
  };
}

/**
 * Dates that are both shown from `publishedAt` and tied to the commit that added the article.
 * Other `publishedAt` values are earlier than the content history, so they stay off the schema.
 */
const VERIFIED_ARTICLE_DATES = {
  'shoe-cleaner': {
    published: '2026-11-03',
    modified: '2026-11-03',
  },
};

export function getVerifiedArticleDates(article) {
  const record =
    VERIFIED_ARTICLE_DATES[article?.slug] || VERIFIED_ARTICLE_DATES[article?.id];
  if (!record || article?.publishedAt !== record.published) return null;
  return record;
}

/** Article JSON-LD for a guide whose visible title and description are already set. No prices or reviews. */
function organizationReference(includeId) {
  return {
    '@type': 'Organization',
    ...(includeId ? { '@id': ORGANIZATION_ID } : {}),
    name: SITE_NAME,
    url: `${SITE_URL}/`,
  };
}

export function buildArticleJsonLd(article, locale = 'th') {
  const page = articleSeo(article);
  const path = localizedPublicPath(page.path, locale);
  const isSuedeArticle = article?.id === 'suede-clean' || article?.slug === 'suede-clean';
  const mentionedProducts = getArticleStoreProducts(article?.id || article?.slug);
  const organization = organizationReference(isSuedeArticle);
  const dates = getVerifiedArticleDates(article);
  const imageOnPage = Boolean(article?.longform && page.image);

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: page.title,
    description: page.description,
    inLanguage: locale === 'en' ? 'en' : 'th',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': absoluteUrl(path),
    },
    ...(dates
      ? { datePublished: dates.published, dateModified: dates.modified }
      : {}),
    ...(imageOnPage ? { image: page.image } : {}),
    ...(mentionedProducts.length
      ? {
          mentions: mentionedProducts.map((item) => {
            const href = localizedPublicPath(item.href, locale);
            const productId = String(item.href).match(/\/products\/(\d+)/)?.[1];
            return {
              '@type': 'Product',
              '@id': `${absoluteUrl(href)}#product`,
              name: localizedProductName(productId, item.label, locale),
              url: absoluteUrl(href),
            };
          }),
        }
      : {}),
    author: organization,
    publisher: organization,
  };
}

const SCHEMA_AVAILABILITY = {
  instock: 'https://schema.org/InStock',
  onbackorder: 'https://schema.org/BackOrder',
  outofstock: 'https://schema.org/OutOfStock',
};

export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const RETURN_POLICY_ID = `${absoluteUrl(RETURN_POLICY.path)}#policy`;
export const SHIPPING_SERVICE_ID = `${absoluteUrl(SHIPPING_POLICY.path)}#policy`;

const ALL_DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
].map((day) => `https://schema.org/${day}`);

const dayRange = ({ min, max }) => ({
  '@type': 'QuantitativeValue',
  minValue: min,
  maxValue: max,
  unitCode: 'DAY',
});

/** Offer-level shipping details (free shipping within Thailand). */
export function buildOfferShippingDetails() {
  const s = SHIPPING_POLICY.structured;
  return {
    '@type': 'OfferShippingDetails',
    shippingRate: { '@type': 'MonetaryAmount', value: s.rate, currency: s.currency },
    shippingDestination: { '@type': 'DefinedRegion', addressCountry: s.country },
    deliveryTime: {
      '@type': 'ShippingDeliveryTime',
      handlingTime: dayRange(s.handlingDays),
      transitTime: dayRange(s.transitDays),
      businessDays: { '@type': 'OpeningHoursSpecification', dayOfWeek: ALL_DAYS_OF_WEEK },
    },
  };
}

/**
 * Store-level policies for the policy pages. Returns are only accepted for transit damage or quality
 * problems, which MerchantReturnPolicy's return-window fields can't express without implying
 * change-of-mind returns, so the return policy is given as a link to the policy page only. Offers don't
 * reference it: an offer-level policy needs applicableCountry and returnPolicyCategory, and Google
 * prefers an offer-level policy over the store-level one.
 */
export function buildStorePoliciesJsonLd(locale = 'th') {
  const s = SHIPPING_POLICY.structured;
  const shippingName = locale === 'en' ? 'Shipping policy' : SHIPPING_POLICY.title;
  const servicePeriod = (range) => ({
    '@type': 'ServicePeriod',
    businessDays: ALL_DAYS_OF_WEEK,
    duration: dayRange(range),
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'OnlineStore',
    inLanguage: locale === 'en' ? 'en' : 'th',
    ...organizationProfile(),
    hasMerchantReturnPolicy: {
      '@type': 'MerchantReturnPolicy',
      '@id': RETURN_POLICY_ID,
      merchantReturnLink: absoluteUrl(localizedPublicPath(RETURN_POLICY.path, locale)),
    },
    hasShippingService: {
      '@type': 'ShippingService',
      '@id': SHIPPING_SERVICE_ID,
      name: shippingName,
      handlingTime: servicePeriod(s.handlingDays),
      shippingConditions: {
        '@type': 'ShippingConditions',
        shippingDestination: { '@type': 'DefinedRegion', addressCountry: s.country },
        shippingRate: { '@type': 'MonetaryAmount', value: s.rate, currency: s.currency },
        transitTime: servicePeriod(s.transitDays),
      },
    },
  };
}

/** Public profile shared by the homepage Organization and the policy-page OnlineStore. */
function organizationProfile() {
  const sameAs = [...contactInfo, ...socialLinks]
    .map((item) => item.href)
    .filter((href) => typeof href === 'string' && href.startsWith('https://'));

  return {
    '@id': ORGANIZATION_ID,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    logo: toAbsoluteAssetUrl('/bazooka-logo-black.png'),
    email: CONTACT_EMAIL,
    sameAs,
  };
}

/** Organization JSON-LD for the homepage. No address or unverified profiles. */
export function buildOrganizationJsonLd(locale = 'th') {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    inLanguage: locale === 'en' ? 'en' : 'th',
    ...organizationProfile(),
  };
}

/**
 * Product JSON-LD from the same mapped product the page renders.
 * A missing or non-positive price omits the offer instead of inventing one.
 * Stock follows the buy button: in stock, or out of stock.
 */
export function buildProductJsonLd(product, locale = 'th') {
  const url = absoluteUrl(localizedPublicPath(productPath(product.id), locale));
  const image = productPrimaryImage(product);
  const description = product.aboutDescription || product.heroDescription || '';
  const sku = typeof product.sku === 'string' ? product.sku : '';
  const price = Number(product.price);
  const availability =
    product.isInStock === true
      ? SCHEMA_AVAILABILITY.instock
      : product.isInStock === false
        ? SCHEMA_AVAILABILITY.outofstock
        : '';

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${url}#product`,
    inLanguage: locale === 'en' ? 'en' : 'th',
    name: product.name,
    ...(image ? { image } : {}),
    ...(description ? { description } : {}),
    ...(sku.trim() ? { sku } : {}),
    brand: { '@type': 'Brand', name: BRAND_NAME },
    url,
    ...(Number.isFinite(price) && price > 0
      ? {
          offers: {
            '@type': 'Offer',
            url,
            price: String(price),
            priceCurrency: product.currency || 'THB',
            ...(availability ? { availability } : {}),
            shippingDetails: buildOfferShippingDetails(),
          },
        }
      : {}),
  };
}
