import { Link, useLocation } from 'react-router-dom';
import './OrderPages.css';

export default function OrderSuccess() {
  const location = useLocation();
  const orderNumber =
    location.state?.orderNumber ||
    location.state?.orderId ||
    new URLSearchParams(location.search).get('orderNumber') ||
    new URLSearchParams(location.search).get('orderId');
  const orderId = location.state?.orderId || null;
  const orderStatus = location.state?.orderStatus || '';
  const paymentMethod = location.state?.paymentMethod || '';

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

          {orderNumber ? (
            <div className="order-meta" style={{ marginBottom: '1.25rem' }}>
              <div className="order-meta__row" style={{ textAlign: 'center' }}>
                <span className="order-meta__label">เลขที่คำสั่งซื้อ</span>
                <span className="order-meta__value order-success-card__order-id">
                  {orderNumber}
                </span>
              </div>
              {orderId && String(orderId) !== String(orderNumber) ? (
                <div className="order-meta__row" style={{ textAlign: 'center' }}>
                  <span className="order-meta__label">Order ID</span>
                  <span className="order-meta__value">{orderId}</span>
                </div>
              ) : null}
              {orderStatus ? (
                <div className="order-meta__row" style={{ textAlign: 'center' }}>
                  <span className="order-meta__label">สถานะ</span>
                  <span className="order-meta__value">{orderStatus}</span>
                </div>
              ) : null}
              {paymentMethod ? (
                <div className="order-meta__row" style={{ textAlign: 'center' }}>
                  <span className="order-meta__label">วิธีชำระเงิน</span>
                  <span className="order-meta__value">{paymentMethod}</span>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="order-success-card__text">
              ไม่พบเลขที่คำสั่งซื้อในหน้านี้ — หากเพิ่งสั่งซื้อสำเร็จ
              ให้ตรวจสอบในอีเมลหรือหลังบ้าน WooCommerce
            </p>
          )}

          <p className="order-success-card__text">
            ทีมงานได้รับคำสั่งซื้อของคุณแล้วในระบบ WooCommerce
          </p>
          <div
            className="order-page__actions"
            style={{ justifyContent: 'center' }}
          >
            <Link to="/products" className="btn-primary">
              กลับไปที่สินค้า
            </Link>
            <Link to="/track-order" className="btn-outline">
              ติดตามคำสั่งซื้อ
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
