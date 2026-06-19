import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThaiAddressSelector from '../components/ThaiAddressSelector';
import { useCart } from '../context/CartContext';
import { buildCheckoutAddressPayload } from '../data/thaiAddress';
import {
  createOrderFromCheckout,
  saveOrder,
} from '../utils/orderStorage';
import './Checkout.css';

const PAYMENT_OPTIONS = [
  { id: 'bank', label: 'โอนเงินผ่านธนาคาร' },
  { id: 'promptpay', label: 'คิวอาร์ พร้อมเพย์' },
  { id: 'cod', label: 'เก็บเงินปลายทาง' },
];

const initialForm = {
  fullName: '',
  phone: '',
  addressLine: '',
  province: '',
  district: '',
  subdistrict: '',
  street: '',
  postalCode: '',
  addressNote: '',
  note: '',
};

export default function Checkout() {
  const navigate = useNavigate();
  const { items, total, updateQuantity, clearCart } = useCart();
  const [form, setForm] = useState(initialForm);
  const [payment, setPayment] = useState('bank');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (fields) => {
    setForm((prev) => ({ ...prev, ...fields }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = buildCheckoutAddressPayload(form);
    const order = createOrderFromCheckout({
      payload,
      payment,
      items,
      total,
    });

    saveOrder(order);
    clearCart();
    navigate(`/order-status/${order.id}`);
  };

  if (items.length === 0) {
    return (
      <main className="checkout checkout--empty">
        <div className="container checkout__empty-inner">
          <p className="section-label">ชำระเงิน</p>
          <h1 className="checkout__title">ตะกร้าสินค้า</h1>
          <p className="checkout__empty-message">ยังไม่มีสินค้าในตะกร้า</p>
          <Link to="/products" className="btn-primary checkout__shop-link">
            กลับไปที่สินค้า
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout">
      <header className="checkout__hero">
        <div className="container">
          <p className="section-label">ชำระเงิน</p>
          <h1 className="checkout__title">ชำระเงิน</h1>
        </div>
      </header>

      <div className="container checkout__layout">
        <aside className="checkout__summary">
          <h2 className="checkout__section-title">สรุปคำสั่งซื้อ</h2>
          <ul className="checkout__items">
            {items.map((item) => (
              <li key={item.id} className="checkout__item">
                <div className="checkout__item-media">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="checkout__item-image"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="checkout__item-details">
                  <h3 className="checkout__item-name">{item.name}</h3>
                  <div className="checkout__item-meta">
                    <label className="checkout__qty-label">
                      จำนวน
                      <select
                        className="checkout__qty-select"
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(item.id, Number(e.target.value))
                        }
                        aria-label={`จำนวน ${item.name}`}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </label>
                    <p className="checkout__item-price">
                      ฿{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                  <p className="checkout__item-unit">
                    ฿{item.price.toLocaleString()} / ชิ้น
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <div className="checkout__total-row">
            <span className="checkout__total-label">รวมทั้งสิ้น</span>
            <span className="checkout__total-value">
              ฿{total.toLocaleString()}
            </span>
          </div>
        </aside>

        <form className="checkout__form" onSubmit={handleSubmit}>
          <section className="checkout__block">
            <h2 className="checkout__section-title">ข้อมูลลูกค้า</h2>
            <div className="checkout__fields">
              <label className="checkout__field">
                <span className="checkout__field-label">ชื่อ-นามสกุล</span>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                  autoComplete="name"
                  className="checkout__input"
                />
              </label>
              <label className="checkout__field">
                <span className="checkout__field-label">เบอร์โทรศัพท์</span>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  autoComplete="tel"
                  className="checkout__input"
                />
              </label>
            </div>
          </section>

          <section className="checkout__block checkout__block--address">
            <h2 className="checkout__section-title">ที่อยู่จัดส่ง</h2>
            <div className="checkout__fields">
              <label className="checkout__field checkout__field--full">
                <span className="checkout__field-label">
                  บ้านเลขที่ / อาคาร / หมู่บ้าน / ชั้น / ห้อง
                </span>
                <input
                  type="text"
                  name="addressLine"
                  value={form.addressLine}
                  onChange={handleChange}
                  required
                  autoComplete="address-line1"
                  className="checkout__input"
                  placeholder="เช่น 99/99 หมู่บ้าน... อาคาร... ชั้น..."
                />
              </label>

              <ThaiAddressSelector
                value={{
                  province: form.province,
                  district: form.district,
                  subdistrict: form.subdistrict,
                  street: form.street,
                  postalCode: form.postalCode,
                }}
                onChange={handleAddressChange}
              />

              <label className="checkout__field checkout__field--full">
                <span className="checkout__field-label">รายละเอียดเพิ่มเติม</span>
                <textarea
                  name="addressNote"
                  value={form.addressNote}
                  onChange={handleChange}
                  rows={2}
                  className="checkout__input checkout__textarea checkout__textarea--compact"
                  placeholder="จุดสังเกต / ฝากไว้ที่นิติ / เบอร์ติดต่อสำรอง"
                />
              </label>
            </div>
          </section>

          <section className="checkout__block">
            <h2 className="checkout__section-title">หมายเหตุคำสั่งซื้อ</h2>
            <div className="checkout__fields">
              <label className="checkout__field checkout__field--full">
                <span className="checkout__field-label">หมายเหตุ</span>
                <textarea
                  name="note"
                  value={form.note}
                  onChange={handleChange}
                  rows={2}
                  className="checkout__input checkout__textarea checkout__textarea--compact"
                  placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)"
                />
              </label>
            </div>
          </section>

          <section className="checkout__block">
            <h2 className="checkout__section-title">ช่องทางชำระเงิน</h2>
            <div
              className="checkout__payments"
              role="radiogroup"
              aria-label="ช่องทางชำระเงิน"
            >
              {PAYMENT_OPTIONS.map((option) => (
                <label
                  key={option.id}
                  className={`checkout__payment ${
                    payment === option.id ? 'checkout__payment--active' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={option.id}
                    checked={payment === option.id}
                    onChange={() => setPayment(option.id)}
                    className="checkout__payment-input"
                  />
                  <span className="checkout__payment-label">{option.label}</span>
                </label>
              ))}
            </div>
          </section>

          <button type="submit" className="checkout__submit btn-primary">
            ยืนยันคำสั่งซื้อ
          </button>
        </form>
      </div>
    </main>
  );
}
