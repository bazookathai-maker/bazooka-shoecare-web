import { useEffect, useRef, useState } from 'react';
import { fetchGoogleSignInConfig } from '../api/customerAuth';
import './GoogleSignInButton.css';

const GSI_SRC = 'https://accounts.google.com/gsi/client?hl=th';

let gsiPromise = null;

function loadGoogleIdentityServices() {
  if (window.google?.accounts?.id) return Promise.resolve(window.google);
  if (!gsiPromise) {
    gsiPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = GSI_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.google?.accounts?.id) resolve(window.google);
        else reject(new Error('gsi-unavailable'));
      };
      script.onerror = () => {
        gsiPromise = null;
        reject(new Error('gsi-load-failed'));
      };
      document.head.appendChild(script);
    });
  }
  return gsiPromise;
}

/**
 * Official "Sign in with Google" button (GIS, popup mode).
 * Each attempt uses a fresh server nonce, so after every callback the button
 * re-initializes before it can be used again.
 */
export default function GoogleSignInButton({
  context = 'signin',
  onCredential,
  disabled = false,
  dividerText = 'หรือใช้อีเมล',
}) {
  const containerRef = useRef(null);
  const onCredentialRef = useRef(onCredential);
  const [status, setStatus] = useState('loading');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    onCredentialRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    let cancelled = false;

    async function setup() {
      try {
        const config = await fetchGoogleSignInConfig();
        if (cancelled) return;
        if (!config.enabled) {
          setStatus('disabled');
          return;
        }

        const google = await loadGoogleIdentityServices();
        const container = containerRef.current;
        if (cancelled || !container) return;

        google.accounts.id.initialize({
          client_id: config.clientId,
          nonce: config.nonce,
          ux_mode: 'popup',
          context,
          auto_select: false,
          cancel_on_tap_outside: true,
          callback: async (response) => {
            try {
              await onCredentialRef.current?.(response?.credential || '');
            } finally {
              if (!cancelled) {
                setStatus('loading');
                setAttempt((n) => n + 1);
              }
            }
          },
        });

        container.innerHTML = '';
        const width = Math.min(
          400,
          Math.max(220, Math.floor(container.offsetWidth || 320)),
        );
        google.accounts.id.renderButton(container, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          text: context === 'signup' ? 'signup_with' : 'signin_with',
          logo_alignment: 'center',
          locale: 'th',
          width,
        });
        setStatus('ready');
      } catch {
        if (!cancelled) setStatus('error');
      }
    }

    setup();
    return () => {
      cancelled = true;
    };
  }, [context, attempt]);

  if (status === 'disabled') {
    if (!import.meta.env.DEV) return null;
    return (
      <p className="google-signin__note">
        ยังไม่ได้ตั้งค่า GOOGLE_CLIENT_ID — ปุ่มเข้าสู่ระบบด้วย Google จะแสดงเมื่อตั้งค่าแล้ว
      </p>
    );
  }

  return (
    <div className="google-signin">
      <div
        ref={containerRef}
        className={`google-signin__button${
          disabled ? ' google-signin__button--disabled' : ''
        }`}
        aria-busy={status === 'loading'}
      />
      {status === 'loading' ? (
        <p className="google-signin__note">กำลังโหลดปุ่มเข้าสู่ระบบด้วย Google...</p>
      ) : null}
      {status === 'error' ? (
        <p className="google-signin__note" role="alert">
          โหลดปุ่มเข้าสู่ระบบด้วย Google ไม่สำเร็จ กรุณารีเฟรชหน้าแล้วลองใหม่
        </p>
      ) : null}
      <div className="google-signin__divider" role="separator">
        <span>{dividerText}</span>
      </div>
    </div>
  );
}
