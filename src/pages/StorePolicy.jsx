import { Link } from 'react-router-dom';
import ScrollReveal from '../components/ScrollReveal';
import useSeo from '../hooks/useSeo';
import { STORE_POLICIES } from '../data/storePolicies';
import { PAGE_SEO, buildStorePoliciesJsonLd } from '../utils/seo';
import './StorePolicy.css';

export default function StorePolicy({ policy }) {
  useSeo({ ...PAGE_SEO[policy.key], jsonLd: buildStorePoliciesJsonLd() });
  const otherPolicies = STORE_POLICIES.filter((item) => item.key !== policy.key);

  return (
    <main className="policy-page">
      <header className="policy-page__hero">
        <div className="container">
          <ScrollReveal className="policy-page__hero-inner">
            <h1 className="policy-page__title">{policy.title}</h1>
          </ScrollReveal>
        </div>
      </header>

      <section className="policy-page__content" aria-label={policy.title}>
        <div className="policy-page__shell">
          {policy.sections.map((section) => (
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
              <h2 className="policy-page__heading">ช่องทางติดต่อ</h2>
              <ul className="policy-page__list">
                {policy.contacts.map((item) => (
                  <li key={item.id}>
                    {item.label}{' '}
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
              <Link key={item.key} to={item.path} className="policy-page__link">
                {item.title}
              </Link>
            ))}
          </p>
        </div>
      </section>
    </main>
  );
}
