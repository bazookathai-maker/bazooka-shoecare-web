import { Link } from 'react-router-dom';
import './Hero.css';

const heroStats = [
  {
    label: 'Clean',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true">
        <path d="M12 3v18M8 7l4-4 4 4M8 17l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'Protect',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true">
        <path d="M12 3l8 4v6c0 5-3.5 8-8 8s-8-3-8-8V7l8-4z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'Refresh',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true">
        <path d="M4 12a8 8 0 0114-5M20 12a8 8 0 01-14 5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18 4v4h-4M6 20v-4h4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function Hero() {
  return (
    <section className="hero hero--cinematic">
      <div className="hero__overlay" aria-hidden="true" />

      <div className="hero__media" aria-hidden="true">
        <img
          className="hero__bg"
          src="/herojpg.png"
          alt=""
          fetchPriority="high"
          decoding="async"
        />
      </div>

      <div className="hero__content container">
        <div className="hero__copy">
          <p className="hero__eyebrow">Bazooka ผลิตภัณฑ์ดูแลรองเท้า สูตรจากญี่ปุ่น</p>
          <h1 className="hero__headline">
            <span>ดูแลรองเท้าคู่โปรด</span>
            <span>ได้ครบในเซตเดียว</span>
          </h1>
          <p className="hero__body hero__body--desktop">
            พิธีการดูแลที่ออกแบบสำหรับคู่ที่คุณใส่จริง — ทำความสะอาด ปกป้อง
            และฟื้นฟู สำหรับชีวิตในเมือง
          </p>

          <ul className="hero__stats" aria-label="จุดเด่นการดูแลรองเท้า">
            {heroStats.map((stat) => (
              <li key={stat.label} className="hero__stat">
                <span className="hero__stat-icon">{stat.icon}</span>
                <span className="hero__stat-label">{stat.label}</span>
              </li>
            ))}
          </ul>

          <div className="hero__actions">
            <Link to="/products" className="btn-primary">
              เลือกซื้อสินค้า
            </Link>
            <Link
              to="#how-it-works"
              className="btn-outline btn-ghost-light hero__cta-secondary"
            >
              ดูวิธีดูแลรองเท้า
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
