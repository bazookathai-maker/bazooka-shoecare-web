import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThaiAddressSelector from '../components/ThaiAddressSelector';
import { useCart } from '../context/CartContext';
import {
  buildStoreAddressesFromForm,
  createPromptPayCharge,
  createRestOrder,
  extractShippingPackages,
  getRestTestPaymentOptions,
  selectShippingRate,
  updateCartCustomer,
  validateCheckoutCustomerForm,
} from '../api/woocommerce';
import { resolveThaiProvinceFromWooState } from '../data/thaiWooStates';
import './Checkout.css';

const SYNC_DEBOUNCE_MS = 700;

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
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

function formatMoney(value) {
  return `฿${Number(value || 0).toLocaleString('th-TH')}`;
}

function FieldError({ message }) {
  if (!message) return null;
  return (
    <p className="checkout__field-error" role="alert">
      {message}
    </p>
  );
}

function stableCustomerPayloadKey(payload) {
  try {
    return JSON.stringify(payload);
  } catch {
    return '';
  }
}

function splitAddress2Parts(address2) {
  return String(address2 || '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

function formFromWooAddresses(billing, shipping) {
  const bill = billing || {};
  const ship = shipping || bill;
  const address2Parts = splitAddress2Parts(ship.address_2 || bill.address_2);
  const street = address2Parts.find((part) => part.startsWith('ถนน')) || '';
  const remaining = address2Parts.filter((part) => part !== street);
  const subdistrict = remaining[0] || '';
  const addressNote = remaining.slice(1).join(', ');
  const stateCode = ship.state || bill.state || '';
  const province =
    resolveThaiProvinceFromWooState(stateCode) || stateCode || '';

  return {
    firstName: String(bill.first_name || ship.first_name || '').trim(),
    lastName: String(bill.last_name || ship.last_name || '').trim(),
    email: String(bill.email || '').trim(),
    phone: String(bill.phone || ship.phone || '').trim(),
    addressLine: String(ship.address_1 || bill.address_1 || '').trim(),
    province,
    district: String(ship.city || bill.city || '').trim(),
    subdistrict,
    street: street.replace(/^ถนน/, ''),
    postalCode: String(ship.postcode || bill.postcode || '').trim(),
    addressNote,
    note: '',
  };
}

function buildSelectedRatesMap(packages, previousSelected = {}) {
  const next = {};
  for (const pkg of packages) {
    const previous = previousSelected[pkg.packageId];
    const stillValid = pkg.rates.some((rate) => rate.rateId === previous);
    if (stillValid) {
      next[pkg.packageId] = previous;
      continue;
    }

    const preselected = pkg.rates.find((rate) => rate.selected);
    if (preselected) {
      next[pkg.packageId] = preselected.rateId;
      continue;
    }

    if (pkg.rates.length === 1) {
      next[pkg.packageId] = pkg.rates[0].rateId;
    }
  }
  return next;
}

export default function Checkout() {
  const navigate = useNavigate();
  const {
    items,
    itemsTotal,
    shippingTotal,
    discountTotal,
    total,
    billingAddress,
    shippingAddress,
    syncCart,
    resetCartAfterOrder,
    hydrating,
  } = useCart();
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [addressSynced, setAddressSynced] = useState(false);
  const [lastPayload, setLastPayload] = useState(null);
  const [shippingPackages, setShippingPackages] = useState([]);
  const [selectedRates, setSelectedRates] = useState({});
  const [shippingChecked, setShippingChecked] = useState(false);
  const [formHydrated, setFormHydrated] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');

  const formRef = useRef(form);
  const inFlightRef = useRef(false);
  const lastSentKeyRef = useRef('');
  const debounceTimerRef = useRef(0);
  const requestSeqRef = useRef(0);
  const shippingInFlightRef = useRef(false);
  const placeOrderLockRef = useRef(false);

  useEffect(() => {
    formRef.current = form;
  }, [form]);

  useEffect(() => {
    const options = getRestTestPaymentOptions();
    if (!options.length) {
      setPaymentMethod('');
      return;
    }
    setPaymentMethod((current) => {
      if (options.some((opt) => opt.id === current)) {
        return current;
      }
      return options[0].id;
    });
  }, []);

  const paymentOptions = getRestTestPaymentOptions();

  useEffect(() => {
    if (hydrating || formHydrated) return;
    const hasAddress =
      Boolean(shippingAddress?.address_1) ||
      Boolean(billingAddress?.address_1) ||
      Boolean(billingAddress?.email);
    if (!hasAddress) {
      setFormHydrated(true);
      return;
    }

    const hydrated = formFromWooAddresses(billingAddress, shippingAddress);
    setForm(hydrated);
    formRef.current = hydrated;
    setAddressSynced(true);
    setFormHydrated(true);
  }, [hydrating, formHydrated, billingAddress, shippingAddress]);

  useEffect(
    () => () => {
      window.clearTimeout(debounceTimerRef.current);
    },
    [],
  );

  const applyShippingFromCart = useCallback((cart) => {
    const rawRates = cart?.raw?.shipping_rates ?? cart?.shippingRates ?? null;
    console.log('WooCommerce shipping_rates response:', rawRates);
    console.log(
      'shipping_rates isArray:',
      Array.isArray(rawRates),
      'packageCount:',
      Array.isArray(rawRates) ? rawRates.length : 0,
    );

    const packages = extractShippingPackages(cart);
    setShippingPackages(packages);
    setShippingChecked(true);

    if (packages.length === 0) {
      setSelectedRates({});
      return { packages, nextSelected: {} };
    }

    const nextSelected = buildSelectedRatesMap(packages, {});
    setSelectedRates(nextSelected);
    return { packages, nextSelected };
  }, []);

  const maybeAutoSelectSingleRates = useCallback(
    async (packages, nextSelected) => {
      if (!packages.length) return null;

      let latestCart = null;
      for (const pkg of packages) {
        const rateId = nextSelected[pkg.packageId];
        if (!rateId) continue;
        // Only auto-select when package has exactly one rate from Woo.
        if (pkg.rates.length !== 1) continue;
        latestCart = await selectShippingRate(pkg.packageId, rateId);
        console.log(
          'WooCommerce select-shipping-rate (auto) response:',
          latestCart.raw,
        );
      }
      return latestCart;
    },
    [],
  );

  const syncCustomerToWoo = useCallback(
    async ({ source = 'auto', formSnapshot } = {}) => {
      const nextForm = formSnapshot || formRef.current;
      const validation = validateCheckoutCustomerForm(nextForm);

      if (!validation.ok) {
        if (source === 'submit' || source === 'blur') {
          setShowErrors(true);
          setFieldErrors(validation.fieldErrors);
          setError(validation.errors[0] || 'กรุณากรอกข้อมูลให้ครบ');
          setStatusMessage('');
        }
        return false;
      }

      const { billing_address, shipping_address, stateCode } =
        buildStoreAddressesFromForm(nextForm);
      const payload = { billing_address, shipping_address };
      const payloadKey = stableCustomerPayloadKey(payload);

      if (payloadKey && payloadKey === lastSentKeyRef.current && addressSynced) {
        if (source === 'submit') {
          setStatusMessage('ข้อมูลลูกค้าและที่อยู่ตรงกับ WooCommerce แล้ว');
        }
        return true;
      }

      if (inFlightRef.current) {
        return false;
      }

      inFlightRef.current = true;
      const seq = ++requestSeqRef.current;
      setLoading(true);
      setError('');
      setFieldErrors({});
      setStatusMessage('กำลังอัปเดตข้อมูลลูกค้าและที่อยู่...');

      try {
        console.log('WooCommerce update-customer payload:', payload);
        console.log('Resolved Woo state code:', stateCode);

        let updatedCart = await updateCartCustomer(payload);
        if (seq !== requestSeqRef.current) return false;

        console.log('WooCommerce update-customer response:', updatedCart.raw);
        syncCart(updatedCart);
        lastSentKeyRef.current = payloadKey;
        setLastPayload(payload);
        setAddressSynced(true);
        setShowErrors(false);

        const { packages, nextSelected } = applyShippingFromCart(updatedCart);

        if (packages.length === 0) {
          setStatusMessage('อัปเดตที่อยู่แล้ว — ยังไม่มีวิธีจัดส่ง');
          return true;
        }

        setStatusMessage('อัปเดตที่อยู่แล้ว — พบวิธีจัดส่งจาก WooCommerce');

        const autoCart = await maybeAutoSelectSingleRates(
          packages,
          nextSelected,
        );
        if (seq !== requestSeqRef.current) return false;

        if (autoCart) {
          syncCart(autoCart);
          applyShippingFromCart(autoCart);
          setStatusMessage('เลือกวิธีจัดส่งอัตโนมัติแล้ว (มีเพียง 1 วิธี)');
        }

        return true;
      } catch (err) {
        if (seq !== requestSeqRef.current) return false;
        setAddressSynced(false);
        setShippingChecked(false);
        setShippingPackages([]);
        setSelectedRates({});
        setStatusMessage('');
        setError(
          err instanceof Error
            ? err.message
            : 'อัปเดตข้อมูลลูกค้าไม่สำเร็จ กรุณาลองใหม่อีกครั้ง',
        );
        return false;
      } finally {
        if (seq === requestSeqRef.current) {
          inFlightRef.current = false;
          setLoading(false);
        }
      }
    },
    [
      addressSynced,
      applyShippingFromCart,
      maybeAutoSelectSingleRates,
      syncCart,
    ],
  );

  const scheduleAutoSync = useCallback(
    (nextForm) => {
      window.clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = window.setTimeout(() => {
        const validation = validateCheckoutCustomerForm(nextForm);
        if (!validation.ok) return;
        void syncCustomerToWoo({ source: 'auto', formSnapshot: nextForm });
      }, SYNC_DEBOUNCE_MS);
    },
    [syncCustomerToWoo],
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      formRef.current = next;
      scheduleAutoSync(next);
      return next;
    });
    setAddressSynced(false);
    setShippingChecked(false);
    setShippingPackages([]);
    setSelectedRates({});
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleAddressChange = (fields) => {
    setForm((prev) => {
      const next = { ...prev, ...fields };
      formRef.current = next;
      scheduleAutoSync(next);
      return next;
    });
    setAddressSynced(false);
    setShippingChecked(false);
    setShippingPackages([]);
    setSelectedRates({});
    setFieldErrors((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(fields)) {
        delete next[key];
      }
      return next;
    });
  };

  const handleBlur = () => {
    const validation = validateCheckoutCustomerForm(formRef.current);
    if (!validation.ok) return;
    window.clearTimeout(debounceTimerRef.current);
    void syncCustomerToWoo({ source: 'blur', formSnapshot: formRef.current });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    window.clearTimeout(debounceTimerRef.current);
    setShowErrors(true);

    if (placeOrderLockRef.current || placingOrder) {
      return;
    }

    const validation = validateCheckoutCustomerForm(formRef.current);
    setFieldErrors(validation.fieldErrors);
    if (!validation.ok) {
      setError(validation.errors[0] || 'กรุณากรอกข้อมูลให้ครบ');
      setStatusMessage('');
      return;
    }

    if (!items.length) {
      setError('ไม่มีสินค้าในตะกร้า');
      setStatusMessage('');
      return;
    }

    const options = getRestTestPaymentOptions();
    const methodToUse =
      (options.some((opt) => opt.id === paymentMethod)
        ? paymentMethod
        : options[0]?.id) || '';

    if (!methodToUse) {
      setError('กรุณาเลือกวิธีชำระเงินทดสอบ (โอนเงินหรือเก็บเงินปลายทาง)');
      setStatusMessage('');
      return;
    }

    placeOrderLockRef.current = true;
    setPlacingOrder(true);
    setError('');
    setStatusMessage('กำลังสร้างคำสั่งซื้อใน WooCommerce...');

    try {
      // Best-effort: sync address to Store cart when available (does not block REST order).
      try {
        await syncCustomerToWoo({
          source: 'submit',
          formSnapshot: formRef.current,
        });
      } catch {
        // REST order create does not require Store API session.
      }

      const { order, raw } = await createRestOrder({
        form: formRef.current,
        items,
        shippingTotal,
        paymentMethod: methodToUse,
      });

      if (import.meta.env.DEV) {
        console.log('[rest-order] success', {
          order_id: order.order_id,
          order_number: order.order_number,
          order_key: order.order_key ? '[set]' : null,
          status: order.status,
        });
        console.log('[rest-order] raw keys', raw && Object.keys(raw));
      }

      let promptpay = null;
      let promptpayError = '';
      if (methodToUse === 'omise_promptpay') {
        setStatusMessage('กำลังสร้าง QR พร้อมเพย์...');
        try {
          promptpay = await createPromptPayCharge(order.order_id);
        } catch (qrErr) {
          promptpayError =
            qrErr instanceof Error
              ? qrErr.message
              : 'สร้าง QR พร้อมเพย์ไม่สำเร็จ';
        }
      }

      resetCartAfterOrder();
      setStatusMessage('');
      navigate('/order-success', {
        replace: true,
        state: {
          orderId: order.order_id,
          orderNumber: order.order_number,
          orderKey: order.order_key,
          orderStatus: order.status,
          paymentMethod: methodToUse,
          promptpay,
          promptpayError,
        },
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'ยืนยันคำสั่งซื้อไม่สำเร็จ';
      setStatusMessage('');
      setError(message);
      if (import.meta.env.DEV) {
        console.log('[rest-order] failed', {
          status: err?.status,
          message,
          data: err?.data,
        });
      }
    } finally {
      placeOrderLockRef.current = false;
      setPlacingOrder(false);
    }
  };

  const handleShippingSelect = async (packageId, rateId) => {
    if (shippingInFlightRef.current || loading) return;

    setSelectedRates((prev) => ({
      ...prev,
      [packageId]: rateId,
    }));
    setError('');
    shippingInFlightRef.current = true;
    setShippingLoading(true);
    setStatusMessage('กำลังอัปเดตวิธีจัดส่ง...');

    const payload = { package_id: packageId, rate_id: rateId };
    console.log('WooCommerce select-shipping-rate payload:', payload);

    try {
      const selectedCart = await selectShippingRate(packageId, rateId);
      console.log(
        'WooCommerce select-shipping-rate response:',
        selectedCart.raw,
      );
      syncCart(selectedCart);
      applyShippingFromCart(selectedCart);
      setSelectedRates((prev) => ({
        ...prev,
        [packageId]: rateId,
      }));
      setStatusMessage('อัปเดตวิธีจัดส่งและยอดรวมแล้ว');
    } catch (err) {
      setStatusMessage('');
      setError(
        err instanceof Error ? err.message : 'เลือกวิธีจัดส่งไม่สำเร็จ',
      );
    } finally {
      shippingInFlightRef.current = false;
      setShippingLoading(false);
    }
  };

  const visibleErrors = showErrors ? fieldErrors : {};
  const busy = loading || shippingLoading || placingOrder;
  const showShippingSection = addressSynced || shippingChecked;

  if (items.length === 0 && !busy) {
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
              <li key={item.key || item.id} className="checkout__item">
                <div className="checkout__item-media">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="checkout__item-image"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : null}
                </div>
                <div className="checkout__item-details">
                  <h3 className="checkout__item-name">{item.name}</h3>
                  <div className="checkout__item-meta">
                    <p className="checkout__item-unit">
                      จำนวน {item.quantity}
                    </p>
                    <p className="checkout__item-price">
                      {formatMoney(
                        Number.isFinite(item.lineTotal)
                          ? item.lineTotal
                          : item.price * item.quantity,
                      )}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="checkout__total-row checkout__total-row--sub">
            <span className="checkout__total-label">ยอดสินค้า</span>
            <span className="checkout__total-value">
              {formatMoney(itemsTotal)}
            </span>
          </div>
          <div className="checkout__total-row checkout__total-row--sub">
            <span className="checkout__total-label">ค่าจัดส่ง</span>
            <span className="checkout__total-value">
              {formatMoney(shippingTotal)}
            </span>
          </div>
          {Number(discountTotal) > 0 ? (
            <div className="checkout__total-row checkout__total-row--sub">
              <span className="checkout__total-label">ส่วนลด</span>
              <span className="checkout__total-value">
                -{formatMoney(discountTotal)}
              </span>
            </div>
          ) : null}
          <div className="checkout__total-row">
            <span className="checkout__total-label">รวมทั้งสิ้น</span>
            <span className="checkout__total-value">{formatMoney(total)}</span>
          </div>
        </aside>

        <form className="checkout__form" onSubmit={handleSubmit} noValidate>
          <section className="checkout__block">
            <h2 className="checkout__section-title">ข้อมูลลูกค้า</h2>
            <div className="checkout__fields">
              <label className="checkout__field">
                <span className="checkout__field-label">ชื่อ</span>
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  autoComplete="given-name"
                  className={`checkout__input${
                    visibleErrors.firstName ? ' checkout__input--error' : ''
                  }`}
                  disabled={busy}
                  aria-invalid={Boolean(visibleErrors.firstName)}
                />
                <FieldError message={visibleErrors.firstName} />
              </label>

              <label className="checkout__field">
                <span className="checkout__field-label">นามสกุล</span>
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  autoComplete="family-name"
                  className={`checkout__input${
                    visibleErrors.lastName ? ' checkout__input--error' : ''
                  }`}
                  disabled={busy}
                  aria-invalid={Boolean(visibleErrors.lastName)}
                />
                <FieldError message={visibleErrors.lastName} />
              </label>

              <label className="checkout__field">
                <span className="checkout__field-label">อีเมล</span>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  autoComplete="email"
                  className={`checkout__input${
                    visibleErrors.email ? ' checkout__input--error' : ''
                  }`}
                  disabled={busy}
                  aria-invalid={Boolean(visibleErrors.email)}
                />
                <FieldError message={visibleErrors.email} />
              </label>

              <label className="checkout__field">
                <span className="checkout__field-label">เบอร์โทรศัพท์</span>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  autoComplete="tel"
                  className={`checkout__input${
                    visibleErrors.phone ? ' checkout__input--error' : ''
                  }`}
                  disabled={busy}
                  aria-invalid={Boolean(visibleErrors.phone)}
                />
                <FieldError message={visibleErrors.phone} />
              </label>
            </div>
          </section>

          <section className="checkout__block checkout__block--address">
            <h2 className="checkout__section-title">ที่อยู่จัดส่ง / ใบเสร็จ</h2>
            <p className="checkout__payment-note">
              ที่อยู่เดียวกันใช้ทั้ง Billing และ Shipping ไปยัง WooCommerce
            </p>
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
                  onBlur={handleBlur}
                  autoComplete="address-line1"
                  className={`checkout__input${
                    visibleErrors.addressLine ? ' checkout__input--error' : ''
                  }`}
                  placeholder="เช่น 99/99 หมู่บ้าน... อาคาร... ชั้น..."
                  disabled={busy}
                  aria-invalid={Boolean(visibleErrors.addressLine)}
                />
                <FieldError message={visibleErrors.addressLine} />
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
                disabled={busy}
                errors={visibleErrors}
              />

              <label className="checkout__field checkout__field--full">
                <span className="checkout__field-label">รายละเอียดเพิ่มเติม</span>
                <textarea
                  name="addressNote"
                  value={form.addressNote}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  rows={2}
                  className="checkout__input checkout__textarea checkout__textarea--compact"
                  placeholder="จุดสังเกต / ฝากไว้ที่นิติ / เบอร์ติดต่อสำรอง"
                  disabled={busy}
                />
              </label>
            </div>
          </section>

          {showShippingSection ? (
            <section className="checkout__block">
              <h2 className="checkout__section-title">วิธีจัดส่ง</h2>
              {shippingPackages.length === 0 ? (
                <p className="checkout__status" role="status">
                  ยังไม่มีวิธีจัดส่ง
                </p>
              ) : (
                shippingPackages.map((pkg) => (
                  <div
                    key={String(pkg.packageId)}
                    className="checkout__shipping-package"
                  >
                    {pkg.name ? (
                      <p className="checkout__shipping-package-name">
                        {pkg.name}
                      </p>
                    ) : null}
                    <div
                      className="checkout__payments checkout__shipping-options"
                      role="radiogroup"
                      aria-label={`วิธีจัดส่ง ${pkg.name || pkg.packageId}`}
                    >
                      {pkg.rates.map((rate) => {
                        const checked =
                          selectedRates[pkg.packageId] === rate.rateId;
                        return (
                          <label
                            key={rate.rateId}
                            className={`checkout__payment ${
                              checked ? 'checkout__payment--active' : ''
                            }`}
                          >
                            <input
                              type="radio"
                              name={`shipping-${pkg.packageId}`}
                              value={rate.rateId}
                              checked={checked}
                              onChange={() =>
                                handleShippingSelect(pkg.packageId, rate.rateId)
                              }
                              className="checkout__payment-input"
                              disabled={busy}
                            />
                            <span className="checkout__payment-label">
                              {rate.name}
                              {Number.isFinite(rate.price)
                                ? ` ${formatMoney(rate.price)}`
                                : ''}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </section>
          ) : null}

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
                  disabled={busy}
                />
              </label>
            </div>
          </section>

          <section className="checkout__block">
            <h2 className="checkout__section-title">วิธีชำระเงิน (ทดสอบ)</h2>
            <div
              className="checkout__payments"
              role="radiogroup"
              aria-label="วิธีชำระเงิน"
            >
              {paymentOptions.map((opt) => {
                const checked = paymentMethod === opt.id;
                return (
                  <label
                    key={opt.id}
                    className={`checkout__payment ${
                      checked ? 'checkout__payment--active' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value={opt.id}
                      checked={checked}
                      onChange={() => setPaymentMethod(opt.id)}
                      className="checkout__payment-input"
                      disabled={busy}
                    />
                    <span className="checkout__payment-label">{opt.label}</span>
                  </label>
                );
              })}
            </div>
            <p className="checkout__payment-note">
              โอนเงินและเก็บเงินปลายทางสร้างออเดอร์ทันที — พร้อมเพย์จะแสดง QR
              หลังสร้างคำสั่งซื้อ (Omise Test Mode ยังไม่ตัดเงินจนกว่าจะจ่ายสำเร็จ)
            </p>
          </section>

          {error ? (
            <p className="checkout__error" role="alert">
              {error}
            </p>
          ) : null}

          {statusMessage ? (
            <p className="checkout__status" role="status">
              {statusMessage}
            </p>
          ) : null}

          {addressSynced && lastPayload ? (
            <p className="checkout__status" role="status">
              ที่อยู่พร้อมสั่งซื้อ (state:{' '}
              {lastPayload.shipping_address?.state}, postcode:{' '}
              {lastPayload.shipping_address?.postcode})
            </p>
          ) : null}

          <button
            type="submit"
            className="checkout__submit btn-primary"
            disabled={busy || !items.length}
          >
            {placingOrder ? 'กำลังยืนยันคำสั่งซื้อ...' : 'ยืนยันคำสั่งซื้อ'}
          </button>
        </form>
      </div>
    </main>
  );
}
