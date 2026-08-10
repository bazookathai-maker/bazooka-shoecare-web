import { fetchStoreProducts } from '../api/woocommerce';
import { fetchWpPosts } from '../api/wordpress';
import { articleSlides, homeOurProducts, homeTopPicks } from '../data/homeStory';
import { formatListingName } from './productListingCopy';

let storeProductsPromise = null;
let wpPostsPromise = null;

/**
 * Shared Home/catalog fetch.
 * Concurrent callers share one in-flight request.
 * In DEV the cache is cleared after resolve so remounts always get latest images.
 */
export function getCachedStoreProducts({ force = false } = {}) {
  if (force) {
    storeProductsPromise = null;
  }

  if (!storeProductsPromise) {
    const request = fetchStoreProducts()
      .then((products) => {
        if (import.meta.env.DEV) {
          Promise.resolve().then(() => {
            if (storeProductsPromise === request) {
              storeProductsPromise = null;
            }
          });
        }
        return products;
      })
      .catch((error) => {
        storeProductsPromise = null;
        throw error;
      });
    storeProductsPromise = request;
  }

  return storeProductsPromise;
}

/** Drop in-memory product cache (e.g. after admin updates images). */
export function clearStoreProductsCache() {
  storeProductsPromise = null;
}

/** Shared WordPress posts fetch for Home article slides. */
export function getCachedWpPosts() {
  if (!wpPostsPromise) {
    wpPostsPromise = fetchWpPosts({ perPage: 12 })
      .then((result) => result.posts || [])
      .catch((error) => {
        wpPostsPromise = null;
        throw error;
      });
  }
  return wpPostsPromise;
}

function productHref(product) {
  if (!product?.id) return '/products';
  return `/products/${product.id}`;
}

function scorePillarMatch(product, pillarId) {
  const name = String(product.name || '').toLowerCase();
  const category = String(product.filterCategory || '');
  const haystack = `${name} ${product.shortDescription || ''} ${product.description || ''}`.toLowerCase();

  if (pillarId === 'cleaner') {
    if (category === 'cleaners') return 4;
    if (/organic|คลีนเนอร์|cleaner/.test(haystack) && !/spray\s*\+|ชุด|set/.test(haystack)) {
      return 3;
    }
    return 0;
  }

  if (pillarId === 'protector') {
    if (category === 'protectors') return 4;
    if (/protector|กันน้ำ|protect/.test(haystack) && !/refresh|ดับกลิ่น/.test(haystack)) {
      return 3;
    }
    return 0;
  }

  if (pillarId === 'refresh') {
    if (category === 'refresh') return 4;
    if (/refresh|ดับกลิ่น/.test(haystack)) return 3;
    return 0;
  }

  return 0;
}

function pickBestProduct(products, pillarId) {
  let best = null;
  let bestScore = 0;

  products.forEach((product) => {
    const score = scorePillarMatch(product, pillarId);
    if (score > bestScore) {
      best = product;
      bestScore = score;
    }
  });

  return bestScore > 0 ? best : null;
}

function pickKitProduct(products) {
  const kits = products.filter((product) => product.filterCategory === 'kits');
  if (kits.length) {
    return kits.find((product) => product.isBestseller) || kits[0];
  }
  return products.find((product) => product.isBestseller) || products[0] || null;
}

function shortenBenefit(text, fallback) {
  const cleaned = String(text || '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleaned) return fallback;
  if (cleaned.length <= 90) return cleaned;
  return `${cleaned.slice(0, 87).trim()}…`;
}

/**
 * Clean / Protect / Refresh pillars: keep marketing GIFs + labels,
 * hydrate name / benefit / poster / PDP link from live Woo products when possible.
 * Poster uses Woo `images[0]` when present; local pillar image only if Woo has none.
 */
export function buildHomeOurProducts(liveProducts = []) {
  const catalog = Array.isArray(liveProducts) ? liveProducts : [];

  return homeOurProducts.map((pillar) => {
    const matched = pickBestProduct(catalog, pillar.id);
    if (!matched) {
      return {
        ...pillar,
        href: '/products',
        source: 'fallback',
      };
    }

    const wooImage = matched.image || '';

    return {
      ...pillar,
      wooId: matched.id,
      sku: matched.sku || '',
      name: formatListingName(matched.name) || pillar.name,
      benefit: shortenBenefit(
        matched.shortDescription || matched.description,
        pillar.benefit,
      ),
      image: wooImage || pillar.image,
      href: productHref(matched),
      source: wooImage ? 'woocommerce' : 'fallback',
    };
  });
}

/** Complete Care System slide — use a real kit product image when available. */
export function buildHomeGroupSlide(liveProducts = []) {
  const fallback = {
    type: 'group',
    id: 'complete-care-system',
    title: 'Complete Care System',
    text: 'ครบทุกขั้นตอนสำหรับการดูแลรองเท้าคู่โปรด',
    image: '/products/product-27.jpg.jpg',
    fallback: '/products/product-16.jpg.jpg',
    href: '/products',
    source: 'fallback',
  };

  const kit = pickKitProduct(Array.isArray(liveProducts) ? liveProducts : []);
  if (!kit) return fallback;

  const wooImage = kit.image || '';

  return {
    ...fallback,
    image: wooImage || fallback.image,
    // Only keep local fallback when Woo has no real primary image
    fallback: wooImage ? '' : fallback.fallback,
    href: productHref(kit),
    source: wooImage ? 'woocommerce' : 'fallback',
  };
}

/**
 * TOP PRODUCT / สินค้าแนะนำ — live Woo catalog only.
 * Prefer bestsellers, then fill remaining slots.
 * Local `homeTopPicks` images are used only when the catalog is empty.
 */
export function buildHomeTopPicks(liveProducts = [], limit = 6) {
  const catalog = Array.isArray(liveProducts) ? liveProducts : [];
  if (!catalog.length) {
    return homeTopPicks.slice(0, limit).map((item) => ({
      ...item,
      name: String(item.name || '').replace(/\n+/g, ' ').trim(),
      source: 'fallback',
    }));
  }

  const bestsellers = catalog.filter((product) => product.isBestseller);
  const rest = catalog.filter((product) => !product.isBestseller);
  const selected = [...bestsellers, ...rest].slice(0, limit);

  return selected.map((product) => {
    const wooImage = product.image || '';
    return {
      id: product.id,
      sku: product.sku || '',
      name: formatListingName(product.name),
      description: product.shortDescription || product.description || '',
      price: product.price,
      badge: product.isBestseller ? 'BEST SELLER' : product.category,
      image: wooImage,
      // No local fallback when Woo already provided a primary image
      fallback: '',
      href: productHref(product),
      source: wooImage ? 'woocommerce' : 'fallback',
    };
  });
}

/**
 * HOW TO CARE article slider images from WordPress featured media.
 * Falls back to local placeholder slides when WP has no usable covers.
 */
export function buildHomeArticleSlides(wpPosts = []) {
  const covers = (Array.isArray(wpPosts) ? wpPosts : [])
    .map((post) => ({
      image: post.cover,
      href: `/articles/${post.slug}`,
    }))
    .filter((slide) => Boolean(slide.image));

  // Default cover used by mapper when WP has no featured image — treat as empty.
  const realCovers = covers.filter(
    (slide) => !String(slide.image).includes('/products/cleaner-howto-1.jpg'),
  );

  if (realCovers.length >= 2) {
    return realCovers.slice(0, 4);
  }

  if (realCovers.length === 1) {
    return [realCovers[0], ...articleSlides.slice(0, 1)];
  }

  return articleSlides;
}
