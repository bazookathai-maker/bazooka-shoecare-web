import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../i18n/LocaleContext';
import { stripLocale } from '../i18n/locale';
import SearchOverlay from './SearchOverlay';
import MiniCart from './MiniCart';
import LanguageSwitcher from './LanguageSwitcher';
import LocaleLink from './LocaleLink';
import logoBlackUrl from '../assets/bazooka-logo-black.png';
import logoWhiteUrl from '../assets/bazooka-logo-white.png';
import './Header.css';

const navLinks = [
  { to: '/', key: 'home' },
  { to: '/products', key: 'products' },
  { to: '/articles', key: 'articles' },
  { to: '/reviews', key: 'reviews' },
  { to: '/faq', key: 'faq' },
  { to: '/track-order', key: 'trackOrder' },
  { to: '/contact', key: 'contact' },
];

function isActive(pathname, to) {
  const current = stripLocale(pathname);
  if (to === '/') return current === '/';
  return current === to || current.startsWith(`${to}/`);
}

function CartIcon() {
  return (
    <svg
      className="header__cart-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      aria-hidden="true"
    >
      <path
        d="M6 6h15l-1.5 9h-11L6 6z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M6 6L5 3H2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9.5" cy="19.5" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="16.5" cy="19.5" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      className="header__search-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="6.25" />
      <path d="M16 16l4 4" strokeLinecap="round" />
    </svg>
  );
}

function AccountIcon() {
  return (
    <svg
      className="header__account-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="3.25" />
      <path
        d="M5.5 19.25c.85-3.1 3.3-5 6.5-5s5.65 1.9 6.5 5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg
      className="header__account-chevron"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      aria-hidden="true"
    >
      <path d="M3 4.5l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function customerDisplayName(customer, fallback) {
  const name = [customer?.first_name, customer?.last_name].filter(Boolean).join(' ').trim();
  return name || customer?.email || fallback;
}

function getHeroScrollThreshold() {
  const hero = document.querySelector('.hero');
  if (!hero) return 0;
  return Math.max(hero.offsetHeight - 80, 0);
}

export default function Header() {
  const { pathname } = useLocation();
  const { t } = useLocale();
  const barePath = stripLocale(pathname);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [pastHero, setPastHero] = useState(barePath !== '/');
  const { count, isBouncing, cartIconRef } = useCart();
  const { isLoggedIn, ready: authReady, customer, logout } = useAuth();
  const [accountOpen, setAccountOpen] = useState(false);
  const accountMenuRef = useRef(null);
  const accountButtonRef = useRef(null);
  const isHome = barePath === '/';
  const accountLabel = !authReady
    ? t.header.accountPending
    : isLoggedIn
      ? t.header.account
      : t.header.login;

  const updateScrollState = useCallback(() => {
    if (!isHome) {
      setPastHero(true);
      return;
    }
    setPastHero(window.scrollY > getHeroScrollThreshold());
  }, [isHome]);

  useEffect(() => {
    updateScrollState();
    window.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState, { passive: true });
    return () => {
      window.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [updateScrollState]);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setCartOpen(false);
    setAccountOpen(false);
    setPastHero(stripLocale(pathname) !== '/');
  }, [pathname]);

  useEffect(() => {
    if (!accountOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!accountMenuRef.current?.contains(event.target)) setAccountOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      setAccountOpen(false);
      accountButtonRef.current?.focus();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [accountOpen]);

  const closeMenu = () => setMenuOpen(false);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const closeCart = useCallback(() => setCartOpen(false), []);
  const closeAccount = () => setAccountOpen(false);
  const openSearch = () => {
    setMenuOpen(false);
    setCartOpen(false);
    setAccountOpen(false);
    setSearchOpen(true);
  };
  const openCart = () => {
    setMenuOpen(false);
    setSearchOpen(false);
    setAccountOpen(false);
    setCartOpen(true);
  };
  const toggleAccount = () => {
    setMenuOpen(false);
    setSearchOpen(false);
    setCartOpen(false);
    setAccountOpen((open) => !open);
  };
  const handleAccountBlur = (event) => {
    // Safari doesn't focus clicked buttons, so a null relatedTarget is left to the pointerdown handler.
    if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) {
      setAccountOpen(false);
    }
  };
  const handleLogout = () => {
    setAccountOpen(false);
    logout();
  };
  const useHeroOverlay = isHome && !pastHero && !menuOpen && !searchOpen && !cartOpen;

  return (
    <>
      <header
        className={[
          'header',
          useHeroOverlay ? 'header--overlay' : 'header--solid',
          menuOpen ? 'header--open' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className="container header__inner">
          <LocaleLink to="/" className="header__logo" onClick={closeMenu}>
            <img
              className="header__logo-img header__logo-img--dark"
              src={logoBlackUrl}
              alt="BAZOOKA"
              width="751"
              height="200"
              decoding="async"
            />
            <img
              className="header__logo-img header__logo-img--light"
              src={logoWhiteUrl}
              alt="BAZOOKA"
              width="751"
              height="200"
              decoding="async"
            />
            </LocaleLink>

          <div className="header__end">
            <nav className={`header__nav ${menuOpen ? 'header__nav--open' : ''}`}>
              {navLinks.map(({ to, key }) => (
                <LocaleLink
                  key={to}
                  to={to}
                  className={`header__link ${isActive(pathname, to) ? 'header__link--active' : ''}`}
                  onClick={closeMenu}
                >
                  {t.nav[key]}
                </LocaleLink>
              ))}
            </nav>

            <div className="header__actions">
              <LanguageSwitcher />
              <button
                type="button"
                className="header__search"
                aria-label={t.header.search}
                aria-expanded={searchOpen}
                onClick={openSearch}
              >
                <SearchIcon />
              </button>

              <div className="header__account-menu" ref={accountMenuRef} onBlur={handleAccountBlur}>
                <button
                  type="button"
                  ref={accountButtonRef}
                  className={`header__account ${
                    isActive(pathname, '/account') ||
                    isActive(pathname, '/login') ||
                    isActive(pathname, '/register')
                      ? 'header__account--active'
                      : ''
                  } ${authReady ? '' : 'header__account--pending'}`}
                  aria-label={accountLabel}
                  aria-busy={!authReady || undefined}
                  aria-expanded={accountOpen}
                  aria-controls="header-account-panel"
                  onClick={toggleAccount}
                >
                  <AccountIcon />
                  {/* Both labels share one grid cell so the width never changes while auth loads. */}
                  <span className="header__account-text" aria-hidden="true">
                    <span
                      className={
                        authReady && !isLoggedIn ? 'header__account-label--shown' : undefined
                      }
                    >
                      {t.header.login}
                    </span>
                    <span
                      className={
                        authReady && isLoggedIn ? 'header__account-label--shown' : undefined
                      }
                    >
                      {t.header.account}
                    </span>
                  </span>
                  <ChevronIcon />
                </button>

                <div
                  id="header-account-panel"
                  className="header__account-panel"
                  hidden={!accountOpen}
                >
                  {!authReady ? (
                    <p className="header__account-note" role="status">
                      {t.header.checking}
                    </p>
                  ) : isLoggedIn ? (
                    <>
                      <p className="header__account-name">{customerDisplayName(customer, t.header.customer)}</p>
                      <ul className="header__account-list">
                        <li>
                          <LocaleLink to="/account" className="header__account-item" onClick={closeAccount}>
                            {t.header.account}
                          </LocaleLink>
                        </li>
                        <li>
                          <LocaleLink
                            to="/account#account-address"
                            className="header__account-item"
                            onClick={closeAccount}
                          >
                            {t.header.addresses}
                          </LocaleLink>
                        </li>
                        <li>
                          <LocaleLink
                            to="/account#account-orders"
                            className="header__account-item"
                            onClick={closeAccount}
                          >
                            {t.header.orders}
                          </LocaleLink>
                        </li>
                      </ul>
                      <button
                        type="button"
                        className="header__account-item header__account-logout"
                        onClick={handleLogout}
                      >
                        {t.header.logout}
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="header__account-note">{t.header.loginNote}</p>
                      <LocaleLink
                        to="/login"
                        className="btn-primary header__account-login"
                        onClick={closeAccount}
                      >
                        {t.header.login}
                      </LocaleLink>
                      <LocaleLink
                        to="/register"
                        className="header__account-item header__account-register"
                        onClick={closeAccount}
                      >
                        {t.header.register}
                      </LocaleLink>
                    </>
                  )}
                </div>
              </div>

              <button
                type="button"
                ref={cartIconRef}
                className={`header__cart ${isBouncing ? 'header__cart--bounce' : ''}`}
                aria-label={t.header.cart(count)}
                aria-expanded={cartOpen}
                onClick={() => {
                  closeMenu();
                  openCart();
                }}
              >
                <CartIcon />
                {count > 0 && (
                  <span className="header__cart-badge" aria-hidden="true">
                    {count > 99 ? '99+' : count}
                  </span>
                )}
              </button>

              <button
                type="button"
                className="header__toggle"
                aria-expanded={menuOpen}
                aria-label={menuOpen ? t.header.closeMenu : t.header.openMenu}
                onClick={() => {
                  setAccountOpen(false);
                  setMenuOpen((open) => !open);
                }}
              >
                <span className="header__toggle-bar" />
                <span className="header__toggle-bar" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <SearchOverlay open={searchOpen} onClose={closeSearch} />
      <MiniCart open={cartOpen} onClose={closeCart} />
    </>
  );
}
