import { Link } from 'react-router-dom';
import ScrollReveal from '../ScrollReveal';
import { lifestyleScenes } from '../../data/homeStory';
import './HomeLifestyleSection.css';

function LifestyleImage({ scene }) {
  return (
    <img
      src={scene.image}
      alt=""
      loading="lazy"
      decoding="async"
      draggable={false}
      onError={(e) => {
        if (scene.fallback && e.currentTarget.src !== scene.fallback) {
          e.currentTarget.src = scene.fallback;
        }
      }}
    />
  );
}

export default function HomeLifestyleSection() {
  return (
    <section className="home-lifestyle" id="lifestyle">
      <div className="home-lifestyle__shell">
        <div className="container">
          <ScrollReveal className="home-lifestyle__header">
            <p className="section-label">Lifestyle</p>
            <h2 className="home-lifestyle__title">Ready for every moment</h2>
            <p className="home-lifestyle__lead">
              รองเท้าที่ดูแลดีจะอยู่กับคุณในทุกช่วงของวัน — ไม่ใช่แค่ตอนสกปรก
              แต่คือทุกครั้งที่คุณออกจากบ้าน
            </p>
          </ScrollReveal>
        </div>

        <ScrollReveal as="ul" className="home-lifestyle__editorial" delay={70}>
          {lifestyleScenes.map((scene, index) => (
            <li
              key={scene.id}
              className={`home-lifestyle__panel home-lifestyle__panel--${scene.layout}`}
              style={{ transitionDelay: `${index * 80}ms` }}
            >
              <figure className="home-lifestyle__figure hover-zoom">
                <LifestyleImage scene={scene} />
                <div className="home-lifestyle__shade" aria-hidden="true" />
                <figcaption className="home-lifestyle__caption">
                  <span className="home-lifestyle__label">{scene.label}</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ScrollReveal>

        <div className="container home-lifestyle__footer">
          <ScrollReveal delay={120}>
            <Link to="/products" className="home-lifestyle__link btn-outline">
              Explore the care system
            </Link>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
