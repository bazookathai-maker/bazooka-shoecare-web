import ScrollReveal from '../ScrollReveal';
import HomeRitualVideo from './HomeRitualVideo';
import { ritualCinematicVideo, storySteps } from '../../data/homeStory';
import './HomeStory.css';

export default function HomeHowItWorksSection() {
  return (
    <section className="home-story" id="how-it-works">
      <div className="container home-story__inner">
        <ScrollReveal className="home-story__header">
          <p className="section-label">พิธีการดูแล</p>
          <h2 className="home-story__title">วิธีใช้งาน</h2>
          <p className="home-story__lead">
            พิธีการดูแลที่เรียบง่าย — จากเตรียมรองเท้าจนถึงพร้อมออกจากบ้าน
            ใช้เวลาไม่นาน แต่ผลลัพธ์ชัดเจนในทุกคู่
          </p>
        </ScrollReveal>

        <ScrollReveal className="home-steps__ritual" delay={50}>
          <HomeRitualVideo
            src={ritualCinematicVideo.src}
            fallback={ritualCinematicVideo.fallback}
            poster={ritualCinematicVideo.poster}
          />
        </ScrollReveal>

        <ScrollReveal className="home-steps__rail" delay={100}>
          <ol className="home-steps__list">
            {storySteps.map((item) => (
              <li key={item.title} className="home-steps__item">
                <figure className="home-steps__figure">
                  <img
                    src={item.image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                </figure>
                <div className="home-steps__meta">
                  <h3 className="home-steps__title">{item.title}</h3>
                  <p className="home-steps__text">{item.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </ScrollReveal>
      </div>
    </section>
  );
}
