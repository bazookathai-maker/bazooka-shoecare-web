/**
 * The image the product page actually shows first.
 * Woo's first gallery file for these products is an older package graphic.
 * The product page replaces that file with the local studio image listed here.
 */
export const CATALOG_PRIMARY_IMAGES = {
  881: '/images/complete-sneaker-care.jpg',
  145: '/images/duo-set-1.jpg',
  143: '/images/pro3-1.jpg',
  136: '/images/pro2.jpg',
  134: '/images/refresh-spray.jpg',
  128: '/images/protector-spray.jpg',
  68: '/images/pro1.jpg',
  140: '/images/pro4.jpg',
  130: '/images/suede-brush.jpg',
  126: '/images/cleaner-2.jpg',
};

/** Local studio image only. Never falls back to a Woo package thumbnail. */
export function getCatalogPrimaryImage(productId) {
  const src = CATALOG_PRIMARY_IMAGES[Number(productId)];
  return typeof src === 'string' && src.startsWith('/images/') ? src : '';
}
