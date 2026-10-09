import { useState } from 'react';
import ScrollReveal from '../components/ScrollReveal';
import './Contact.css';

const CONTACT_EMAIL = 'bazookathai@gmail.com';

const contactInfo = [
  {
    id: 'email',
    label: 'Email',
    value: CONTACT_EMAIL,
    href: `mailto:${CONTACT_EMAIL}`,
    icon: 'mail',
  },
  {
    id: 'phone',
    label: 'โทรศัพท์',
    value: '098-556-5388',
    href: 'tel:0985565388',
    icon: 'phone',
  },
  {
    // No confirmed page URL yet — keep as text until one is provided.
    id: 'facebook',
    label: 'Facebook',
    value: 'Bazooka ผลิตภัณฑ์ดูแลรองเท้า',
    icon: 'facebook',
  },
  {
    id: 'line',
    label: 'LINE',
    value: '@bazookath',
    href: 'https://line.me/R/ti/p/@bazookath',
    icon: 'line',
    external: true,
  },
  {
    id: 'hours',
    label: 'เวลาทำการ',
    value: '08.30–17.30 น.',
    icon: 'clock',
  },
];

const socialLinks = [
  { id: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/bazookashoecare/' },
  { id: 'tiktok', label: 'TikTok', href: 'https://www.tiktok.com/@bazookashoecare' },
  { id: 'youtube', label: 'YouTube', href: 'https://www.youtube.com/@bazookathailand' },
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

/** No mail backend yet: hand the message to the visitor's email app instead of faking a send. */
function buildMailtoHref({ name, email, subject, message }) {
  const body = `${message.trim()}\n\n— ${name.trim()} (${email.trim()})`;
  const params = new URLSearchParams({ subject: subject.trim(), body });
  return `mailto:${CONTACT_EMAIL}?${params.toString().replace(/\+/g, '%20')}`;
}

export default function Contact() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [status, setStatus] = useState({ type: '', text: '' });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    if (status.text) setStatus({ type: '', text: '' });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const missing = ['name', 'email', 'subject', 'message'].some(
      (field) => !form[field].trim(),
    );
    if (missing) {
      setStatus({ type: 'error', text: 'กรุณากรอกข้อมูลให้ครบทุกช่อง' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setStatus({ type: 'error', text: 'กรุณากรอกอีเมลให้ถูกต้อง' });
      return;
    }
    window.location.href = buildMailtoHref(form);
    setStatus({
      type: 'info',
      text: `กำลังเปิดแอปอีเมลของคุณ ข้อความจะถูกส่งถึง ${CONTACT_EMAIL} เมื่อคุณกดส่งในแอปอีเมล`,
    });
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
                  ส่งข้อความทางอีเมล
                </button>

                {status.text ? (
                  <p
                    className="contact-form__note"
                    role={status.type === 'error' ? 'alert' : 'status'}
                  >
                    {status.text}
                  </p>
                ) : (
                  <p className="contact-form__note">
                    ระบบจะเปิดแอปอีเมลของคุณพร้อมข้อความนี้ เพื่อส่งถึง {CONTACT_EMAIL}
                  </p>
                )}
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
