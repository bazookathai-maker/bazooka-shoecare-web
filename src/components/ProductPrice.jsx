import { hasActiveDiscount } from '../utils/productSale';
import { useLocale } from '../i18n/LocaleContext';
import './ProductPrice.css';

function formatBaht(value) {
  return `฿${Number(value || 0).toLocaleString('th-TH')}`;
}

/** Sale price, preceded by the struck-through regular price only on a real Woo discount. */
export default function ProductPrice({ price, regularPrice, isOnSale }) {
  const { t } = useLocale();
  const sale = Number(price);
  const regular = Number(regularPrice);
  if (!hasActiveDiscount({ price, regularPrice, isOnSale })) {
    return formatBaht(price);
  }

  return (
    <span className="product-price">
      <del className="product-price__regular">
        <span className="visually-hidden">{t.catalog.regularPrice} </span>
        {formatBaht(regular)}
      </del>
      <span className="product-price__sale">
        <span className="visually-hidden">{t.catalog.salePrice} </span>
        {formatBaht(sale)}
      </span>
    </span>
  );
}
