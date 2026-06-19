import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ArticleCard from '../components/ArticleCard';
import ScrollReveal from '../components/ScrollReveal';
import { careGuides } from '../data/careGuides';
import { useCenterFocusCarousel } from '../hooks/useCenterFocusCarousel';
import './Articles.css';

function ArticlesCarousel({ guides }) {
  const { hash } = useLocation();

  const {
    viewportRef,
    activeIndex,
    maxIndex,
    goPrev,
    goNext,
    goToIndex,
    scrollToIndex,
  } = useCenterFocusCarousel({
    itemCount: guides.length,
    indexAttribute: 'data-article-index',
  });

  useEffect(() => {
    if (!hash?.startsWith('#article-')) return undefined;
    const articleId = hash.replace('#article-', '');
    const index = guides.findIndex((guide) => guide.id === articleId);
    if (index < 0) return undefined;

    const timer = window.setTimeout(() => scrollToIndex(index), 120);
    return () => window.clearTimeout(timer);
  }, [hash, guides, scrollToIndex]);

  return (
    <div className="articles-carousel">
      <div className="articles-carousel__controls" aria-label="Article carousel navigation">
        <button
          type="button"
          className="articles-carousel__arrow articles-carousel__arrow--prev"
          onClick={goPrev}
          aria-label="บทความก่อนหน้า"
          disabled={activeIndex === 0}
        >
          ‹
        </button>
        <button
          type="button"
          className="articles-carousel__arrow articles-carousel__arrow--next"
          onClick={goNext}
          aria-label="บทความถัดไป"
          disabled={activeIndex >= maxIndex}
        >
          ›
        </button>
      </div>

      <div
        ref={viewportRef}
        className="articles-carousel__viewport mobile-slider"
        aria-label="เลื่อนดูบทความ"
      >
        <ul
          className="article-detail-list"
          style={{ '--active-index': activeIndex }}
        >
          {guides.map((guide, index) => {
            const isActive = activeIndex === index;

            return (
              <li
                key={guide.id}
                className={isActive ? 'articles-carousel__slide--active' : ''}
                data-article-index={index}
                aria-hidden={!isActive}
              >
                <ArticleCard guide={guide} isActive={isActive} />
              </li>
            );
          })}
        </ul>
      </div>

      <div
        className="articles-carousel__pagination"
        role="tablist"
        aria-label="เลือกบทความ"
      >
        {guides.map((guide, index) => (
          <button
            key={guide.id}
            type="button"
            role="tab"
            className={`articles-carousel__dot${
              index === activeIndex ? ' articles-carousel__dot--active' : ''
            }`}
            aria-label={`ไปที่บทความ: ${guide.title}`}
            aria-selected={index === activeIndex}
            onClick={() => goToIndex(index)}
          />
        ))}
      </div>
    </div>
  );
}

export default function Articles() {
  return (
    <main className="articles-page">
      <header className="articles-page__hero">
        <div className="container container--editorial">
          <ScrollReveal>
            <h1 className="articles-page__title">เรื่องราวการดูแลรองเท้า</h1>
            <p className="articles-page__subtitle">
              คู่มือดูแลรองเท้าคู่โปรดจาก BAZOOKA
            </p>
          </ScrollReveal>
        </div>
      </header>

      <section className="articles-page__content" aria-label="เนื้อหาบทความ">
        <div className="articles-page__content-inner">
          <ArticlesCarousel guides={careGuides} />
        </div>
      </section>
    </main>
  );
}
