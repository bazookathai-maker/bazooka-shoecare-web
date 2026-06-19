import { Link } from 'react-router-dom';
import ScrollReveal from './ScrollReveal';
import HomeReviewVideo from './home/HomeReviewVideo';
import { communityReviewVideo, storyReviews } from '../data/homeStory';
import './FeaturedReviewsSection.css';

function Stars({ count = 5 }) {
  return (
    <span className="reviews__stars" aria-label={`${count} จาก 5 ดาว`}>
      {Array.from({ length: count }, (_, i) => (
        <svg
          key={i}
          viewBox="0 0 16 16"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M8 1.5l1.76 3.57 3.94.57-2.85 2.78.67 3.92L8 10.67l-3.52 1.85.67-3.92-2.85-2.78 3.94-.57L8 1.5z" />
        </svg>
      ))}
    </span>
  );
}

function ReviewImage({ src, fallback, className, alt }) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={(e) => {
        if (fallback && e.currentTarget.src !== fallback) {
          e.currentTarget.src = fallback;
        }
      }}
    />
  );
}

export default function FeaturedReviewsSection() {
  return (
    <section className="reviews-featured" id="reviews">
      <div className="container">
        <ScrollReveal className="reviews-featured__header">
          <p className="section-label">ชุมชน</p>
          <h2 className="section-title">เสียงจริง ผลลัพธ์จริง</h2>
          <p className="reviews-featured__desc">
            ประสบการณ์จากคนใส่รองเท้าจริง — ไม่ใช่โฆษณา แต่คือชีวิตประจำวัน
          </p>
        </ScrollReveal>

        <ScrollReveal className="reviews-featured__layout" delay={70}>
          <div className="reviews-featured__media-col">
            <HomeReviewVideo
              src={communityReviewVideo.src}
              fallback={communityReviewVideo.fallback}
              poster={communityReviewVideo.poster}
            />
            <p className="reviews-featured__video-caption">
              ชุมชน BAZOOKA — ดูแลรองเท้าในชีวิตจริง
            </p>
          </div>

          <ul className="reviews-featured__list">
            {storyReviews.map((item, index) => (
              <li
                key={item.id}
                className="reviews-featured__card"
                style={{ transitionDelay: `${index * 60}ms` }}
              >
                <div className="reviews-featured__card-visual">
                  <ReviewImage
                    src={item.sneaker}
                    fallback={item.sneakerFallback}
                    className="reviews-featured__sneaker"
                    alt=""
                  />
                  <ReviewImage
                    src={item.avatar}
                    fallback={item.avatarFallback}
                    className="reviews-featured__avatar"
                    alt={item.name}
                  />
                </div>

                <div className="reviews-featured__card-body">
                  <div className="reviews-featured__identity">
                    <div>
                      <p className="reviews-featured__name">{item.name}</p>
                      <p className="reviews-featured__city">{item.city}</p>
                    </div>
                    <span className="reviews-featured__tag">{item.product}</span>
                  </div>

                  <p className="reviews-featured__usage">{item.usage}</p>
                  <Stars count={item.rating ?? 5} />
                  <blockquote className="reviews-featured__quote">
                    &ldquo;{item.quote}&rdquo;
                  </blockquote>
                </div>
              </li>
            ))}
          </ul>
        </ScrollReveal>

        <ScrollReveal className="reviews-featured__cta" delay={120}>
          <Link to="/reviews" className="btn-outline">
            อ่านรีวิวทั้งหมด
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
