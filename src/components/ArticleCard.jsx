import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useCart } from '../context/CartContext';
import { useLocale } from '../i18n/LocaleContext';
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
  const { locale } = useLocale();
  const mediaRef = useRef(null);
  const resetTimerRef = useRef(null);
  const { addToCart, hydrating } = useCart();
  const [added, setAdded] = useState(false);
  const shopProduct = useMemo(() => findProductByImage(image), [image]);
  const canAdd =
    !hydrating && shopProduct && Number.isFinite(Number(shopProduct.id));

  const handleAddToCart = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!canAdd) return;

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
        disabled={!canAdd}
        aria-label={
          added
            ? locale === 'en'
              ? `Added ${label} to cart`
              : `สั่งซื้อสินค้า ${label} แล้ว`
            : locale === 'en'
              ? `Add ${label} to cart`
              : `สั่งซื้อสินค้า ${label}`
        }
        title={added ? (locale === 'en' ? 'Added to cart' : 'สั่งซื้อสินค้าแล้ว') : undefined}
      >
        {added ? <ArticleCartAddedIcon /> : <ArticleCartIcon />}
      </button>
    </div>
  );
}

function ArticleCardVideoPlaceholder({ title }) {
  const { locale } = useLocale();
  return (
    <div
      className="article-card__video article-card__video--placeholder"
      role="img"
      aria-label={locale === 'en' ? `Video area for ${title}` : `พื้นที่วิดีโอสำหรับ ${title}`}
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

export function ArticleCardVideo({ src, title, isActive, poster }) {
  const { locale } = useLocale();
  const videoRef = useRef(null);
  const [activeSrc, setActiveSrc] = useState('');
  const [playing, setPlaying] = useState(false);
  const mediaSrc = activeSrc === src ? src : '';
  const isPlaying = playing && Boolean(mediaSrc);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !mediaSrc) return undefined;

    video.muted = true;
    video.defaultMuted = true;

    const keepMuted = () => {
      if (!video.muted) video.muted = true;
    };
    let cancelled = false;
    const start = () => {
      if (cancelled) return;
      video.play().then(() => {
        if (!cancelled) setPlaying(true);
      }).catch(() => {});
    };

    video.addEventListener('volumechange', keepMuted);
    start();

    return () => {
      cancelled = true;
      video.removeEventListener('volumechange', keepMuted);
    };
  }, [mediaSrc]);

  useEffect(() => {
    if (isActive) return;
    videoRef.current?.pause();
  }, [isActive]);

  const play = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    if (video.getAttribute('src') !== src) {
      setActiveSrc(src);
      video.src = src;
    }
    video.play().then(() => setPlaying(true)).catch(() => {});
  }, [src]);

  const pause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    setPlaying(false);
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
      aria-label={
        isPlaying
          ? locale === 'en'
            ? `Pause video: ${title}`
            : `หยุดวิดีโอ: ${title}`
          : locale === 'en'
            ? `Play video: ${title}`
            : `เล่นวิดีโอ: ${title}`
      }
    >
      <video
        ref={videoRef}
        className="article-card__video-el"
        src={mediaSrc || undefined}
        muted={true}
        defaultMuted
        loop
        playsInline
        preload="none"
        controlsList="nodownload nofullscreen noremoteplayback"
        disablePictureInPicture
        aria-hidden="true"
        tabIndex={-1}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      {poster && !isPlaying ? (
        <img className="article-card__video-poster" src={poster} alt="" />
      ) : null}
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
  const { locale } = useLocale();
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
          {variant === 'standalone' ? (
            <h1 className="article-card__title">{guide.title}</h1>
          ) : (
            <h2 className="article-card__title">{guide.title}</h2>
          )}
          <p className="article-card__summary">{guide.summary}</p>
        </div>

        <div className="article-card__video-wrap">
          {guide.video?.trim() ? (
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
          <p className="article-card__products-heading">
            {locale === 'en' ? 'Recommended products' : 'สินค้าแนะนำ'}
          </p>
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
