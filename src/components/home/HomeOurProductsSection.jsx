import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ScrollReveal from '../ScrollReveal';
import { isDisplayOnlyProduct } from '../../data/productDetails';
import { homeOurProducts } from '../../data/homeStory';
import './HomeOurProductsSection.css';

const MOBILE_CAROUSEL_QUERY = '(max-width: 768px)';
const SCROLL_SYNC_DEBOUNCE_MS = 140;

export default function HomeOurProductsSection() {
  const viewportRef = useRef(null);
  const scrollSyncTimerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const slides = useMemo(() => {
    const productSlides = homeOurProducts.map((product) => ({
      type: 'product',
      id: product.id,
      product,
    }));

    const groupSlide = {
      type: 'group',
      id: 'complete-care-system',
      title: 'Complete Care System',
      text: 'ครบทุกขั้นตอนสำหรับการดูแลรองเท้าคู่โปรด',
      image: '/products/product-27.jpg.jpg',
      fallback: '/products/product-16.jpg.jpg',
    };

    const shopSlide = {
      type: 'shop',
      id: 'shop-all',
      title: 'เลือกดูสินค้าทั้งหมด',
      text: 'ค้นหาสินค้าที่เหมาะกับรองเท้าของคุณ',
      href: '/products',
    };

    return [...productSlides, groupSlide, shopSlide];
  }, []);

  const maxIndex = slides.length - 1;

  const isMobileCarousel = useCallback(
    () => window.matchMedia(MOBILE_CAROUSEL_QUERY).matches,
    [],
  );

  const getClosestIndex = useCallback((viewport) => {
    const slideEls = viewport.querySelectorAll('[data-slide-index]');
    if (!slideEls.length) return 0;

    const viewportCenter = viewport.scrollLeft + viewport.clientWidth / 2;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    slideEls.forEach((slide) => {
      const index = Number(slide.getAttribute('data-slide-index'));
      const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
      const distance = Math.abs(slideCenter - viewportCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    return closestIndex;
  }, []);

  const syncActiveIndex = useCallback(() => {
    if (!isMobileCarousel()) return;

    const viewport = viewportRef.current;
    if (!viewport) return;

    setActiveIndex(getClosestIndex(viewport));
  }, [getClosestIndex, isMobileCarousel]);

  const scrollToIndex = useCallback(
    (index) => {
      if (!isMobileCarousel()) {
        setActiveIndex(index);
        return;
      }

      const viewport = viewportRef.current;
      if (!viewport) return;

      const slide = viewport.querySelector(`[data-slide-index="${index}"]`);
      if (!slide) return;

      const left =
        slide.offsetLeft - (viewport.clientWidth - slide.offsetWidth) / 2;

      viewport.scrollTo({
        left: Math.max(0, left),
        behavior: 'smooth',
      });
      setActiveIndex(index);
    },
    [isMobileCarousel],
  );

  const goPrev = () => scrollToIndex(Math.max(0, activeIndex - 1));
  const goNext = () => scrollToIndex(Math.min(maxIndex, activeIndex + 1));
  const goToIndex = (index) => scrollToIndex(index);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;

    const scheduleSync = () => {
      if (!isMobileCarousel()) return;

      window.clearTimeout(scrollSyncTimerRef.current);
      scrollSyncTimerRef.current = window.setTimeout(() => {
        syncActiveIndex();
      }, SCROLL_SYNC_DEBOUNCE_MS);
    };

    const handleScrollEnd = () => {
      if (!isMobileCarousel()) return;

      window.clearTimeout(scrollSyncTimerRef.current);
      syncActiveIndex();
    };

    viewport.addEventListener('scroll', scheduleSync, { passive: true });
    viewport.addEventListener('scrollend', handleScrollEnd, { passive: true });
    syncActiveIndex();

    return () => {
      window.clearTimeout(scrollSyncTimerRef.current);
      viewport.removeEventListener('scroll', scheduleSync);
      viewport.removeEventListener('scrollend', handleScrollEnd);
    };
  }, [isMobileCarousel, syncActiveIndex]);

  const productGifById = {
    cleaner: '/images/cleaner-card.gif',
    protector: '/images/protector-card.gif',
    refresh: '/images/refresh-card.gif',
  };

  /** Active = animated GIF/video; inactive = still poster only */
  function CarouselMedia({
    isActive,
    alt,
    animatedSrc,
    posterSrc,
    videoSrc,
    fallback,
  }) {
    const videoRef = useRef(null);
    const useVideo = Boolean(videoSrc);
    const stillSrc = posterSrc || fallback || animatedSrc;
    const activeSrc = useVideo ? videoSrc : animatedSrc ?? stillSrc;
    const displaySrc = isActive ? activeSrc : stillSrc;
    const showStillOverlay = !isActive && Boolean(animatedSrc) && !posterSrc;

    useEffect(() => {
      const video = videoRef.current;
      if (!video || !useVideo) return undefined;

      if (isActive) {
        const playPromise = video.play();
        if (playPromise?.catch) playPromise.catch(() => {});
      } else {
        video.pause();
        video.currentTime = 0;
      }
      return undefined;
    }, [isActive, useVideo]);

    return (
      <div
        className={`home-our-products__media${
          isActive
            ? ' home-our-products__media--active'
            : ' home-our-products__media--still'
        }`}
      >
        {useVideo ? (
          <video
            ref={videoRef}
            src={videoSrc}
            poster={posterSrc}
            muted
            loop
            playsInline
            aria-label={alt}
          />
        ) : (
          <img
            key={isActive ? 'active' : 'still'}
            src={displaySrc}
            alt={alt}
            loading="lazy"
            decoding="async"
            onError={(e) => {
              if (fallback && e.currentTarget.src !== fallback) {
                e.currentTarget.src = fallback;
              }
            }}
          />
        )}
        {showStillOverlay && (
          <span className="home-our-products__media-overlay" aria-hidden="true" />
        )}
      </div>
    );
  }

  function renderSlide(slide, index) {
    const isActive = index === activeIndex;
    const slideClass = `home-our-products__slide${
      isActive ? ' home-our-products__slide--active' : ''
    }`;

    if (slide.type === 'product') {
      const product = slide.product;
      const animatedSrc = productGifById[product.id];
      const cardClassName = `home-our-products__card${
        isActive ? ' home-our-products__card--live' : ''
      }`;
      const cardContent = (
        <>
          <p className="home-our-products__step">{product.label}</p>
          <CarouselMedia
            isActive={isActive}
            alt={product.name}
            animatedSrc={animatedSrc}
            posterSrc={product.image}
            fallback={product.image}
          />
          <div className="home-our-products__body">
            <h3 className="home-our-products__name">{product.name}</h3>
            <p className="home-our-products__benefit">
              {product.benefit.split('\n').map((line) => (
                <span key={line}>{line}</span>
              ))}
            </p>
          </div>
        </>
      );

      return (
        <li
          key={slide.id}
          className={slideClass}
          aria-hidden={!isActive}
          data-slide-index={index}
        >
          {isDisplayOnlyProduct(product.slug) ? (
            <div className={cardClassName}>{cardContent}</div>
          ) : (
            <Link
              to={product.href}
              className={cardClassName}
              tabIndex={isActive ? 0 : -1}
            >
              {cardContent}
            </Link>
          )}
        </li>
      );
    }

    if (slide.type === 'group') {
      return (
        <li
          key={slide.id}
          className={slideClass}
          aria-hidden={!isActive}
          data-slide-index={index}
        >
          <div
            className={`home-our-products__card home-our-products__card--group${
              isActive ? ' home-our-products__card--live' : ''
            }`}
          >
            <p className="home-our-products__step">System</p>
            <CarouselMedia
              isActive={isActive}
              alt={slide.title}
              posterSrc={slide.image}
              fallback={slide.fallback}
            />
            <div className="home-our-products__body">
              <h3 className="home-our-products__name">{slide.title}</h3>
              <p className="home-our-products__benefit">
                <span>{slide.text}</span>
              </p>
            </div>
          </div>
        </li>
      );
    }

    return (
      <li
        key={slide.id}
        className={slideClass}
        aria-hidden={!isActive}
        data-slide-index={index}
      >
        <div className="home-our-products__card home-our-products__card--shop">
          <p className="home-our-products__step">Shop</p>
          <div className="home-our-products__body home-our-products__body--shop">
            <h3 className="home-our-products__name">{slide.title}</h3>
            <p className="home-our-products__benefit">
              <span>{slide.text}</span>
            </p>
            <Link
              to={slide.href}
              className="btn-primary"
              tabIndex={isActive ? 0 : -1}
            >
              ดูสินค้าทั้งหมด
            </Link>
          </div>
        </div>
      </li>
    );
  }

  return (
    <section className="home-our-products" id="our-products">
      <div className="container">
        <ScrollReveal className="home-our-products__header">
          <h2 className="home-our-products__title">Our Products</h2>
          <p className="home-our-products__subtitle">
            ระบบดูแลรองเท้าที่ครบทั้งทำความสะอาด ปกป้อง และฟื้นฟูความสดชื่น
          </p>
          <p className="home-our-products__hint">
            ใช้ลูกศรเพื่อดูสินค้าเพิ่มเติม
          </p>
        </ScrollReveal>

        <ScrollReveal className="home-our-products__carousel" delay={70}>
          <div
            className="home-our-products__controls"
            aria-label="Carousel navigation"
          >
            <button
              type="button"
              className="home-our-products__arrow home-our-products__arrow--prev"
              onClick={goPrev}
              aria-label="Previous products"
              disabled={activeIndex === 0}
            >
              ‹
            </button>
            <button
              type="button"
              className="home-our-products__arrow home-our-products__arrow--next"
              onClick={goNext}
              aria-label="Next products"
              disabled={activeIndex >= maxIndex}
            >
              ›
            </button>
          </div>

          <div
            ref={viewportRef}
            className="home-our-products__viewport mobile-slider"
            aria-label="เลื่อนดูสินค้า"
          >
            <ul
              className="home-our-products__track"
              style={{ '--active-index': activeIndex }}
            >
              {slides.map((slide, index) => renderSlide(slide, index))}
            </ul>
          </div>

          <div
            className="home-our-products__pagination"
            aria-label="Product carousel pagination"
          >
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                className={`home-our-products__dot${
                  index === activeIndex ? ' home-our-products__dot--active' : ''
                }`}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === activeIndex ? 'true' : undefined}
                onClick={() => goToIndex(index)}
              />
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
