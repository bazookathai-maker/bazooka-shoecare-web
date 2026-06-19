import { useState } from 'react';
import './ProductGallery.css';

export default function ProductGallery({ images }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex] ?? images[0];
  const hasThumbs = images.length > 1;

  return (
    <div
      className={`product-gallery${hasThumbs ? '' : ' product-gallery--single'}`}
    >
      <figure className="product-gallery__main">
        <img
          key={active.src}
          src={active.src}
          alt={active.alt}
          className="product-gallery__main-img"
          decoding="async"
        />
      </figure>

      {images.length > 1 && (
        <ul className="product-gallery__thumbs" aria-label="ภาพสินค้า">
          {images.map((image, index) => (
            <li key={image.src}>
              <button
                type="button"
                className={`product-gallery__thumb ${
                  index === activeIndex ? 'product-gallery__thumb--active' : ''
                }`}
                onClick={() => setActiveIndex(index)}
                aria-label={`ดูภาพที่ ${index + 1}`}
                aria-current={index === activeIndex}
              >
                <img src={image.src} alt="" loading="lazy" decoding="async" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
