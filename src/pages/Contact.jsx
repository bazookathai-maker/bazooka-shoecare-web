import { useState } from 'react';
import ScrollReveal from '../components/ScrollReveal';
import './Contact.css';

const contactInfo = [
  {
    id: 'email',
    label: 'Email',
    value: 'hello@bazooka.care',
    href: 'mailto:hello@bazooka.care',
    icon: 'mail',
  },
  {
    id: 'phone',
    label: 'โทรศัพท์',
    value: '02-000-0000',
    href: 'tel:020000000',
    icon: 'phone',
  },
  {
    id: 'facebook',
    label: 'Facebook',
    value: 'BAZOOKA Shoe Care',
    href: 'https://www.facebook.com/',
    icon: 'facebook',
    external: true,
  },
  {
    id: 'line',
    label: 'Line',
    value: '@bazooka.care',
    href: 'https://line.me/',
    icon: 'line',
    external: true,
  },
  {
    id: 'hours',
    label: 'เวลาทำการ',
    value: 'จันทร์ – ศุกร์ 10:00 – 18:00',
    icon: 'clock',
  },
];

const socialLinks = [
  { id: 'facebook', label: 'Facebook', href: 'https://www.facebook.com/' },
  { id: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/' },
  { id: 'tiktok', label: 'TikTok', href: 'https://www.tiktok.com/' },
  { id: 'youtube', label: 'YouTube', href: 'https://www.youtube.com/' },
];

const INITIAL_FORM = {
  name: '',
  email: '',
  subject: '',
  message: '',
};

function ContactIcon({ type }) {
  switch (type) {
    case 'mail':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="1.5" />
          <path d="M3.5 7l8.5 6 8.5-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'phone':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path
            d="M7 3.5h3.2l1.2 4.2-2 1.2a11 11 0 0 0 5.7 5.7l1.2-2 4.2 1.2V17a2 2 0 0 1-2.2 2A15.5 15.5 0 0 1 5 5.7 2 2 0 0 1 7 3.5z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'facebook':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M14.5 8.5V6.8c0-.8.2-1.3 1.4-1.3H17V3h-2.3C11.9 3 11 4.7 11 6.6v1.9H9v2.7h2V21h3.5v-9.8h2.3l.3-2.7h-2.6z" />
        </svg>
      );
    case 'line':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M19.4 4.3C17.4 3.1 14.8 2.4 12 2.4S6.6 3.1 4.6 4.3C2.7 5.5 1.5 7.2 1.5 9.1c0 1.7.9 3.2 2.4 4.4l-.5 3.1c-.1.5.4.9.8.7l3.5-1.7c1.3.3 2.7.5 4.3.5 2.8 0 5.4-.7 7.4-1.9 1.9-1.2 3.1-2.9 3.1-4.8 0-1.9-1.2-3.6-3.1-4.8z" />
        </svg>
      );
    case 'clock':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <circle cx="12" cy="12" r="8.25" />
          <path d="M12 8v4.5l3 1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return null;
  }
}

export default function Contact() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    if (submitted) setSubmitted(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
    setForm(INITIAL_FORM);
  };

  return (
    <main className="contact-page">
      <header className="contact-page__hero">
        <div className="container">
          <ScrollReveal className="contact-page__hero-inner">
            <h1 className="contact-page__title">Contact</h1>
            <p className="contact-page__subtitle">
              ติดต่อทีม BAZOOKA สำหรับคำถามเรื่องสินค้าและการดูแลรองเท้า
            </p>
          </ScrollReveal>
        </div>
      </header>

      <section className="contact-page__content" aria-label="ข้อมูลติดต่อและแบบฟอร์ม">
        <div className="container">
          <div className="contact-page__layout">
            <div className="contact-page__aside">
              <ul className="contact-page__info-grid">
                {contactInfo.map((item) => {
                  const ValueTag = item.href ? 'a' : 'span';
                  const valueProps = item.href
                    ? {
                        href: item.href,
                        ...(item.external
                          ? { target: '_blank', rel: 'noopener noreferrer' }
                          : {}),
                      }
                    : {};

                  return (
                    <li key={item.id} className="contact-info-card">
                      <span className="contact-info-card__icon">
                        <ContactIcon type={item.icon} />
                      </span>
                      <p className="contact-info-card__label">{item.label}</p>
                      <ValueTag className="contact-info-card__value" {...valueProps}>
                        {item.value}
                      </ValueTag>
                    </li>
                  );
                })}
              </ul>

              <div className="contact-page__social">
                <p className="contact-page__social-label">Social</p>
                <ul className="contact-page__social-list">
                  {socialLinks.map((link) => (
                    <li key={link.id}>
                      <a
                        href={link.href}
                        className="contact-page__social-link"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="contact-page__form-panel">
              <form className="contact-form" onSubmit={handleSubmit} noValidate>
                <label className="contact-form__field">
                  <span>ชื่อ</span>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    autoComplete="name"
                    required
                  />
                </label>

                <label className="contact-form__field">
                  <span>อีเมล</span>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                  />
                </label>

                <label className="contact-form__field">
                  <span>หัวข้อ</span>
                  <input
                    type="text"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label className="contact-form__field">
                  <span>ข้อความ</span>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={5}
                    required
                  />
                </label>

                <button type="submit" className="contact-form__submit">
                  ส่งข้อความ
                </button>

                {submitted ? (
                  <p className="contact-form__note" role="status">
                    รับข้อความแล้ว ขอบคุณที่ติดต่อเรา
                  </p>
                ) : null}
              </form>
            </div>
          </div>

          <div className="contact-page__map" aria-label="แผนที่">
            <div className="contact-page__map-placeholder">
              <p className="contact-page__map-title">Google Map</p>
              <p className="contact-page__map-text">Map placeholder</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
