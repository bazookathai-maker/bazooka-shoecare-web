import { useState } from 'react';
import ScrollReveal from '../ScrollReveal';
import { homeHowToCare } from '../../data/homeStory';
import './HomeHowToCareSection.css';

function CareImageSlider({ images, slideLabel }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const lastIndex = images.length - 1;

  const goPrev = () => {
    setActiveIndex((index) => Math.max(0, index - 1));
  };

  const goNext = () => {
    setActiveIndex((index) => Math.min(lastIndex, index + 1));
  };

  return (
    <div className="home-how-to-care__slider">
      <div className="home-how-to-care__slider-stage" aria-live="polite">
        {images.map((src, index) => (
          <img
            key={src}
            src={src}
            alt={`${slideLabel} ${index + 1}`}
            className={index === activeIndex ? 'home-how-to-care__slider-image--active' : undefined}
            loading={index === 0 ? 'eager' : 'lazy'}
            decoding="async"
            hidden={index !== activeIndex}
          />
        ))}
      </div>

      <div
        className="home-how-to-care__slider-pagination"
        aria-label={`${slideLabel} pagination`}
      >
        {images.map((src, index) => (
          <button
            key={src}
            type="button"
            className={`home-how-to-care__slider-dot${
              index === activeIndex ? ' home-how-to-care__slider-dot--active' : ''
            }`}
            aria-label={`Go to ${slideLabel} ${index + 1}`}
            aria-current={index === activeIndex ? 'true' : undefined}
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </div>

      <div className="home-how-to-care__slider-nav" aria-label={`${slideLabel} navigation`}>
        <button
          type="button"
          className="home-how-to-care__slider-arrow"
          onClick={goPrev}
          aria-label="Previous slide"
          disabled={activeIndex === 0}
        >
          ‹
        </button>
        <button
          type="button"
          className="home-how-to-care__slider-arrow"
          onClick={goNext}
          aria-label="Next slide"
          disabled={activeIndex >= lastIndex}
        >
          ›
        </button>
      </div>
    </div>
  );
}

function CareBlockIntro({ card }) {
  return (
    <div className="home-how-to-care__intro">
      <h3 className="home-how-to-care__block-title">{card.title}</h3>
      <p className="home-how-to-care__block-subtitle">{card.subtitle}</p>
    </div>
  );
}

function ArticleBlock({ card }) {
  return (
    <div className="home-how-to-care__block home-how-to-care__block--articles">
      <CareBlockIntro card={card} />
      <CareImageSlider
        images={card.slides.map((slide) => slide.image)}
        slideLabel="บทความ"
      />
    </div>
  );
}

function HowToBlock({ card }) {
  return (
    <div className="home-how-to-care__block home-how-to-care__block--howto">
      <CareBlockIntro card={card} />
      <div className="home-how-to-care__static-image">
        <img
          src={card.image}
          alt="วิธีการใช้ผลิตภัณฑ์ BAZOOKA"
          loading="eager"
          decoding="async"
        />
      </div>
    </div>
  );
}

function CareBlock({ card }) {
  if (card.id === 'articles' && card.slides?.length) {
    return <ArticleBlock card={card} />;
  }

  if (card.id === 'how-to' && card.image) {
    return <HowToBlock card={card} />;
  }

  return null;
}

export default function HomeHowToCareSection() {
  return (
    <section className="home-how-to-care" id="how-to-care">
      <div className="container">
        <ScrollReveal className="home-how-to-care__header">
          <h2 className="home-how-to-care__title">HOW TO CARE</h2>
          <p className="home-how-to-care__lead">
            เรียนรู้การดูแลรองเท้าคู่โปรด ผ่านบทความ วิธีการใช้งาน และวิดีโอสาธิต
          </p>
        </ScrollReveal>

        <ScrollReveal as="ul" className="home-how-to-care__grid" delay={70}>
          {homeHowToCare.map((card, index) => (
            <li
              key={card.id}
              className="home-how-to-care__item"
              style={{ transitionDelay: `${index * 80}ms` }}
            >
              <CareBlock card={card} />
            </li>
          ))}
        </ScrollReveal>
      </div>
    </section>
  );
}
