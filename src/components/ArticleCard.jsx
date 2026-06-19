import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useCart } from '../context/CartContext';
import { findProductByImage } from '../data/products';

const CART_ADDED_RESET_MS = 2200;

function ArticleCartIcon() {
  return (
    <svg
      className="article-card__product-cart-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      aria-hidden="true"
    >
      <path
        d="M6 6h15l-1.5 9h-11L6 6z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M6 6L5 3H2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9.5" cy="19.5" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="16.5" cy="19.5" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ArticleCartAddedIcon() {
  return (
    <svg
      className="article-card__product-cart-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path
        d="M5 13l4 4L19 7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ProductRow({ label, image }) {
  const mediaRef = useRef(null);
  const resetTimerRef = useRef(null);
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const shopProduct = useMemo(() => findProductByImage(image), [image]);

  const handleAddToCart = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!shopProduct) return;

    const img =
      mediaRef.current?.querySelector('img') ?? mediaRef.current ?? null;

    await addToCart(
      {
        id: shopProduct.id,
        name: shopProduct.name,
        image: shopProduct.image,
        price: shopProduct.price,
      },
      img,
    );

    setAdded(true);
    window.clearTimeout(resetTimerRef.current);
    resetTimerRef.current = window.setTimeout(() => setAdded(false), CART_ADDED_RESET_MS);
  };

  useEffect(
    () => () => {
      window.clearTimeout(resetTimerRef.current);
    },
    [],
  );

  return (
    <div className="article-card__product">
      <span className="article-card__product-media" ref={mediaRef}>
        <img src={image} alt="" loading="lazy" decoding="async" />
      </span>
      <span className="article-card__product-label">{label}</span>
      <button
        type="button"
        className={`article-card__product-cart${
          added ? ' article-card__product-cart--added' : ''
        }`}
        onClick={handleAddToCart}
        disabled={!shopProduct}
        aria-label={
          added
            ? `เพิ่ม ${label} ลงตะกร้าแล้ว`
            : `เพิ่ม ${label} ลงตะกร้า`
        }
        title={added ? 'เพิ่มลงตะกร้าแล้ว' : undefined}
      >
        {added ? <ArticleCartAddedIcon /> : <ArticleCartIcon />}
      </button>
    </div>
  );
}

function ArticleCardVideoPlaceholder({ title }) {
  return (
    <div
      className="article-card__video article-card__video--placeholder"
      role="img"
      aria-label={`พื้นที่วิดีโอสำหรับ ${title}`}
    >
      <span className="article-card__video-play" aria-hidden="true">
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="31" stroke="currentColor" strokeWidth="1.5" />
          <path d="M27 22.5v19l16-9.5-16-9.5z" fill="currentColor" />
        </svg>
      </span>
    </div>
  );
}

function ArticleCardVideo({ src, title, isActive }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    video.muted = true;
    video.defaultMuted = true;

    const keepMuted = () => {
      if (!video.muted) video.muted = true;
    };

    video.addEventListener('volumechange', keepMuted);
    return () => video.removeEventListener('volumechange', keepMuted);
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || isActive) return;

    video.pause();
    setIsPlaying(false);
  }, [isActive]);

  const play = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.play().then(() => setIsPlaying(true)).catch(() => {});
  }, []);

  const pause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    setIsPlaying(false);
  }, []);

  const handleToggle = () => {
    if (isPlaying) pause();
    else play();
  };

  return (
    <button
      type="button"
      className={`article-card__video article-card__video--has-media${
        isPlaying ? ' article-card__video--playing' : ''
      }`}
      onClick={handleToggle}
      aria-label={isPlaying ? `หยุดวิดีโอ: ${title}` : `เล่นวิดีโอ: ${title}`}
    >
      <video
        ref={videoRef}
        className="article-card__video-el"
        src={src}
        muted={true}
        defaultMuted
        loop
        playsInline
        preload="metadata"
        controlsList="nodownload nofullscreen noremoteplayback"
        disablePictureInPicture
        aria-hidden="true"
        tabIndex={-1}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      {!isPlaying ? (
        <span className="article-card__video-play" aria-hidden="true">
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="31" stroke="currentColor" strokeWidth="1.5" />
            <path d="M27 22.5v19l16-9.5-16-9.5z" fill="currentColor" />
          </svg>
        </span>
      ) : null}
    </button>
  );
}

export default function ArticleCard({ guide, isActive = true, variant = 'carousel' }) {
  return (
    <article
      id={`article-${guide.id}`}
      className={[
        'article-card',
        'article-card--detail',
        isActive ? 'article-card--active' : '',
        variant === 'standalone' ? 'article-card--standalone' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="article-card__body">
        <div className="article-card__content">
          <h2 className="article-card__title">{guide.title}</h2>
          <p className="article-card__summary">{guide.summary}</p>
        </div>

        <div className="article-card__video-wrap">
          {guide.video ? (
            <ArticleCardVideo
              src={guide.video}
              title={guide.title}
              isActive={isActive}
            />
          ) : (
            <ArticleCardVideoPlaceholder title={guide.title} />
          )}
        </div>

        <div className="article-card__products">
          <p className="article-card__products-heading">สินค้าแนะนำ</p>
          <ul className="article-card__product-list">
            {guide.products.map((product) => (
              <li key={product.label}>
                <ProductRow label={product.label} image={product.image} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}
