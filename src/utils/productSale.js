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
