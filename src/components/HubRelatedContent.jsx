import { Link } from 'react-router-dom';
import {
  getArticleRelatedContent,
  getFaqRelatedArticles,
  getProductRelatedArticles,
  getReviewRelatedProduct,
  getTopicRelatedArticles,
} from '../data/knowledgeHub';
import './HubRelatedContent.css';

function HubLinkList({ title, links }) {
  if (!links?.length) return null;

  return (
    <div className="hub-links">
      {title ? <p className="hub-links__title">{title}</p> : null}
      <ul className="hub-links__list">
        {links.map((link) => (
          <li key={link.href}>
            <Link to={link.href} className="hub-links__card">
              <span className="hub-links__card-text">{link.label}</span>
              <span className="hub-links__card-arrow" aria-hidden="true">
                ›
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ArticleRelatedHub({ articleId }) {
  const content = getArticleRelatedContent(articleId);
  const hasContent =
    content.faqs.length || content.articles.length || content.products.length;

  if (!hasContent) return null;

  return (
    <aside className="hub-links-group hub-links-group--article">
      <p className="hub-links-group__heading">เนื้อหาที่เกี่ยวข้อง</p>
      <HubLinkList title="คำถามที่พบบ่อย" links={content.faqs} />
      <HubLinkList title="บทความที่เกี่ยวข้อง" links={content.articles} />
      <HubLinkList title="สินค้าแนะนำ" links={content.products} />
    </aside>
  );
}

export function FaqRelatedArticles({ faqId }) {
  const links = getFaqRelatedArticles(faqId);
  if (!links.length) return null;

  return (
    <div className="hub-links hub-links--faq">
      <p className="hub-links__title">อ่านบทความที่เกี่ยวข้อง</p>
      <ul className="hub-links__list">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              to={link.href}
              className="hub-links__card hub-links__card--compact"
            >
              <span className="hub-links__card-text">{link.label}</span>
              <span className="hub-links__card-arrow" aria-hidden="true">
                ›
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ArticleTopicRelated({ slug, faqId }) {
  const links = getTopicRelatedArticles(slug, faqId);
  if (!links.length) return null;

  return (
    <aside className="hub-links-group hub-links-group--article-topic">
      <p className="hub-links-group__heading">เนื้อหาเพิ่มเติมในหัวข้อนี้</p>
      <ul className="hub-links__list">
        {links.map((link) => (
          <li key={link.href}>
            <Link to={link.href} className="hub-links__card">
              <span className="hub-links__card-text">{link.label}</span>
              <span className="hub-links__card-arrow" aria-hidden="true">
                ›
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export function ProductRelatedArticles({ slug }) {
  const links = getProductRelatedArticles(slug);
  if (!links.length) return null;

  return (
    <section className="hub-links-group hub-links-group--product">
      <header className="hub-links-group__header">
        <p className="section-label">Knowledge Hub</p>
        <h2 className="hub-links-group__title">บทความที่เกี่ยวข้อง</h2>
      </header>
      <HubLinkList links={links} />
    </section>
  );
}

export function ReviewProductLink({ reviewId }) {
  const product = getReviewRelatedProduct(reviewId);
  if (!product) return null;

  return (
    <div className="hub-links hub-links--review">
      <Link to={product.href} className="hub-links__card hub-links__card--review">
        <span className="hub-links__review-label">ดูสินค้าที่เกี่ยวข้อง</span>
        <span className="hub-links__card-text">{product.label}</span>
        <span className="hub-links__card-arrow" aria-hidden="true">
          ›
        </span>
      </Link>
    </div>
  );
}
