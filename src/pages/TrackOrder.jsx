import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { findOrderByIdAndPhone } from '../utils/orderStorage';
import './OrderPages.css';

export default function TrackOrder() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ orderId: '', phone: '' });
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const order = findOrderByIdAndPhone(form.orderId, form.phone);
    if (!order) {
      setError(
        'ไม่พบคำสั่งซื้อ กรุณาตรวจสอบเลขคำสั่งซื้อหรือเบอร์โทรศัพท์อีกครั้ง',
      );
      return;
    }

    navigate(`/order-status/${order.id}`);
  };

  return (
    <main className="order-page">
      <header className="order-page__hero">
        <div className="container">
          <p className="section-label">คำสั่งซื้อ</p>
          <h1 className="order-page__title">ติดตามคำสั่งซื้อ</h1>
          <p className="order-page__lead">
            กรอกเลขคำสั่งซื้อและเบอร์โทรศัพท์ที่ใช้สั่งซื้อเพื่อตรวจสอบสถานะ
          </p>
        </div>
      </header>

      <div className="container order-page__body">
        <form className="order-track-form" onSubmit={handleSubmit}>
          <div className="order-track-form__fields">
            <label className="order-track-form__field">
              <span className="order-track-form__label">เลขคำสั่งซื้อ</span>
              <input
                type="text"
                name="orderId"
                value={form.orderId}
                onChange={handleChange}
                required
                className="order-track-form__input"
                placeholder="เช่น BZK-20260618-0001"
                autoComplete="off"
              />
            </label>

            <label className="order-track-form__field">
              <span className="order-track-form__label">เบอร์โทรศัพท์</span>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                className="order-track-form__input"
                placeholder="เบอร์ที่ใช้สั่งซื้อ"
                autoComplete="tel"
              />
            </label>
          </div>

          {error ? (
            <p className="order-page__message" role="alert" style={{ marginTop: '1.25rem' }}>
              {error}
            </p>
          ) : null}

          <button type="submit" className="btn-primary order-track-form__submit">
            ตรวจสอบสถานะ
          </button>
        </form>
      </div>
    </main>
  );
}
