/**
 * Static free-shipping option for Checkout (UI only; shippingTotal stays 0 on order).
 */
export default function CheckoutFreeShipping({ disabled = false }) {
  return (
    <section className="checkout__block">
      <h2 className="checkout__section-title">วิธีจัดส่ง</h2>
      <div
        className="checkout__payments"
        role="radiogroup"
        aria-label="วิธีจัดส่ง"
      >
        <label className="checkout__payment checkout__payment--active checkout__payment--single-row">
          <input
            type="radio"
            name="shipping-method"
            value="free_shipping"
            checked
            readOnly
            disabled={disabled}
            className="checkout__payment-input"
            aria-checked="true"
          />
          <span className="checkout__payment-label checkout__payment-label--with-price">
            <span>จัดส่งฟรี</span>
            <span className="checkout__payment-price">฿0</span>
          </span>
        </label>
      </div>
    </section>
  );
}
