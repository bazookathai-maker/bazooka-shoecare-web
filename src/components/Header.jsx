import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import SearchOverlay from './SearchOverlay';
import MiniCart from './MiniCart';
import './Header.css';

const navLinks = [
  { to: '/', label: 'หน้าแรก' },
  { to: '/products', label: 'สินค้า' },
  { to: '/articles', label: 'บทความ' },
  { to: '/reviews', label: 'รีวิว' },
  { to: '/faq', label: 'FAQ' },
  { to: '/track-order', label: 'ติดตามคำสั่งซื้อ' },
  { to: '/contact', label: 'ติดต่อเรา' },
];

function isActive(pathname, to) {
  if (to === '/') return pathname === '/';
  return pathname === to || pathname.startsWith(`${to}/`);
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

function getHeroScrollThreshold() {
  const hero = document.querySelector('.hero');
  if (!hero) return 0;
  return Math.max(hero.offsetHeight - 80, 0);
}

export default function Header() {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [pastHero, setPastHero] = useState(pathname !== '/');
  const { count, isBouncing, cartIconRef } = useCart();
  const isHome = pathname === '/';

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
    setPastHero(pathname !== '/');
  }, [pathname]);

  const closeMenu = () => setMenuOpen(false);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const closeCart = useCallback(() => setCartOpen(false), []);
  const openSearch = () => {
    setMenuOpen(false);
    setCartOpen(false);
    setSearchOpen(true);
  };
  const openCart = () => {
    setMenuOpen(false);
    setSearchOpen(false);
    setCartOpen(true);
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
          <Link to="/" className="header__logo" onClick={closeMenu}>
            BAZOOKA
          </Link>

          <div className="header__end">
            <nav className={`header__nav ${menuOpen ? 'header__nav--open' : ''}`}>
              {navLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`header__link ${isActive(pathname, to) ? 'header__link--active' : ''}`}
                  onClick={closeMenu}
                >
                  {label}
                </Link>
              ))}
            </nav>

            <div className="header__actions">
              <button
                type="button"
                className="header__search"
                aria-label="ค้นหา"
                aria-expanded={searchOpen}
                onClick={openSearch}
              >
                <SearchIcon />
              </button>

              <button
                type="button"
                ref={cartIconRef}
                className={`header__cart ${isBouncing ? 'header__cart--bounce' : ''}`}
                aria-label={`ตะกร้าสินค้า ${count} ชิ้น`}
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
                aria-label={menuOpen ? 'ปิดเมนู' : 'เปิดเมนู'}
                onClick={() => setMenuOpen((open) => !open)}
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
