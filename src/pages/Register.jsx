import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LocaleLink from '../components/LocaleLink';
import { useLocale } from '../i18n/LocaleContext';
import { translateKnown } from '../i18n/knownMessages';
import { useAuth } from '../context/AuthContext';
import GoogleSignInButton from '../components/GoogleSignInButton';
import { CHECKOUT_PATH, loginPath, readNextPath } from '../utils/authRedirect';
import useSeo from '../hooks/useSeo';
import './Account.css';

export default function Register() {
  const { locale, t, localize } = useLocale();
  const auth = t.auth;
  useSeo({ title: auth.registerTitle, noindex: true });
  const navigate = useNavigate();
  const location = useLocation();
  const nextPath = readNextPath(location.search);
  const continueTo = nextPath && nextPath !== '/account' ? nextPath : null;
  const { register, loginWithGoogle } = useAuth();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await register(form);
      navigate(localize(continueTo || '/account?setup=1'), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'สมัครบัญชีไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleCredential = async (credential) => {
    if (!credential) {
      setError('สมัครด้วย Google ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const { customer, isNew } = await loginWithGoogle(credential);
      navigate(
        localize(continueTo ||
          (isNew || !customer?.profile_complete ? '/account?setup=1' : '/account')),
        { replace: true },
      );
    } catch (err) {
      if (err?.code === 'google_link_required' && err.linkTicket) {
        navigate(localize(loginPath(nextPath)), {
          replace: true,
          state: { googleLink: { ticket: err.linkTicket, email: err.email || '' } },
        });
        return;
      }
      setError(err instanceof Error ? err.message : 'สมัครด้วย Google ไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="account-page">
      <header className="account-page__hero">
        <div className="container">
          <p className="section-label">{auth.label}</p>
          <h1 className="account-page__title">{auth.registerTitle}</h1>
        </div>
      </header>

      <div className="container account-page__body">
        <form className="account-form" onSubmit={handleSubmit}>
          {nextPath === CHECKOUT_PATH ? (
            <p className="account-form__notice" role="status">
              {auth.registerCheckout}
            </p>
          ) : null}
          <GoogleSignInButton
            context="signup"
            onCredential={handleGoogleCredential}
            disabled={submitting}
            dividerText={auth.signupDivider}
          />
          <div className="account-form__row">
            <label className="account-form__field">
              <span className="account-form__label">{auth.firstName}</span>
              <input
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                className="account-form__input"
                autoComplete="given-name"
              />
            </label>
            <label className="account-form__field">
              <span className="account-form__label">{auth.lastName}</span>
              <input
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                className="account-form__input"
                autoComplete="family-name"
              />
            </label>
          </div>
          <label className="account-form__field">
            <span className="account-form__label">{auth.email}</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="account-form__input"
              autoComplete="email"
              required
            />
          </label>
          <label className="account-form__field">
            <span className="account-form__label">{auth.password}</span>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="account-form__input"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>
          {error ? (
            <p className="account-form__error" role="alert">
              {translateKnown(locale, error)}
            </p>
          ) : null}
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? auth.registering : auth.createAccount}
          </button>
          <p className="account-form__hint">
            {auth.hasAccount}{' '}
            <LocaleLink to={loginPath(nextPath)}>{auth.signIn}</LocaleLink>
          </p>
        </form>
      </div>
    </main>
  );
}
