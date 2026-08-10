import { useMemo, useState } from 'react';
import ScrollReveal from '../components/ScrollReveal';
import { REVIEW_FILTERS, googleReviews } from '../data/googleReviews';
import './Reviews.css';

function ReviewStars({ count = 5 }) {
  return (
    <span className="review-card__stars" aria-label={`${count} จาก 5 ดาว`}>
      {Array.from({ length: 5 }, (_, index) => (
        <svg
          key={index}
          viewBox="0 0 16 16"
          fill="currentColor"
          className={
            index < count
              ? 'review-card__star'
              : 'review-card__star review-card__star--empty'
          }
          aria-hidden="true"
        >
          <path d="M8 1.5l1.76 3.57 3.94.57-2.85 2.78.67 3.92L8 10.67l-3.52 1.85.67-3.92-2.85-2.78 3.94-.57L8 1.5z" />
        </svg>
      ))}
    </span>
  );
}

function ReviewCard({ review }) {
  return (
    <article className="review-card">
      <header className="review-card__header">
        <div className="review-card__identity">
          <p className="review-card__name">{review.name}</p>
          {review.location ? (
            <p className="review-card__location">{review.location}</p>
          ) : null}
        </div>
        {review.productImage ? (
          <div className="review-card__product-media">
            <img
              src={review.productImage}
              alt=""
              loading="lazy"
              decoding="async"
            />
          </div>
        ) : null}
      </header>

      <p className="review-card__product">{review.productName}</p>
      <ReviewStars count={review.rating} />
      <p className="review-card__text">{review.text}</p>
      {review.time ? (
        <time className="review-card__date">{review.time}</time>
      ) : null}
    </article>
  );
}

export default function Reviews() {
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredReviews = useMemo(() => {
    if (activeFilter === 'all') return googleReviews;
    return googleReviews.filter(
      (review) => review.productFilter === activeFilter,
    );
  }, [activeFilter]);

  return (
    <main className="reviews-page">
      <header className="reviews-page__hero">
        <div className="container">
          <ScrollReveal className="reviews-page__hero-inner">
            <h1 className="reviews-page__title">Reviews</h1>
            <p className="reviews-page__subtitle">
              เสียงจากลูกค้าที่ใช้ BAZOOKA จริง
            </p>
          </ScrollReveal>
        </div>
      </header>

      <section className="reviews-page__content" aria-label="รายการรีวิว">
        <div className="container">
          <div
            className="reviews-page__filters"
            role="tablist"
            aria-label="กรองตามสินค้า"
          >
            {REVIEW_FILTERS.map((filter) => {
              const isActive = activeFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`reviews-page__filter-btn${
                    isActive ? ' reviews-page__filter-btn--active' : ''
                  }`}
                  onClick={() => setActiveFilter(filter.id)}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>

          {filteredReviews.length > 0 ? (
            <ul className="reviews-page__grid">
              {filteredReviews.map((review) => (
                <li key={review.id}>
                  <ReviewCard review={review} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="reviews-page__empty" role="status">
              ยังไม่มีรีวิวในหมวดนี้
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
