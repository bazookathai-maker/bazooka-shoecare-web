import { allProducts } from '../data/products';
import { careGuides } from '../data/careGuides';
import { isDisplayOnlyProduct } from '../data/productDetails';
import { formatListingName } from './productListingCopy';

function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getLocalProductHref(product) {
  if (!product?.slug || isDisplayOnlyProduct(product.slug)) {
    return '/products';
  }
  return `/products/${product.slug}`;
}

function getProductHref(product) {
  // Prefer live Woo numeric IDs
  if (product?.id != null && /^\d+$/.test(String(product.id))) {
    return `/products/${product.id}`;
  }
  return getLocalProductHref(product);
}

/**
 * Search products + articles.
 * Pass `productsCatalog` from Woo Store API when available so images/IDs stay live.
 * Falls back to local `allProducts` only when catalog is empty.
 */
export function searchSiteContent(
  rawQuery,
  { productLimit = 8, articleLimit = 8, productsCatalog = null } = {},
) {
  const query = normalize(rawQuery);
  if (!query) {
    return { query: '', products: [], articles: [] };
  }

  const catalog =
    Array.isArray(productsCatalog) && productsCatalog.length > 0
      ? productsCatalog
      : allProducts;

  const products = catalog
    .filter((product) => {
      const haystack = normalize(
        [product.name, product.category, product.description, product.sku]
          .filter(Boolean)
          .join(' '),
      );
      return haystack.includes(query);
    })
    .slice(0, productLimit)
    .map((product) => ({
      id: product.id,
      name: formatListingName(product.name),
      price: product.price,
      image: product.image,
      href: getProductHref(product),
    }));

  const articles = careGuides
    .filter((guide) => {
      const haystack = normalize(
        [guide.title, guide.category, guide.summary].filter(Boolean).join(' '),
      );
      return haystack.includes(query);
    })
    .slice(0, articleLimit)
    .map((guide) => ({
      id: guide.id,
      title: String(guide.title || '')
        .replace(/\n+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim(),
      category: guide.category || 'บทความ',
      image: guide.cover || guide.products?.[0]?.image || '',
      href: `/articles/${guide.slug}`,
    }));

  return { query, products, articles };
}

/**
 * Recommended products for 404 / overlays.
 * Prefer live Woo catalog; local `allProducts` only as last resort.
 */
export function getRecommendedProducts(limit = 4, productsCatalog = null) {
  const catalog =
    Array.isArray(productsCatalog) && productsCatalog.length > 0
      ? productsCatalog
      : allProducts;

  const bestsellers = catalog.filter((product) => product.isBestseller);
  const source = bestsellers.length ? bestsellers : catalog;

  return source.slice(0, limit).map((product) => ({
    id: product.id,
    name: formatListingName(product.name),
    price: product.price,
    image: product.image,
    href: getProductHref(product),
  }));
}
