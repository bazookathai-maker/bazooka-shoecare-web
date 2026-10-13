import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { isDisplayOnlyProduct } from '../data/productDetails';
import {
  formatListingDescription,
  formatListingName,
} from '../utils/productListingCopy';
import AddToCartButton from './AddToCartButton';
import ProductPrice from './ProductPrice';
import './ProductCard.css';

/** Badge only; the product stays in the bestseller filter and Home ordering. 134 = Refresh Spray, 126 = Bazooka Cleaner single bottle. */
const BESTSELLER_BADGE_HIDDEN_IDS = new Set(['134', '126']);

function getDetailPath(product, linkToDetail) {
  if (!linkToDetail) return null;

  // WooCommerce products use numeric ids in the URL (e.g. /products/147)
  if (
    typeof product.id === 'number' ||
    (typeof product.id === 'string' && /^\d+$/.test(product.id))
  ) {
    return `/products/${product.id}`;
  }

  if (!product.slug || isDisplayOnlyProduct(product.slug)) {
    return null;
  }
  return `/products/${product.slug}`;
}

export default function ProductCard({
  product,
  variant = 'default',
  showAddToCart = true,
  showPrice = true,
  useCase,
  linkToDetail = true,
}) {
  const useCaseText = useCase ?? product.useCase;
  const mediaRef = useRef(null);
  const detailPath = getDetailPath(product, linkToDetail);
  const isListingCard = variant === 'compact';
  const isRecommendCard = variant === 'recommend';
  const showBestsellerBadge =
    product.isBestseller && !BESTSELLER_BADGE_HIDDEN_IDS.has(String(product.id));

  const displayName =
    isListingCard || isRecommendCard
      ? formatListingName(product.name)
      : product.name;
  const displayDescription = isListingCard
    ? formatListingDescription(
        product.shortDescription,
        product.longDescription || product.description,
      )
    : isRecommendCard
      ? ''
      : product.description;

  return (
    <article
      className={`product-card product-card--${variant}${
        detailPath ? ' product-card--linked' : ''
      }`}
    >
      {detailPath && (
        <Link
          to={detailPath}
          className="product-card__stretched-link"
          aria-label={`ดู ${displayName}`}
        />
      )}

      <div className="product-card__media" ref={mediaRef}>
        {!isRecommendCard && showBestsellerBadge ? (
          <div className="product-card__badges">
            <span className="product-card__bestseller-badge">ขายดี</span>
          </div>
        ) : null}
        {!isRecommendCard ? (
          <span className="product-card__category">{product.category}</span>
        ) : null}
        <div className="product-card__image-wrap">
          <img
            src={product.image}
            alt={displayName}
            className="product-card__image"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>

      <div className="product-card__body">
        <h3 className="product-card__name">{displayName}</h3>
        {isListingCard ? (
          <p
            className={`product-card__description${
              displayDescription ? '' : ' product-card__description--empty'
            }`}
          >
            {displayDescription || '\u00A0'}
          </p>
        ) : !isRecommendCard && displayDescription ? (
          <p className="product-card__description">{displayDescription}</p>
        ) : null}
        {!isRecommendCard && useCaseText ? (
          <p className="product-card__use-case">{useCaseText}</p>
        ) : null}
        {showPrice && (
          <p className="product-card__price">
            <ProductPrice
              price={product.price}
              regularPrice={product.regularPrice}
              isOnSale={product.isOnSale}
            />
          </p>
        )}
      </div>

      {isRecommendCard && detailPath ? (
        <Link to={detailPath} className="product-card__view-btn">
          ดูสินค้า
        </Link>
      ) : null}

      {!isRecommendCard && showAddToCart ? (
        <AddToCartButton product={product} mediaRef={mediaRef} />
      ) : null}
    </article>
  );
}
