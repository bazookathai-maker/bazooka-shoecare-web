import { useRef } from 'react';
import AddToCartButton from './AddToCartButton';

export default function ShowcaseProductCard({ product, titleTag: TitleTag = 'h3' }) {
  const mediaRef = useRef(null);

  return (
    <article className="featured-products__card">
      <div className="featured-products__media" ref={mediaRef}>
        <img
          src={product.image}
          alt={product.name}
          className="featured-products__image"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="featured-products__info">
        <TitleTag className="featured-products__name">{product.name}</TitleTag>
        {product.description ? (
          <p className="featured-products__description">{product.description}</p>
        ) : null}
        <p className="featured-products__price">
          ฿{product.price.toLocaleString()}
        </p>
      </div>
      <AddToCartButton product={product} mediaRef={mediaRef} />
    </article>
  );
}
