import ScrollReveal from '../components/ScrollReveal';
import LocaleLink from '../components/LocaleLink';
import { useLocale } from '../i18n/LocaleContext';
import useSeo from '../hooks/useSeo';
import { STORE_POLICIES } from '../data/storePolicies';
import { INDEX_ENGLISH, PAGE_SEO, buildStorePoliciesJsonLd } from '../utils/seo';
import './StorePolicy.css';

export default function StorePolicy({ policy }) {
  const { locale, t } = useLocale();
  const overlay = locale === 'en'
    ? (policy.key === 'shippingPolicy' ? t.policy.shipping : t.policy.returns)
    : null;
  const view = overlay
    ? { ...policy, title: overlay.title, sections: overlay.sections }
    : policy;
  useSeo(
    locale === 'en'
      ? {
          title: overlay.title,
          description: overlay.description,
          path: `/en${policy.path}`,
          noindex: !INDEX_ENGLISH,
          jsonLd: buildStorePoliciesJsonLd('en'),
        }
      : { ...PAGE_SEO[policy.key], jsonLd: buildStorePoliciesJsonLd('th') },
  );
  const otherPolicies = STORE_POLICIES.filter((item) => item.key !== policy.key);

  return (
    <main className="policy-page">
      <header className="policy-page__hero">
        <div className="container">
          <ScrollReveal className="policy-page__hero-inner">
            <h1 className="policy-page__title">{view.title}</h1>
          </ScrollReveal>
        </div>
      </header>

      <section className="policy-page__content" aria-label={view.title}>
        <div className="policy-page__shell">
          {view.sections.map((section) => (
            <div key={section.heading} className="policy-page__section">
              <h2 className="policy-page__heading">{section.heading}</h2>
              <ul className="policy-page__list">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}

          {policy.contacts ? (
            <div className="policy-page__section">
              <h2 className="policy-page__heading">{t.policy.contact}</h2>
              <ul className="policy-page__list">
                {policy.contacts.map((item) => (
                  <li key={item.id}>
                    {item.id === 'email' ? t.policy.email : item.label}{' '}
                    <a
                      href={item.href}
                      className="policy-page__link"
                      {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    >
                      {item.value}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <p className="policy-page__related">
            {otherPolicies.map((item) => (
              <LocaleLink key={item.key} to={item.path} className="policy-page__link">
                {item.key === 'shippingPolicy' ? t.policy.shipping.title : t.policy.returns.title}
              </LocaleLink>
            ))}
          </p>
        </div>
      </section>
    </main>
  );
}
