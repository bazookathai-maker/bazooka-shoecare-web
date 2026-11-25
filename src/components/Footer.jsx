import { STORE_POLICIES } from '../data/storePolicies';
import { useLocale } from '../i18n/LocaleContext';
import LocaleLink from './LocaleLink';
import './Footer.css';

const policyLabel = {
  shippingPolicy: 'shipping',
  returnPolicy: 'returns',
};

export default function Footer() {
  const { t } = useLocale();

  return (
    <footer id="contact" className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <span className="footer__logo">BAZOOKA</span>
          <p className="footer__tagline">{t.footer.tagline}</p>
        </div>

        <nav className="footer__nav">
          <LocaleLink to="/" className="footer__link">
            {t.nav.home}
          </LocaleLink>
          <LocaleLink to="/products" className="footer__link">
            {t.nav.products}
          </LocaleLink>
          <LocaleLink to="/recommended" className="footer__link">
            {t.footer.recommended}
          </LocaleLink>
          <LocaleLink to="/articles" className="footer__link">
            {t.nav.articles}
          </LocaleLink>
          <LocaleLink to="/reviews" className="footer__link">
            {t.nav.reviews}
          </LocaleLink>
          <LocaleLink to="/account" className="footer__link">
            {t.header.account}
          </LocaleLink>
          <LocaleLink to="/track-order" className="footer__link">
            {t.nav.trackOrder}
          </LocaleLink>
          <LocaleLink to="/contact" className="footer__link">
            {t.nav.contact}
          </LocaleLink>
          {STORE_POLICIES.map((policy) => (
            <LocaleLink key={policy.key} to={policy.path} className="footer__link">
              {t.footer[policyLabel[policy.key]] || policy.title}
            </LocaleLink>
          ))}
        </nav>

        <p className="footer__copy">
          &copy; {new Date().getFullYear()} BAZOOKA {t.footer.rights}
        </p>
      </div>
    </footer>
  );
}
