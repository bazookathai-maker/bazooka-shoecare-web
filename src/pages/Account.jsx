import { useEffect, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import LocaleLink from '../components/LocaleLink';
import { useLocale } from '../i18n/LocaleContext';
import { translateKnown } from '../i18n/knownMessages';
import { localizedProductName } from '../i18n/productCopy';
import { fetchCustomerOrders } from '../api/customerAuth';
import { useAuth } from '../context/AuthContext';
import ThaiAddressSelector from '../components/ThaiAddressSelector';
import {
  buildStoreAddressesFromForm,
  validateCheckoutCustomerForm,
} from '../api/woocommerce';
import { formFromCustomerProfile } from '../utils/customerAddressForm';
import { formatThaiProvince } from '../data/thaiWooStates';
import useSeo from '../hooks/useSeo';
import './Checkout.css';
import './Account.css';

const STATUS_LABELS = {
  pending: 'รอดำเนินการ',
  processing: 'กำลังจัดเตรียม',
  'on-hold': 'พักไว้',
  completed: 'สำเร็จ',
  cancelled: 'ยกเลิก',
  refunded: 'คืนเงิน',
  failed: 'ไม่สำเร็จ',
};

function formatOrderDate(value, locale) {
  if (!value) return '-';
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatMoney(total, currency = 'THB') {
  const amount = Number(total);
  if (!Number.isFinite(amount)) return total;
  return `${amount.toLocaleString('th-TH')} ${currency}`;
}

function customerDisplayName(customer, fallback) {
  const name = [customer?.first_name, customer?.last_name]
    .filter(Boolean)
    .join(' ')
    .trim();
  return name || customer?.email || fallback;
}

function formatAddress(address) {
  return (
    [
      address?.address_1,
      address?.address_2,
      address?.city,
      formatThaiProvince(address?.state),
      address?.postcode,
    ]
      .filter(Boolean)
      .join(' ') || '-'
  );
}

function ProfileField({ label, name, value, onChange, error, disabled, ...rest }) {
  const { locale } = useLocale();
  return (
    <label className="checkout__field">
      <span className="checkout__field-label">{label}</span>
      <input
        name={name}
        value={value}
        onChange={onChange}
        className={`checkout__input${error ? ' checkout__input--error' : ''}`}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        {...rest}
      />
      {error ? (
        <p className="checkout__field-error" role="alert">
          {translateKnown(locale, error)}
        </p>
      ) : null}
    </label>
  );
}

function ProfileEditor({ customer, onSave, onCancel, canCancel }) {
  const { locale, t } = useLocale();
  const account = t.account;
  const [form, setForm] = useState(() => formFromCustomerProfile(customer));
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const clearErrors = (names) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      for (const name of names) delete next[name];
      return next;
    });
    setError('');
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    clearErrors([name]);
  };

  const handleAddressChange = (fields) => {
    setForm((prev) => ({ ...prev, ...fields }));
    clearErrors(Object.keys(fields));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const candidate = { ...form, email: customer.email };
    const validation = validateCheckoutCustomerForm(candidate);
    if (!validation.ok) {
      setFieldErrors(validation.fieldErrors);
      setError(validation.errors[0] || 'กรุณากรอกข้อมูลให้ครบ');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const { shipping_address } = buildStoreAddressesFromForm(candidate);
      await onSave(shipping_address);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'บันทึกข้อมูลไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="account-profile-form" onSubmit={handleSubmit} noValidate>
      <div className="account-form__row">
        <ProfileField
          label={account.firstName || t.auth.firstName}
          name="firstName"
          value={form.firstName}
          onChange={handleChange}
          error={fieldErrors.firstName}
          disabled={saving}
          autoComplete="given-name"
        />
        <ProfileField
          label={t.auth.lastName}
          name="lastName"
          value={form.lastName}
          onChange={handleChange}
          error={fieldErrors.lastName}
          disabled={saving}
          autoComplete="family-name"
        />
      </div>
      <ProfileField
        label={t.checkout.phone}
        name="phone"
        type="tel"
        value={form.phone}
        onChange={handleChange}
        error={fieldErrors.phone}
        disabled={saving}
        autoComplete="tel"
      />
      <ProfileField
        label={account.addressLine}
        name="addressLine"
        value={form.addressLine}
        onChange={handleChange}
        error={fieldErrors.addressLine}
        disabled={saving}
        autoComplete="address-line1"
      />
      <ThaiAddressSelector
        value={{
          province: form.province,
          district: form.district,
          subdistrict: form.subdistrict,
          street: form.street,
          postalCode: form.postalCode,
        }}
        onChange={handleAddressChange}
        disabled={saving}
        errors={fieldErrors}
      />
      <ProfileField
        label={account.extra}
        name="addressNote"
        value={form.addressNote}
        onChange={handleChange}
        disabled={saving}
        placeholder={account.extraPlaceholder}
      />
      {error ? (
        <p className="account-form__error" role="alert">
          {translateKnown(locale, error)}
        </p>
      ) : null}
      <div className="account-profile-form__actions">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? account.saving : account.save}
        </button>
        {canCancel ? (
          <button
            type="button"
            className="btn-outline"
            onClick={onCancel}
            disabled={saving}
          >
            {account.cancel}
          </button>
        ) : null}
      </div>
    </form>
  );
}

export default function Account() {
  const { locale, t, localize } = useLocale();
  const account = t.account;
  useSeo({ title: account.seoTitle, noindex: true });
  const { ready, isLoggedIn, customer, logout, saveProfile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const setupRequested = searchParams.get('setup') === '1';
  const [editing, setEditing] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState('');

  useEffect(() => {
    if (!ready || !isLoggedIn) return undefined;
    let cancelled = false;

    async function loadOrders() {
      setLoadingOrders(true);
      setOrdersError('');
      try {
        const list = await fetchCustomerOrders();
        if (!cancelled) setOrders(list);
      } catch (err) {
        if (!cancelled) {
          setOrdersError(
            err instanceof Error ? err.message : 'โหลดประวัติคำสั่งซื้อไม่สำเร็จ',
          );
        }
      } finally {
        if (!cancelled) setLoadingOrders(false);
      }
    }

    loadOrders();
    return () => {
      cancelled = true;
    };
  }, [ready, isLoggedIn]);

  if (!ready) {
    return (
      <main className="account-page">
        <div className="container account-page__body">
          <p className="account-page__muted">{account.loading}</p>
        </div>
      </main>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to={localize('/login?next=/account')} replace />;
  }

  const billing = customer.billing || {};
  const shipping = customer.shipping?.address_1 ? customer.shipping : billing;
  const needsSetup = !customer.profile_complete;
  const showEditor = editing || needsSetup || setupRequested;

  const handleSaveProfile = async (address) => {
    await saveProfile(address);
    setEditing(false);
    setSavedMessage('saved');
    if (setupRequested) setSearchParams({}, { replace: true });
  };

  const handleCancelEdit = () => {
    setEditing(false);
    if (setupRequested) setSearchParams({}, { replace: true });
  };

  return (
    <main className="account-page">
      <header className="account-page__hero">
        <div className="container">
          <p className="section-label">{account.label}</p>
          <h1 className="account-page__title">{account.title}</h1>
        </div>
      </header>

      <div className="container account-page__body">
        <section className="account-card">
          <div className="account-card__header">
            <h2 className="account-card__title">{account.profile}</h2>
            <button type="button" className="btn-outline account-card__logout" onClick={logout}>
              {account.logout}
            </button>
          </div>

          {needsSetup ? (
            <p className="account-form__notice" role="status">
              {account.setup}
            </p>
          ) : null}
          {savedMessage && !showEditor ? (
            <p className="account-form__success" role="status">
              {account.saved}
            </p>
          ) : null}

          <dl className="account-meta">
            <div>
              <dt>{account.email}</dt>
              <dd>
                {customer.email || '-'}
                {customer.google_linked ? (
                  <span className="account-meta__badge">{account.googleLinked}</span>
                ) : null}
              </dd>
            </div>
            {!showEditor ? (
              <>
                <div>
                  <dt>{account.name}</dt>
                  <dd>{customerDisplayName(customer, account.customer)}</dd>
                </div>
                <div>
                  <dt>{account.phone}</dt>
                  <dd>{billing.phone || shipping.phone || '-'}</dd>
                </div>
                <div id="account-address" className="account-anchor">
                  <dt>{account.shippingAddress}</dt>
                  <dd>{formatAddress(shipping)}</dd>
                </div>
              </>
            ) : null}
          </dl>

          {showEditor ? (
            <div id="account-address" className="account-anchor">
              <ProfileEditor
                customer={customer}
                onSave={handleSaveProfile}
                onCancel={handleCancelEdit}
                canCancel={!needsSetup}
              />
            </div>
          ) : (
            <div>
              <button
                type="button"
                className="btn-outline"
                onClick={() => {
                  setSavedMessage('');
                  setEditing(true);
                }}
              >
                {account.edit}
              </button>
            </div>
          )}
        </section>

        <section id="account-orders" className="account-card account-anchor">
          <h2 className="account-card__title">{account.orders}</h2>
          {loadingOrders ? (
            <p className="account-page__muted">{account.loadingOrders}</p>
          ) : ordersError ? (
            <p className="account-form__error" role="alert">
              {translateKnown(locale, ordersError)}
            </p>
          ) : orders.length === 0 ? (
            <p className="account-page__muted">
              {account.noOrders}{' '}
              <LocaleLink to="/products">{account.shop}</LocaleLink>
            </p>
          ) : (
            <ul className="account-orders">
              {orders.map((order) => (
                <li key={order.id} className="account-order">
                  <div className="account-order__top">
                    <p className="account-order__number">#{order.number}</p>
                    <p className="account-order__status">
                      {locale === 'en'
                        ? account.status[order.status] || order.status
                        : order.status_label || STATUS_LABELS[order.status] || order.status}
                    </p>
                  </div>
                  <p className="account-order__date">{formatOrderDate(order.date_created, locale)}</p>
                  <p className="account-order__total">
                    {formatMoney(order.total, order.currency)}
                    {order.payment_method_title
                      ? ` · ${order.payment_method_title}`
                      : ''}
                  </p>
                  {order.line_items?.length ? (
                    <ul className="account-order__items">
                      {order.line_items.map((item) => (
                        <li key={item.id}>
                          {localizedProductName(item.product_id, item.name, locale)} × {item.quantity}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {order.tracking?.map((tracking) => (
                    <p
                      key={`${tracking.provider}-${tracking.number}`}
                      className="account-order__tracking"
                    >
                      {account.carrier} {tracking.provider || '-'} · {account.trackingNumber}{' '}
                      <strong>{tracking.number}</strong>
                      {tracking.link ? (
                        <>
                          {' · '}
                          <a href={tracking.link} target="_blank" rel="noopener noreferrer">
                            {account.track}
                          </a>
                        </>
                      ) : null}
                    </p>
                  ))}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
