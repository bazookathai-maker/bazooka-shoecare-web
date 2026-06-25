import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer id="contact" className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <span className="footer__logo">BAZOOKA</span>
          <p className="footer__tagline">ดูแลรองเท้าคู่โปรด ได้ครบในเซตเดียว</p>
        </div>

        <nav className="footer__nav">
          <Link to="/" className="footer__link">
            หน้าแรก
          </Link>
          <Link to="/products" className="footer__link">
            สินค้า
          </Link>
          <Link to="/recommended" className="footer__link">
            TOP PRODUCT
          </Link>
          <Link to="/articles" className="footer__link">
            บทความ
          </Link>
          <Link to="/reviews" className="footer__link">
            รีวิว
          </Link>
          <Link to="/track-order" className="footer__link">
            ติดตามคำสั่งซื้อ
          </Link>
          <Link to="/contact" className="footer__link">
            ติดต่อเรา
          </Link>
        </nav>

        <p className="footer__copy">
          &copy; {new Date().getFullYear()} BAZOOKA สงวนลิขสิทธิ์
        </p>
      </div>
    </footer>
  );
}
