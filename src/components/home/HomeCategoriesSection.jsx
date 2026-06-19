import { Link } from 'react-router-dom';
import ScrollReveal from '../ScrollReveal';
import { productCategories } from '../../data/homeStory';
import './HomeStory.css';

export default function HomeCategoriesSection() {
  return (
    <section className="home-story home-story--alt" id="categories">
      <div className="container home-story__inner">
        <ScrollReveal className="home-story__header home-story__header--center">
          <p className="section-label">หมวดหมู่</p>
          <h2 className="home-story__title">คอลเลกชันดูแลรองเท้า</h2>
          <p className="home-story__lead">
            ทุกหมวดออกแบบมาเพื่อการดูแลรองเท้าในชีวิตจริง — เลือกตามขั้นตอนที่คุณต้องการ
          </p>
        </ScrollReveal>

        <ScrollReveal as="ul" className="home-categories__grid" delay={80}>
          {productCategories.map((cat) => (
            <li key={cat.id}>
              <Link to={cat.href} className="home-categories__card">
                <div className="home-categories__media">
                  <img src={cat.image} alt="" loading="lazy" decoding="async" />
                </div>
                <div className="home-categories__body">
                  <p className="home-categories__step">{cat.label}</p>
                  <h3 className="home-categories__name">{cat.title}</h3>
                  <p className="home-categories__text">{cat.text}</p>
                  <span className="home-categories__link">เลือกชม</span>
                </div>
              </Link>
            </li>
          ))}
        </ScrollReveal>
      </div>
    </section>
  );
}
