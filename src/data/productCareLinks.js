/** Care-guide links shown on specific product pages. Keyed by WooCommerce id. */
const SUEDE_CLEAN_LINK = {
  href: '/articles/suede-clean',
  label: 'วิธีทำความสะอาดรองเท้าหนังกลับ',
};

const LINKS_BY_PRODUCT_ID = {
  130: SUEDE_CLEAN_LINK,
  128: SUEDE_CLEAN_LINK,
  145: SUEDE_CLEAN_LINK,
};

export function getProductCareLink(productId) {
  return LINKS_BY_PRODUCT_ID[String(productId)] ?? null;
}
