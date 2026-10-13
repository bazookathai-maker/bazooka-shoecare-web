/** Cards that keep the struck-through price but show no "ลดราคา" badge. 126 = Bazooka Cleaner single bottle. */
const SALE_BADGE_HIDDEN_IDS = new Set(['126']);

/** True only when WooCommerce flags an active sale and the sale price is below the regular price. */
export function hasActiveDiscount({ price, regularPrice, isOnSale }) {
  const sale = Number(price);
  const regular = Number(regularPrice);
  return (
    Boolean(isOnSale) &&
    Number.isFinite(regular) &&
    Number.isFinite(sale) &&
    regular > sale
  );
}

export function showSaleBadge(product) {
  return (
    hasActiveDiscount(product) && !SALE_BADGE_HIDDEN_IDS.has(String(product.id))
  );
}
