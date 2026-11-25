import { useRef } from 'react';
import AddToCartButton from './AddToCartButton';
import { useLocale } from '../i18n/LocaleContext';
import { localizeStoreProduct } from '../i18n/productCopy';

export default function ShowcaseProductCard({ product, titleTag: TitleTag = 'h3' }) {
  const { locale } = useLocale();
  const view = localizeStoreProduct(
    {
      ...product,
      id: product.wooId || product.id,
      shortDescription: product.description,
      description: product.description,
    },
    locale,
  );
  const mediaRef = useRef(null);

  return (
    <article
      className={`featured-products__card${
        product.imageFrame === 'fill' ? ' featured-products__card--fill' : ''
      }`}
    >
      <div className="featured-products__media" ref={mediaRef}>
        {product.image ? (
          <img
            src={product.image}
            alt={view.name}
            className="featured-products__image"
            loading="lazy"
            decoding="async"
          />
        ) : null}
      </div>
      <div className="featured-products__info">
        <TitleTag className="featured-products__name">{view.name}</TitleTag>
        {view.shortDescription || product.description ? (
          <p className="featured-products__description">{view.shortDescription || product.description}</p>
        ) : null}
        <p className="featured-products__price">
          ฿{Number(product.price || 0).toLocaleString('th-TH')}
        </p>
      </div>
      <AddToCartButton product={{ ...product, id: product.wooId || product.id, name: view.name }} mediaRef={mediaRef} />
    </article>
  );
}
