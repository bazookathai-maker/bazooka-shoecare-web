import { useCallback, useState } from 'react';
import ScrollReveal from '../ScrollReveal';
import HomeReviewVideo from './HomeReviewVideo';
import { homeReviewVideos } from '../../data/homeStory';
import { useCenterFocusCarousel } from '../../hooks/useCenterFocusCarousel';
import './HomeReviewsSection.css';

const reviewVideoClasses = {
  wrap: 'home-reviews__video-wrap',
  video: 'home-reviews__video',
  ready: 'home-reviews__video--ready',
};

const DEFAULT_HANDLE = '@bazookashoecare';

export default function HomeReviewsSection() {
  const [reviews, setReviews] = useState(homeReviewVideos);

  const {
    viewportRef,
    activeIndex,
    maxIndex,
    goPrev,
    goNext,
    goToIndex,
  } = useCenterFocusCarousel({
    itemCount: reviews.length,
    indexAttribute: 'data-review-index',
  });

  const removeReview = useCallback((src) => {
    setReviews((prev) => prev.filter((item) => item.src !== src));
  }, []);

  return (
    <section className="home-reviews" id="reviews">
      <div className="container">
        <ScrollReveal className="home-reviews__header">
          <h2 className="home-reviews__title">REVIEWS</h2>
        </ScrollReveal>
      </div>

      <ScrollReveal className="home-reviews__carousel" delay={70}>
        <div className="home-reviews__controls" aria-label="Review carousel navigation">
          <button
            type="button"
            className="home-reviews__arrow home-reviews__arrow--prev"
            onClick={goPrev}
            aria-label="Previous review"
            disabled={activeIndex === 0}
          >
            ‹
          </button>
          <button
            type="button"
            className="home-reviews__arrow home-reviews__arrow--next"
            onClick={goNext}
            aria-label="Next review"
            disabled={activeIndex >= maxIndex}
          >
            ›
          </button>
        </div>

        <div
          ref={viewportRef}
          className="home-reviews__viewport mobile-slider"
          aria-label="Community review videos"
        >
          <ul
            className="home-reviews__track"
            style={{ '--active-index': activeIndex }}
          >
            {reviews.map((item, index) => {
              const isActive = activeIndex === index;

              return (
                <li
                  key={item.src}
                  className={`home-reviews__card home-reviews__slide${
                    isActive ? ' home-reviews__slide--active' : ''
                  }`}
                  data-review-index={index}
                  aria-hidden={!isActive}
                >
                  <button
                    type="button"
                    className="home-reviews__card-hit"
                    onClick={() => goToIndex(index)}
                    aria-label={`เล่นวิดีโอรีวิว ${index + 1}`}
                    aria-pressed={isActive}
                  >
                    <div className="home-reviews__card-media">
                      <HomeReviewVideo
                        src={item.src}
                        fallback={item.fallback}
                        classes={reviewVideoClasses}
                        ariaLabel={`วิดีโอรีวิว ${index + 1}`}
                        isActive={isActive}
                        managedPlayback
                        onUnavailable={() => removeReview(item.src)}
                      />
                      <span className="home-reviews__handle">
                        {item.handle ?? DEFAULT_HANDLE}
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div
          className="home-reviews__pagination"
          aria-label="Review slide pagination"
        >
          {reviews.map((item, index) => (
            <button
              key={item.src}
              type="button"
              className={`home-reviews__dot${
                index === activeIndex ? ' home-reviews__dot--active' : ''
              }`}
              aria-label={`Go to review ${index + 1}`}
              aria-current={index === activeIndex ? 'true' : undefined}
              onClick={() => goToIndex(index)}
            />
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}
