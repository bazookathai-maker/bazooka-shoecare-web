import {
  getArticleRelatedContent,
  getFaqRelatedArticles,
  getProductRelatedArticles,
  getIntentRelatedArticles,
  getReviewRelatedProduct,
} from '../data/knowledgeHub';
import { useLocale } from '../i18n/LocaleContext';
import { displayHubLabel } from '../i18n/localizeGuide';
import LocaleLink from './LocaleLink';
import './HubRelatedContent.css';

function HubLinkList({ title, links }) {
  const { locale, t } = useLocale();
  if (!links?.length) return null;

  return (
    <div className="hub-links">
      {title ? <p className="hub-links__title">{title}</p> : null}
      <ul className="hub-links__list">
        {links.map((link) => (
          <li key={link.href}>
            <LocaleLink to={link.href} className="hub-links__card">
              <span className="hub-links__card-text">{displayHubLabel(link, locale, t)}</span>
              <span className="hub-links__card-arrow" aria-hidden="true">
                ›
              </span>
            </LocaleLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ArticleRelatedHub({ articleId }) {
  const { t } = useLocale();
  const content = getArticleRelatedContent(articleId);
  const hasContent =
    content.faqs.length || content.articles.length || content.products.length;

  if (!hasContent) return null;

  return (
    <aside className="hub-links-group hub-links-group--article">
      <p className="hub-links-group__heading">{t.journal.relatedHeading}</p>
      <HubLinkList title={t.journal.relatedFaq} links={content.faqs} />
      <HubLinkList title={t.journal.relatedArticles} links={content.articles} />
      <HubLinkList title={t.journal.recommendedProducts} links={content.products} />
    </aside>
  );
}

export function FaqRelatedArticles({ faqId }) {
  const { locale, t } = useLocale();
  const links = getFaqRelatedArticles(faqId);
  if (!links.length) return null;

  return (
    <div className="hub-links hub-links--faq">
      <p className="hub-links__title">{t.journal.readRelated}</p>
      <ul className="hub-links__list">
        {links.map((link) => (
          <li key={link.href}>
            <LocaleLink to={link.href} className="hub-links__card hub-links__card--compact">
              <span className="hub-links__card-text">{displayHubLabel(link, locale, t)}</span>
              <span className="hub-links__card-arrow" aria-hidden="true">
                ›
              </span>
            </LocaleLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ArticleTopicRelated({ slug }) {
  const { locale, t } = useLocale();
  const links = getIntentRelatedArticles(slug);
  if (!links.length) return null;

  return (
    <aside className="hub-links-group hub-links-group--article-topic">
      <p className="hub-links-group__heading">{t.journal.relatedArticles}</p>
      <ul className="hub-links__list">
        {links.map((link) => (
          <li key={link.href}>
            <LocaleLink to={link.href} className="hub-links__card">
              <span className="hub-links__card-text">{displayHubLabel(link, locale, t)}</span>
              <span className="hub-links__card-arrow" aria-hidden="true">
                ›
              </span>
            </LocaleLink>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export function ProductRelatedArticles({ slug }) {
  const { t } = useLocale();
  const links = getProductRelatedArticles(slug);
  if (!links.length) return null;

  return (
    <section className="hub-links-group hub-links-group--product">
      <header className="hub-links-group__header">
        <p className="section-label">{t.journal.knowledge}</p>
        <h2 className="hub-links-group__title">{t.journal.relatedArticles}</h2>
      </header>
      <HubLinkList links={links} />
    </section>
  );
}

export function ReviewProductLink({ reviewId }) {
  const { locale, t } = useLocale();
  const product = getReviewRelatedProduct(reviewId);
  if (!product) return null;

  return (
    <div className="hub-links hub-links--review">
      <LocaleLink to={product.href} className="hub-links__card hub-links__card--review">
        <span className="hub-links__review-label">{t.journal.relatedProducts}</span>
        <span className="hub-links__card-text">{displayHubLabel(product, locale, t)}</span>
        <span className="hub-links__card-arrow" aria-hidden="true">
          ›
        </span>
      </LocaleLink>
    </div>
  );
}
