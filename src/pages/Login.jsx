import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchPasswordResetUrl } from '../api/customerAuth';
import GoogleSignInButton from '../components/GoogleSignInButton';
import './Account.css';

function getRedirectPath(search) {
  const next = new URLSearchParams(search).get('next');
  // Browsers treat "\" like "/" (so "/\evil.com" is off-site); also reject control chars.
  if (next && /^\/(?![/\\])[^\\\s]*$/.test(next)) return next;
  return '/account';
}

function readLinkState(state) {
  const link = state?.googleLink;
  if (!link || typeof link.ticket !== 'string' || !link.ticket) return null;
  return { ticket: link.ticket, email: String(link.email || '') };
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle, isLoggedIn, ready } = useAuth();
  const [googleLink, setGoogleLink] = useState(() => readLinkState(location.state));
  const [form, setForm] = useState(() => ({
    email: readLinkState(location.state)?.email || '',
    password: '',
  }));
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [passwordResetUrl, setPasswordResetUrl] = useState('');

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
        signedIn && !signedIn.profile_complete
          ? '/account?setup=1'
          : getRedirectPath(location.search),
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
        isNew || !customer?.profile_complete
          ? '/account?setup=1'
          : getRedirectPath(location.search),
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

  if (ready && isLoggedIn && !submitting) {
    return <Navigate to={getRedirectPath(location.search)} replace />;
  }

  return (
    <main className="account-page">
      <header className="account-page__hero">
        <div className="container">
          <p className="section-label">บัญชี</p>
          <h1 className="account-page__title">เข้าสู่ระบบ</h1>
        </div>
      </header>

      <div className="container account-page__body">
        <form className="account-form" onSubmit={handleSubmit}>
          {googleLink ? (
            <div className="account-form__notice" role="status">
              <p>
                พบบัญชีเดิมที่ใช้อีเมล <strong>{googleLink.email}</strong>{' '}
                กรุณากรอกรหัสผ่านของบัญชีนี้เพื่อยืนยันตัวตน
                ระบบจะเชื่อมบัญชี Google กับบัญชีเดิมหลังเข้าสู่ระบบสำเร็จ
              </p>
              {passwordResetUrl ? (
                <div className="account-form__steps">
                  <p>จำรหัสผ่านไม่ได้? ทำตามขั้นตอนนี้</p>
                  <ol>
                    <li>
                      กด “ลืมรหัสผ่าน?” ใต้ช่องรหัสผ่าน
                      หน้าตั้งรหัสผ่านของ BAZOOKA จะเปิดในแท็บใหม่
                    </li>
                    <li>
                      กรอกอีเมล <strong>{googleLink.email}</strong>{' '}
                      แล้วเปิดลิงก์ในอีเมลที่ได้รับเพื่อตั้งรหัสผ่านใหม่
                      (หากไม่พบ ให้ตรวจในโฟลเดอร์จดหมายขยะ)
                    </li>
                    <li>
                      กลับมาที่หน้านี้ กรอกรหัสผ่านใหม่
                      แล้วกด “ยืนยันและเชื่อมบัญชี Google”
                      หากระบบแจ้งว่าคำขอหมดอายุ ให้กด “เข้าสู่ระบบด้วย Google” อีกครั้ง
                    </li>
                  </ol>
                  <p>หลังเชื่อมสำเร็จ ครั้งต่อไปกดเข้าสู่ระบบด้วย Google ได้ทันทีโดยไม่ต้องใช้รหัสผ่าน</p>
                </div>
              ) : null}
              <button
                type="button"
                className="account-form__text-button"
                onClick={cancelGoogleLink}
                disabled={submitting}
              >
                ยกเลิกการเชื่อมบัญชี Google
              </button>
            </div>
          ) : (
            <GoogleSignInButton
              context="signin"
              onCredential={handleGoogleCredential}
              disabled={submitting}
              dividerText="หรือเข้าสู่ระบบด้วยอีเมล"
            />
          )}
          <label className="account-form__field">
            <span className="account-form__label">อีเมล</span>
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
            <span className="account-form__label">รหัสผ่าน</span>
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
                ลืมรหัสผ่าน?
                <span className="visually-hidden"> (เปิดในแท็บใหม่)</span>
              </a>
            </p>
          ) : null}
          {error ? (
            <p className="account-form__error" role="alert">
              {error}
            </p>
          ) : null}
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting
              ? 'กำลังเข้าสู่ระบบ...'
              : googleLink
                ? 'ยืนยันและเชื่อมบัญชี Google'
                : 'เข้าสู่ระบบ'}
          </button>
          <p className="account-form__hint">
            ยังไม่มีบัญชี?{' '}
            <Link to="/register">สมัครบัญชี</Link>
          </p>
        </form>
      </div>
    </main>
  );
}
