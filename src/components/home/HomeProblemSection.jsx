import ScrollReveal from '../ScrollReveal';
import { problemCloseups, problemLifestyle } from '../../data/homeStory';
import './HomeProblemSection.css';

function ProblemImage({ src, fallback, alt }) {
  return (
    <img
      src={src}
      alt={alt}
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

export default function HomeProblemSection() {
  return (
    <section className="home-problem" id="the-problem">
      <div className="container home-problem__shell">
        <ScrollReveal className="home-problem__intro">
          <p className="section-label">ปัญหาที่พบบ่อย</p>
          <h2 className="home-problem__title">ทุกก้าวทิ้งร่องรอย</h2>
          <p className="home-problem__lead">
            ไม่ใช่แค่สกปรก — แต่คือชีวิตจริงที่สะสมบนรองเท้าคู่โปรดของคุณ
          </p>
        </ScrollReveal>

        <div className="home-problem__editorial">
          <ScrollReveal
            as="ul"
            className="home-problem__mosaic"
            delay={60}
          >
            {problemCloseups.map((item, index) => (
              <li
                key={item.id}
                className={`home-problem__frame home-problem__frame--${item.size}`}
                style={{ transitionDelay: `${index * 70}ms` }}
              >
                <figure className="home-problem__figure hover-zoom">
                  <ProblemImage
                    src={item.image}
                    fallback={item.fallback}
                    alt={item.caption}
                  />
                  <figcaption className="home-problem__caption">
                    {item.caption}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ScrollReveal>

          <ScrollReveal className="home-problem__moment" delay={140}>
            <figure className="home-problem__lifestyle hover-zoom">
              <ProblemImage
                src={problemLifestyle.image}
                fallback={problemLifestyle.fallback}
                alt=""
              />
              <div className="home-problem__moment-copy">
                <p className="home-problem__moment-eyebrow">
                  {problemLifestyle.eyebrow}
                </p>
                <blockquote className="home-problem__moment-quote">
                  {problemLifestyle.quote.split('\n').map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </blockquote>
                <p className="home-problem__moment-detail">
                  {problemLifestyle.detail}
                </p>
              </div>
            </figure>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
