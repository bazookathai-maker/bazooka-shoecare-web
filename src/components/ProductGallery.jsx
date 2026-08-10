import { useEffect, useState } from 'react';
import './ProductGallery.css';

export default function ProductGallery({ images }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const list = Array.isArray(images) ? images.filter((image) => image?.src) : [];
  const active = list[activeIndex] ?? list[0];
  const hasThumbs = list.length > 1;

  useEffect(() => {
    setActiveIndex(0);
  }, [images]);

  if (!active) return null;

  return (
    <div
      className={`product-gallery${hasThumbs ? '' : ' product-gallery--single'}`}
    >
      <figure className="product-gallery__main">
        <img
          key={active.src}
          src={active.src}
          alt={active.alt || ''}
          className="product-gallery__main-img"
          decoding="async"
        />
      </figure>

      {hasThumbs ? (
        <ul className="product-gallery__thumbs" aria-label="ภาพสินค้า">
          {list.map((image, index) => (
            <li key={`${image.src}-${index}`}>
              <button
                type="button"
                className={`product-gallery__thumb ${
                  index === activeIndex ? 'product-gallery__thumb--active' : ''
                }`}
                onClick={() => setActiveIndex(index)}
                aria-label={`ดูภาพที่ ${index + 1}`}
                aria-current={index === activeIndex ? 'true' : undefined}
              >
                <img src={image.src} alt="" loading="lazy" decoding="async" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
