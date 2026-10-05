import { Link, useLocation } from 'react-router-dom';
import './OrderPages.css';

export default function OrderSuccess() {
  const location = useLocation();
  const search = new URLSearchParams(location.search);
  const orderNumber =
    location.state?.orderNumber ||
    search.get('orderNumber') ||
    search.get('orderId') ||
    location.state?.orderId;
  const orderId = location.state?.orderId || search.get('orderId') || null;
  const fromStripeCheckout = Boolean(search.get('session_id'));

  return (
    <main className="order-page">
      <header className="order-page__hero">
        <div className="container">
          <p className="section-label">คำสั่งซื้อ</p>
          <h1 className="order-page__title">
            {fromStripeCheckout
              ? 'กำลังยืนยันการชำระเงิน'
              : 'ได้รับคำสั่งซื้อแล้ว'}
          </h1>
        </div>
      </header>

      <div className="container order-page__body">
        <div className="order-card order-success-card">
          <h2 className="order-card__title" style={{ textAlign: 'center' }}>
            {fromStripeCheckout
              ? 'ขอบคุณ — ระบบกำลังยืนยันการชำระเงิน'
              : 'ขอบคุณสำหรับคำสั่งซื้อ'}
          </h2>

          {orderNumber ? (
            <div className="order-meta" style={{ marginBottom: '1.25rem' }}>
              <div className="order-meta__row" style={{ textAlign: 'center' }}>
                <span className="order-meta__label">เลขที่คำสั่งซื้อ</span>
                <span className="order-meta__value order-success-card__order-id">
                  #{orderNumber}
                </span>
              </div>
              {orderId && String(orderId) !== String(orderNumber) ? (
                <div className="order-meta__row" style={{ textAlign: 'center' }}>
                  <span className="order-meta__label">Order ID</span>
                  <span className="order-meta__value">{orderId}</span>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="order-success-card__text">
              ไม่พบเลขที่คำสั่งซื้อในหน้านี้ — ให้ตรวจสอบในอีเมลหรือติดตามคำสั่งซื้อ
            </p>
          )}

          <p className="order-success-card__text">
            {fromStripeCheckout
              ? 'คำสั่งซื้อถูกสร้างในสถานะรอชำระเงินแล้ว การชำระเงินจะถือว่าสำเร็จเมื่อระบบได้รับยืนยันจาก Stripe (webhook) เท่านั้น — ยังไม่ถือว่าชำระเสร็จจนกว่าสถานะใน WooCommerce จะอัปเดต'
              : 'คำสั่งซื้อถูกบันทึกในระบบแล้ว สถานะการชำระเงินจะอัปเดตเมื่อได้รับการยืนยันจากระบบชำระเงิน'}
          </p>

          <div
            className="order-page__actions"
            style={{ justifyContent: 'center' }}
          >
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
