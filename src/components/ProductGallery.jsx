import { useCallback, useEffect, useRef, useState } from 'react';
import './ProductGallery.css';

function uniqueImages(images) {
  const list = [];
  const seen = new Set();
  if (!Array.isArray(images)) return list;
  for (const image of images) {
    const src = image?.src;
    if (!src || seen.has(src)) continue;
    seen.add(src);
    list.push(image);
  }
  return list;
}

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );
}

export default function ProductGallery({ images, fillFrame = false }) {
  const list = uniqueImages(images);
  const total = list.length;
  const hasMany = total > 1;
  const signature = list.map((image) => image.src).join('|');
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef(null);
  const thumbsRef = useRef(null);
  const frameRef = useRef(0);

  const goTo = useCallback(
    (index) => {
      const track = trackRef.current;
      if (!track || total === 0) return;
      const next = Math.max(0, Math.min(total - 1, index));
      setActiveIndex(next);
      if (!track.clientWidth) return;
      track.scrollTo({
        left: next * track.clientWidth,
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      });
    },
    [total],
  );

  const handleScroll = () => {
    cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      const track = trackRef.current;
      if (!track || !track.clientWidth) return;
      const index = Math.round(track.scrollLeft / track.clientWidth);
      setActiveIndex(Math.max(0, Math.min(total - 1, index)));
    });
  };

  const handleKeyDown = (event) => {
    if (!hasMany) return;
    const keys = {
      ArrowLeft: activeIndex - 1,
      ArrowRight: activeIndex + 1,
      Home: 0,
      End: total - 1,
    };
    if (!(event.key in keys)) return;
    event.preventDefault();
    goTo(keys[event.key]);
  };

  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  useEffect(() => {
    setActiveIndex(0);
    const track = trackRef.current;
    if (track) track.scrollTo({ left: 0, behavior: 'auto' });
  }, [signature]);

  useEffect(() => {
    const strip = thumbsRef.current;
    const thumb = strip?.children[activeIndex];
    if (!strip || !thumb) return;
    const left =
      thumb.offsetLeft - (strip.clientWidth - thumb.offsetWidth) / 2;
    strip.scrollTo({
      left: Math.max(0, left),
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
  }, [activeIndex, signature]);

  if (total === 0) return null;

  return (
    <div
      className={`product-gallery${hasMany ? '' : ' product-gallery--single'}${
        fillFrame ? ' product-gallery--fill' : ''
      }`}
      role="region"
      aria-roledescription="carousel"
      aria-label="ภาพสินค้า"
      onKeyDown={handleKeyDown}
    >
      <div className="product-gallery__main">
        <div
          ref={trackRef}
          className="product-gallery__track"
          onScroll={hasMany ? handleScroll : undefined}
          tabIndex={hasMany ? 0 : undefined}
        >
          {list.map((image, index) => (
            <figure
              key={`${image.src}-${index}`}
              className="product-gallery__slide"
              aria-hidden={index === activeIndex ? undefined : 'true'}
            >
              <img
                src={image.src}
                alt={index === activeIndex ? image.alt || '' : ''}
                className="product-gallery__main-img"
                loading={index === 0 ? 'eager' : 'lazy'}
                decoding="async"
                draggable="false"
              />
            </figure>
          ))}
        </div>

        {hasMany ? (
          <>
            <button
              type="button"
              className="product-gallery__arrow product-gallery__arrow--prev"
              onClick={() => goTo(activeIndex - 1)}
              disabled={activeIndex === 0}
              aria-label="ภาพก่อนหน้า"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M15 5l-7 7 7 7" />
              </svg>
            </button>
            <button
              type="button"
              className="product-gallery__arrow product-gallery__arrow--next"
              onClick={() => goTo(activeIndex + 1)}
              disabled={activeIndex === total - 1}
              aria-label="ภาพถัดไป"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        ) : null}
      </div>

      {hasMany ? (
        <ul
          ref={thumbsRef}
          className="product-gallery__thumbs"
          aria-label="ภาพย่อสินค้า"
        >
          {list.map((image, index) => (
            <li key={`${image.src}-${index}`}>
              <button
                type="button"
                className={`product-gallery__thumb ${
                  index === activeIndex ? 'product-gallery__thumb--active' : ''
                }`}
                onClick={() => goTo(index)}
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
