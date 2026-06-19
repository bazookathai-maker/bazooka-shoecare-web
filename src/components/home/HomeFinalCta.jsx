import { Link } from 'react-router-dom';
import ScrollReveal from '../ScrollReveal';
import './HomeStory.css';

export default function HomeFinalCta() {
  return (
    <section className="home-cta" id="start-care">
      <div className="home-cta__bg" aria-hidden="true" />
      <div className="container">
        <ScrollReveal className="home-cta__inner">
          <p className="home-cta__label">เริ่มพิธีการดูแล</p>
          <h2 className="home-cta__title">
            รองเท้าของคุณ
            <br />
            สมควรได้มากกว่าเมื่อวาน
          </h2>
          <p className="home-cta__text">
            เริ่มต้นระบบทำความสะอาด ปกป้อง และฟื้นฟู — ออกแบบมาเพื่อชีวิตจริง
            ไม่ใช่แค่โชว์ในตู้
          </p>
          <div className="home-cta__actions">
            <Link to="/products" className="btn-primary">
              เลือกซื้อสินค้า
            </Link>
            <Link to="#how-it-works" className="btn-outline btn-ghost-light">
              ดูวิธีดูแลรองเท้า
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
