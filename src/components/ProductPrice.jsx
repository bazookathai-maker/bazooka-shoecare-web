import { hasActiveDiscount } from '../utils/productSale';
import './ProductPrice.css';

function formatBaht(value) {
  return `฿${Number(value || 0).toLocaleString('th-TH')}`;
}

/** Sale price, preceded by the struck-through regular price only on a real Woo discount. */
export default function ProductPrice({ price, regularPrice, isOnSale }) {
  const sale = Number(price);
  const regular = Number(regularPrice);
  if (!hasActiveDiscount({ price, regularPrice, isOnSale })) {
    return formatBaht(price);
  }

  return (
    <span className="product-price">
      <del className="product-price__regular">
        <span className="visually-hidden">ราคาปกติ </span>
        {formatBaht(regular)}
      </del>
      <span className="product-price__sale">
        <span className="visually-hidden">ราคาขาย </span>
        {formatBaht(sale)}
      </span>
    </span>
  );
}
