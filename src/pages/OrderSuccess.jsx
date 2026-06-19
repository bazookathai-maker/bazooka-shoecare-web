import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import './OrderPages.css';

export default function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const orderId =
    location.state?.orderId ||
    new URLSearchParams(location.search).get('orderId');

  useEffect(() => {
    if (orderId) {
      navigate(`/order-status/${orderId}`, { replace: true });
    }
  }, [orderId, navigate]);

  if (orderId) {
    return null;
  }

  return (
    <main className="order-page">
      <header className="order-page__hero">
        <div className="container">
          <p className="section-label">คำสั่งซื้อ</p>
          <h1 className="order-page__title">สั่งซื้อสำเร็จ</h1>
        </div>
      </header>

      <div className="container order-page__body">
        <div className="order-card order-success-card">
          <div className="order-success-card__icon" aria-hidden="true">
            ✓
          </div>
          <h2 className="order-card__title" style={{ textAlign: 'center' }}>
            ขอบคุณสำหรับคำสั่งซื้อ
          </h2>
          <p className="order-success-card__text">
            ทีมงานได้รับคำสั่งซื้อของคุณแล้ว หากต้องการตรวจสอบสถานะ
            สามารถใช้เลขคำสั่งซื้อและเบอร์โทรศัพท์ที่ใช้สั่งซื้อได้
          </p>
          <div className="order-page__actions" style={{ justifyContent: 'center' }}>
            <Link to="/track-order" className="btn-primary">
              ติดตามคำสั่งซื้อ
            </Link>
            <Link to="/products" className="btn-outline">
              กลับไปที่สินค้า
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
