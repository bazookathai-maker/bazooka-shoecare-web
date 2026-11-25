import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import LocaleLink from '../components/LocaleLink';
import { useLocale } from '../i18n/LocaleContext';
import { hasEnglishProductCopy, localizeStoreProduct } from '../i18n/productCopy';
import ProductGallery from '../components/ProductGallery';
import ProductCard from '../components/ProductCard';
import AddToCartButton from '../components/AddToCartButton';
import ScrollReveal from '../components/ScrollReveal';
import {
  fetchStoreProductById,
  fetchStoreProducts,
} from '../api/woocommerce';
import { LISTING_HIDDEN_PRODUCT_IDS } from '../data/hiddenProducts';
import { getProductCareLink } from '../data/productCareLinks';
import { INDEX_ENGLISH, buildProductJsonLd, productPath } from '../utils/seo';
import { trackViewItem } from '../analytics/ga4';
import { useAnalyticsConsent } from '../components/AnalyticsListener';
import useSeo from '../hooks/useSeo';
import './ProductDetail.css';

const PRODUCT_IDS_WITHOUT_RECOMMENDED = new Set(['881', '143', '134']);

function ProductCareLink({ productId }) {
  const { t } = useLocale();
  const careLink = getProductCareLink(productId);
  if (!careLink) return null;
  return (
    <p className="pdp__care-link">
      <LocaleLink to={careLink.href}>{t.pdp.suedeGuide}</LocaleLink>
    </p>
  );
}

function DetailStatus({ children, error = false }) {
  const { t } = useLocale();
  return (
    <main className="pdp">
      <div className="container">
        <p
          className={`pdp__status${error ? ' pdp__status--error' : ''}`}
          role={error ? 'alert' : 'status'}
        >
          {children}
        </p>
        <div className="pdp__actions" style={{ marginTop: '1.5rem' }}>
          <LocaleLink to="/products" className="btn-primary">
            {t.pdp.back}
          </LocaleLink>
        </div>
      </div>
    </main>
  );
}

export default function ProductDetail() {
  const { locale, t } = useLocale();
  const { slug: productId } = useParams();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);
  const actionsMediaRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      setLoading(true);
      setError('');
      setNotFound(false);
      setDetail(null);

      try {
        const product = await fetchStoreProductById(productId);
        if (cancelled) return;

        if (!product) {
          setNotFound(true);
          return;
        }

        let recommended = [];
        if (!PRODUCT_IDS_WITHOUT_RECOMMENDED.has(String(product.id))) {
          try {
            const allProducts = await fetchStoreProducts();
            if (!cancelled) {
              recommended = allProducts
                .filter(
                  (item) =>
                    item.id !== product.id &&
                    !LISTING_HIDDEN_PRODUCT_IDS.has(String(item.id)),
                )
                .slice(0, 4);
            }
          } catch {
            recommended = [];
          }
        }

        if (!cancelled) {
          setDetail({ ...product, recommended });
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error && err.message ? err.message : 'load',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [productId]);

  const consent = useAnalyticsConsent();

  useEffect(() => {
    if (consent !== 'granted' || !detail?.id) return;
    trackViewItem({
      id: detail.id,
      name: detail.name,
      price: detail.price,
      currency: detail.currency || 'THB',
    });
  }, [consent, detail?.id, detail?.name, detail?.price, detail?.currency]);

  const view = useMemo(() => {
    if (!detail) return null;
    const localized = localizeStoreProduct(detail, locale);
    return {
      ...localized,
      recommended: (detail.recommended || []).map((item) =>
        localizeStoreProduct(item, locale),
      ),
    };
  }, [detail, locale]);

  const isListed = Boolean(detail) && !LISTING_HIDDEN_PRODUCT_IDS.has(String(detail.id));
  const englishReady = hasEnglishProductCopy(productId);
  useSeo(
    view
      ? {
          title: view.name,
          description: view.heroDescription || t.products.seoDescription,
          path: locale === 'en' ? `/en/products/${productId}` : productPath(productId),
          noindex: !isListed || (locale === 'en' && (!INDEX_ENGLISH || !englishReady)),
          jsonLd: isListed && (locale !== 'en' || englishReady) ? buildProductJsonLd(view, locale) : null,
        }
      : {
          title: t.pdp.products,
          path: locale === 'en' ? `/en/products/${productId}` : productPath(productId),
          noindex: locale === 'en' || notFound,
          preserveJsonLd: !notFound,
        },
  );

  if (loading) {
    return <DetailStatus>{t.pdp.loading}</DetailStatus>;
  }

  if (error) {
    return <DetailStatus error>{error === 'load' ? t.pdp.loadError : error}</DetailStatus>;
  }

  if (notFound || !view) {
    return <DetailStatus error>{t.pdp.notFound}</DetailStatus>;
  }

  const hasAbout = Boolean(view.aboutDescription);
  const hasBenefits = view.benefits?.length > 0;
  const hasHowTo = Boolean(view.howToText);
  const categoryNames = (view.categories || [])
    .map((item) => item.name)
    .filter(
      (name) =>
        name &&
        name.toLowerCase() !== 'uncategorized' &&
        name !== 'ไม่มีหมวดหมู่',
    );
  const categoryLabel = categoryNames.length ? categoryNames.join(', ') : view.category;
  const hasMeta = Boolean(view.sku) || Boolean(categoryLabel);

  return (
    <main className="pdp">
      <nav className="pdp__breadcrumb container" aria-label={t.pdp.breadcrumb}>
        <LocaleLink to="/">{t.pdp.home}</LocaleLink>
        <span className="pdp__breadcrumb-sep" aria-hidden="true">
          /
        </span>
        <LocaleLink to="/products">{t.pdp.products}</LocaleLink>
        <span className="pdp__breadcrumb-sep" aria-hidden="true">
          /
        </span>
        <span className="pdp__breadcrumb-current">
          {view.breadcrumbLabel ?? view.name}
        </span>
      </nav>

      <section className="pdp__hero container">
        <div className="pdp__layout">
          {view.gallery?.length > 0 ? (
            <ProductGallery
              images={view.gallery.map((image) => ({ ...image, alt: view.name }))}
              fillFrame={view.imageFrame === 'fill'}
            />
          ) : null}

          <div className="pdp__info">
            <h1 className="pdp__name">{view.name}</h1>
            <p className="pdp__price">฿{view.price.toLocaleString()}</p>
            {view.heroDescription ? (
              <p className="pdp__description">{view.heroDescription}</p>
            ) : null}
            <p
              className={`pdp__stock${
                view.isInStock ? '' : ' pdp__stock--out'
              }`}
            >
              {view.stockLabelShort || view.stockLabel}
            </p>

            <div className="pdp__actions" ref={actionsMediaRef}>
              {view.image ? (
                <img
                  src={view.image}
                  alt=""
                  className="pdp__actions-fly-source"
                  aria-hidden="true"
                />
              ) : null}
              {view.isInStock ? (
                <AddToCartButton
                  product={view}
                  mediaRef={actionsMediaRef}
                />
              ) : (
                <button type="button" className="btn-primary" disabled>
                  {t.pdp.soldOut}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {hasAbout ? (
        <section className="pdp__section pdp__content" id="about">
          <div className="container pdp__section-inner">
            <header className="pdp__section-header">
              <p className="section-label">{t.pdp.detailsLabel}</p>
              <h2 className="pdp__section-title">{t.pdp.about}</h2>
            </header>
            <p className="pdp__prose">{view.aboutDescription}</p>
            {hasHowTo ? null : <ProductCareLink productId={productId} />}
          </div>
        </section>
      ) : null}

      {hasBenefits ? (
        <section className="pdp__section pdp__highlights" id="highlights">
          <div className="container pdp__section-inner">
            <header className="pdp__section-header">
              <p className="section-label">{t.pdp.highlightsLabel}</p>
              <h2 className="pdp__section-title">{t.pdp.highlights}</h2>
            </header>
            <ul className="pdp__benefit-list">
              {view.benefits.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {hasHowTo ? (
        <section className="pdp__section pdp__howto" id="how-to-use">
          <div className="container pdp__section-inner">
            <header className="pdp__section-header">
              <p className="section-label">{t.pdp.usageLabel}</p>
              <h2 className="pdp__section-title">{t.pdp.usage}</h2>
            </header>
            <p className="pdp__prose">{view.howToText}</p>
            <ProductCareLink productId={productId} />
          </div>
        </section>
      ) : null}

      {!hasHowTo && !hasAbout && getProductCareLink(productId) ? (
        <section className="pdp__section" aria-label={t.pdp.relatedArticle}>
          <div className="container pdp__section-inner">
            <ProductCareLink productId={productId} />
          </div>
        </section>
      ) : null}

      {hasMeta ? (
        <section className="pdp__section pdp__meta" id="more-details">
          <div className="container pdp__section-inner">
            <header className="pdp__section-header">
              <p className="section-label">{t.pdp.infoLabel}</p>
              <h2 className="pdp__section-title">{t.pdp.more}</h2>
            </header>
            <dl className="pdp__meta-list">
              {view.sku ? (
                <div className="pdp__meta-row">
                  <dt>{t.pdp.sku}</dt>
                  <dd>{view.sku}</dd>
                </div>
              ) : null}
              {categoryLabel ? (
                <div className="pdp__meta-row">
                  <dt>{t.pdp.category}</dt>
                  <dd>{categoryLabel}</dd>
                </div>
              ) : null}
            </dl>
          </div>
        </section>
      ) : null}

      {view.recommended?.length > 0 && (
        <section className="pdp__section pdp__recommended">
          <div className="container pdp__section-inner">
            <header className="pdp__section-header">
              <p className="section-label">{t.pdp.moreLabel}</p>
              <h2 className="pdp__section-title">{t.pdp.recommended}</h2>
            </header>
            <div className="pdp__recommended-grid">
              {view.recommended.map((product, index) => (
                <ScrollReveal
                  key={product.id}
                  delay={index * 60}
                  className="pdp__recommended-item"
                >
                  <ProductCard
                    product={product}
                    variant="recommend"
                    showAddToCart={false}
                    showPrice
                    linkToDetail
                  />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
