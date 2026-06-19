import { Link } from 'react-router-dom';
import ScrollReveal from '../ScrollReveal';
import LoopVideo from '../LoopVideo';
import { storyPillars } from '../../data/homeStory';
import './HomeStory.css';

export default function HomeSolutionSection() {
  return (
    <section className="home-story home-story--tint" id="the-solution">
      <div className="container home-story__inner">
        <ScrollReveal className="home-story__header home-story__header--center">
          <p className="section-label">ระบบดูแล</p>
          <h2 className="home-story__title">ทำความสะอาด / ปกป้อง / ฟื้นฟู</h2>
          <p className="home-story__lead">
            ระบบดูแลรองเท้า 3 ขั้นตอน — ออกแบบให้เข้าใจง่าย ใช้จริงได้ทุกวัน
            ไม่ใช่แค่ทำความสะอาด แต่คือการปกป้องไลฟ์สไตล์ของคุณ
          </p>
        </ScrollReveal>

        <ScrollReveal as="ul" className="home-solution__grid" delay={100}>
          {storyPillars.map((item) => (
            <li key={item.step}>
              <article className="home-solution__card">
                <div className="home-solution__media">
                  <LoopVideo
                    src={item.video}
                    poster={item.poster}
                    aspect="portrait"
                  />
                </div>
                <div className="home-solution__body">
                  <p className="home-solution__step">{item.step}</p>
                  <h3 className="home-solution__name">{item.name}</h3>
                  <p className="home-solution__text">{item.text}</p>
                  {item.showDetailLink !== false && item.href && (
                    <Link to={item.href} className="home-solution__link">
                      ดูรายละเอียด
                    </Link>
                  )}
                </div>
              </article>
            </li>
          ))}
        </ScrollReveal>
      </div>
    </section>
  );
}
