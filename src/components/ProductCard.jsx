import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { isDisplayOnlyProduct } from '../data/productDetails';
import AddToCartButton from './AddToCartButton';
import './ProductCard.css';

function getDetailPath(product, linkToDetail) {
  if (!linkToDetail || !product.slug || isDisplayOnlyProduct(product.slug)) {
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
          aria-label={`ดู ${product.name}`}
        />
      )}

      <div className="product-card__media" ref={mediaRef}>
        {product.isBestseller ? (
          <span className="product-card__bestseller-badge">ขายดี</span>
        ) : null}
        <span className="product-card__category">{product.category}</span>
        <div className="product-card__image-wrap">
          <img
            src={product.image}
            alt={product.name}
            className="product-card__image"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>

      <div className="product-card__body">
        <h3 className="product-card__name">{product.name}</h3>
        <p className="product-card__description">{product.description}</p>
        {useCaseText && (
          <p className="product-card__use-case">{useCaseText}</p>
        )}
        {showPrice && (
          <p className="product-card__price">
            ฿{product.price.toLocaleString()}
          </p>
        )}
      </div>

      {showAddToCart && (
        <AddToCartButton product={product} mediaRef={mediaRef} />
      )}
    </article>
  );
}
