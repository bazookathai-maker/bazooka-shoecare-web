import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Account.css';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
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
      navigate('/account', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'สมัครบัญชีไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="account-page">
      <header className="account-page__hero">
        <div className="container">
          <p className="section-label">บัญชี</p>
          <h1 className="account-page__title">สมัครบัญชี</h1>
        </div>
      </header>

      <div className="container account-page__body">
        <form className="account-form" onSubmit={handleSubmit}>
          <div className="account-form__row">
            <label className="account-form__field">
              <span className="account-form__label">ชื่อ</span>
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
              <span className="account-form__label">นามสกุล</span>
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
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>
          {error ? (
            <p className="account-form__error" role="alert">
              {error}
            </p>
          ) : null}
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'กำลังสมัคร...' : 'สมัครบัญชี'}
          </button>
          <p className="account-form__hint">
            มีบัญชีอยู่แล้ว?{' '}
            <Link to="/login">เข้าสู่ระบบ</Link>
          </p>
        </form>
      </div>
    </main>
  );
}
