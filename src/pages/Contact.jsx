import ScrollReveal from '../components/ScrollReveal';
import './Contact.css';

const contactImage = {
  src: '/images/contact-workspace.jpg',
  fallback: '/products/cleaner-howto-1.jpg',
};

const contactDetails = [
  {
    id: 'email',
    label: 'อีเมล',
    value: (
      <a href="mailto:hello@bazooka.care">hello@bazooka.care</a>
    ),
  },
  {
    id: 'line',
    label: 'ไลน์',
    value: '@bazooka.care',
  },
  {
    id: 'hours',
    label: 'เวลาทำการ',
    value: 'จันทร์ – ศุกร์ 10:00 – 18:00 น. (เวลาไทย)',
  },
];

export default function Contact() {
  return (
    <main className="contact-page">
      <header className="contact-page__intro">
        <div className="container container--editorial">
          <ScrollReveal className="contact-page__intro-inner">
            <p className="section-label">ติดต่อเรา</p>
            <h1 className="section-title">ติดต่อเรา</h1>
            <p className="contact-page__lead">
              เรายินดีรับฟังทุกคำถามเกี่ยวกับผลิตภัณฑ์และการดูแลรองเท้า
            </p>
          </ScrollReveal>
        </div>
      </header>

      <section className="contact-page__body">
        <div className="container container--editorial">
          <ScrollReveal delay={60}>
            <div className="contact-page__split">
              <div className="contact-page__info">
                <p className="contact-page__text">
                  ติดต่อทีม BAZOOKA สำหรับคำถามด้านผลิตภัณฑ์ การสั่งซื้อ
                  หรือความร่วมมือทางธุรกิจ — มีทีมงานดูแลรองเท้าจริง
                  อยู่เบื้องหลังทุกคำตอบ
                </p>

                <ul className="contact-page__list">
                  {contactDetails.map((item) => (
                    <li key={item.id} className="contact-page__item">
                      <span className="contact-page__label">{item.label}</span>
                      <span className="contact-page__value">{item.value}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <figure className="contact-page__figure">
                <img
                  src={contactImage.src}
                  alt=""
                  className="contact-page__image"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    if (
                      contactImage.fallback &&
                      e.currentTarget.src !== contactImage.fallback
                    ) {
                      e.currentTarget.src = contactImage.fallback;
                    }
                  }}
                />
              </figure>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}
