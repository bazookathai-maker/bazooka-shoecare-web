import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import LocaleLink from '../components/LocaleLink';
import { useLocale } from '../i18n/LocaleContext';
import { translateKnown } from '../i18n/knownMessages';
import { useAuth } from '../context/AuthContext';
import { fetchPasswordResetUrl } from '../api/customerAuth';
import GoogleSignInButton from '../components/GoogleSignInButton';
import { CHECKOUT_PATH, readNextPath, registerPath } from '../utils/authRedirect';
import useSeo from '../hooks/useSeo';
import './Account.css';

/** An explicit `next` (e.g. checkout) wins over profile setup; setup still happens at checkout. */
function afterSignInPath(search, profileComplete) {
  const next = readNextPath(search);
  if (next && next !== '/account') return next;
  return profileComplete ? '/account' : '/account?setup=1';
}

function readLinkState(state) {
  const link = state?.googleLink;
  if (!link || typeof link.ticket !== 'string' || !link.ticket) return null;
  return { ticket: link.ticket, email: String(link.email || '') };
}

export default function Login() {
  const { locale, t, localize } = useLocale();
  const auth = t.auth;
  useSeo({ title: auth.loginTitle, noindex: true });
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle, logout, isLoggedIn, ready } = useAuth();
  const nextPath = readNextPath(location.search);
  const sessionExpired = location.state?.reason === 'session_expired';
  const [googleLink, setGoogleLink] = useState(() => readLinkState(location.state));
  const [form, setForm] = useState(() => ({
    email: readLinkState(location.state)?.email || '',
    password: '',
  }));
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [passwordResetUrl, setPasswordResetUrl] = useState('');

  useEffect(() => {
    if (sessionExpired) logout();
  }, [sessionExpired, logout]);

  useEffect(() => {
    let cancelled = false;
    fetchPasswordResetUrl().then((url) => {
      if (!cancelled) setPasswordResetUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, []);

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
      const signedIn = await login({
        email: form.email,
        password: form.password,
        googleLinkTicket: googleLink?.ticket,
      });
      navigate(
        localize(afterSignInPath(location.search, Boolean(signedIn?.profile_complete))),
        { replace: true },
      );
    } catch (err) {
      if (err?.code === 'google_link_expired') {
        setGoogleLink(null);
        setForm((prev) => ({ ...prev, password: '' }));
      }
      setError(err instanceof Error ? err.message : 'เข้าสู่ระบบไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleCredential = async (credential) => {
    if (!credential) {
      setError('เข้าสู่ระบบด้วย Google ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const { customer, isNew } = await loginWithGoogle(credential);
      navigate(
        localize(afterSignInPath(
          location.search,
          !isNew && Boolean(customer?.profile_complete),
        )),
        { replace: true },
      );
    } catch (err) {
      if (err?.code === 'google_link_required' && err.linkTicket) {
        setGoogleLink({ ticket: err.linkTicket, email: err.email || '' });
        setForm({ email: err.email || '', password: '' });
        return;
      }
      setError(
        err instanceof Error ? err.message : 'เข้าสู่ระบบด้วย Google ไม่สำเร็จ',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const cancelGoogleLink = () => {
    setGoogleLink(null);
    setForm({ email: '', password: '' });
    setError('');
  };

  if (ready && isLoggedIn && !submitting && !sessionExpired) {
    return <Navigate to={localize(nextPath || '/account')} replace />;
  }

  return (
    <main className="account-page">
      <header className="account-page__hero">
        <div className="container">
          <p className="section-label">{auth.label}</p>
          <h1 className="account-page__title">{auth.loginTitle}</h1>
        </div>
      </header>

      <div className="container account-page__body">
        <form className="account-form" onSubmit={handleSubmit}>
          {sessionExpired ? (
            <p className="account-form__notice" role="status">
              {auth.sessionExpired}
            </p>
          ) : nextPath === CHECKOUT_PATH ? (
            <p className="account-form__notice" role="status">
              {auth.checkoutNotice}
            </p>
          ) : null}
          {googleLink ? (
            <div className="account-form__notice" role="status">
              <p>
                {auth.linkIntro(googleLink.email)}
              </p>
              {passwordResetUrl ? (
                <div className="account-form__steps">
                  <p>{auth.forgotStepsTitle}</p>
                  <ol>
                    <li>
                      {auth.forgotStep1}
                    </li>
                    <li>
                      {auth.forgotStep2} <strong>{googleLink.email}</strong>
                    </li>
                    <li>
                      {auth.forgotStep3}
                    </li>
                  </ol>
                  <p>{auth.forgotAfter}</p>
                </div>
              ) : null}
              <button
                type="button"
                className="account-form__text-button"
                onClick={cancelGoogleLink}
                disabled={submitting}
              >
                {auth.cancelLink}
              </button>
            </div>
          ) : (
            <GoogleSignInButton
              context="signin"
              onCredential={handleGoogleCredential}
              disabled={submitting}
              dividerText={auth.emailDivider}
            />
          )}
          <label className="account-form__field">
            <span className="account-form__label">{auth.email}</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="account-form__input"
              autoComplete="email"
              readOnly={Boolean(googleLink)}
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
              autoComplete="current-password"
              required
            />
          </label>
          {passwordResetUrl ? (
            <p className="account-form__forgot">
              <a href={passwordResetUrl} target="_blank" rel="noopener noreferrer">
                {auth.forgot}
                <span className="visually-hidden">{auth.forgotNewTab}</span>
              </a>
            </p>
          ) : null}
          {error ? (
            <p className="account-form__error" role="alert">
              {translateKnown(locale, error)}
            </p>
          ) : null}
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting
              ? auth.signingIn
              : googleLink
                ? auth.confirmGoogle
                : auth.signIn}
          </button>
          <p className="account-form__hint">
            {auth.noAccount}{' '}
            <LocaleLink to={registerPath(nextPath)}>{auth.createAccount}</LocaleLink>
          </p>
        </form>
      </div>
    </main>
  );
}
