import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Account.css';

function getRedirectPath(search) {
  const next = new URLSearchParams(search).get('next');
  if (next && next.startsWith('/') && !next.startsWith('//')) return next;
  return '/account';
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoggedIn, ready } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
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
      await login(form);
      navigate(getRedirectPath(location.search), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เข้าสู่ระบบไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  };

  if (ready && isLoggedIn) {
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
          <label className="account-form__field">
            <span className="account-form__label">อีเมล</span>
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
          {error ? (
            <p className="account-form__error" role="alert">
              {error}
            </p>
          ) : null}
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
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
