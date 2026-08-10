import { Link } from 'react-router-dom';
import './Hero.css';

export default function Hero() {
  return (
    <section className="hero hero--cinematic">
      <div className="hero__overlay" aria-hidden="true" />

      <div className="hero__media" aria-hidden="true">
        <img
          className="hero__bg"
          src="/hero.jpg"
          alt=""
          fetchPriority="high"
          decoding="async"
        />
      </div>

      <div className="hero__content container">
        <div className="hero__copy">
          <p className="hero__eyebrow">สูตรจากญี่ปุ่น</p>
          <h1 className="hero__headline">
            <span>ดูแลรองเท้าคู่โปรด</span>
            <span>ได้ครบในเซตเดียว</span>
          </h1>
          <p className="hero__body">
            ทำความสะอาด ปกป้อง และฟื้นฟู — สำหรับคู่ที่คุณใส่จริงในชีวิตประจำวัน
          </p>

          <div className="hero__actions">
            <Link to="/products" className="btn-primary">
              เลือกซื้อสินค้า
            </Link>
            <Link
              to="#how-to-care"
              className="btn-outline hero__cta-secondary"
            >
              ดูวิธีดูแลรองเท้า
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
