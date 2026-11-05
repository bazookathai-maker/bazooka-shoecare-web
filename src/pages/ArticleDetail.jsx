import { useEffect, useState } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import ArticleCard from '../components/ArticleCard';
import { ArticleTopicRelated } from '../components/HubRelatedContent';
import ScrollReveal from '../components/ScrollReveal';
import LongformArticle from '../components/LongformArticle';
import { WP_ARTICLES_ENABLED, fetchWpPostBySlug } from '../api/wordpress';
import { getCareGuideBySlug } from '../data/careGuides';
import { getArticleStoreProducts } from '../data/knowledgeHub';
import { articlePath, articleSeo, buildArticleJsonLd } from '../utils/seo';
import useSeo from '../hooks/useSeo';
import '../components/HubRelatedContent.css';
import './Articles.css';

function ArticleStoreProducts({ articleId }) {
  const products = getArticleStoreProducts(articleId);
  if (!products.length) return null;

  return (
    <aside className="hub-links-group hub-links-group--article" aria-label="สินค้าที่เกี่ยวข้อง">
      <h2 className="hub-links-group__title">สินค้าที่เกี่ยวข้อง</h2>
      <ul className="hub-links__list">
        {products.map((item) => (
          <li key={item.href}>
            <Link to={item.href} className="hub-links__card hub-links__card--with-thumb">
              {item.image ? (
                <img
                  className="hub-links__thumb"
                  src={item.image}
                  alt=""
                  width="72"
                  height="72"
                />
              ) : null}
              <span className="hub-links__card-text">{item.label}</span>
              <span className="hub-links__card-arrow" aria-hidden="true">›</span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function formatArticleDate(isoDate) {
  if (!isoDate) return '';
  try {
    return new Intl.DateTimeFormat('th-TH', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(isoDate));
  } catch {
    return isoDate;
  }
}

function WordpressArticleDetail({ post }) {
  return (
    <article className="wp-article">
      {post.cover ? (
        <div className="wp-article__cover">
          <img src={post.cover} alt="" loading="eager" decoding="async" />
        </div>
      ) : null}

      <p className="wp-article__meta">
        <span>{post.category}</span>
        {post.publishedAt ? (
          <time dateTime={post.publishedAt}>
            {formatArticleDate(post.publishedAt)}
          </time>
        ) : null}
      </p>

      <h1 className="wp-article__title">{post.title}</h1>

      {post.summary ? <p className="wp-article__excerpt">{post.summary}</p> : null}

      <div
        className="wp-article__content"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />
    </article>
  );
}

export default function ArticleDetail() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const faqId = searchParams.get('faq');

  const fallbackGuide = getCareGuideBySlug(slug);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(WP_ARTICLES_ENABLED);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!WP_ARTICLES_ENABLED) return undefined;
    let cancelled = false;
    const localGuide = getCareGuideBySlug(slug);

    async function load() {
      setLoading(true);
      setNotFound(false);

      try {
        const wpPost = await fetchWpPostBySlug(slug);
        if (cancelled) return;

        if (wpPost) {
          setPost(wpPost);
        } else if (localGuide) {
          setPost(null);
        } else {
          setNotFound(true);
        }
      } catch {
        if (cancelled) return;
        if (!localGuide) setNotFound(true);
        setPost(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const seoSource = post || fallbackGuide;
  const isLongform = Boolean(fallbackGuide?.longform) && !post;
  useSeo(
    seoSource
      ? {
          ...articleSeo(seoSource),
          jsonLd: isLongform ? buildArticleJsonLd(fallbackGuide) : null,
        }
      : { title: 'บทความ', path: articlePath(slug), noindex: !loading },
  );

  const isNotFound = WP_ARTICLES_ENABLED ? notFound : !fallbackGuide;
  if (!loading && isNotFound) {
    return <Navigate to="/articles" replace />;
  }

  const isWordpress = Boolean(post);
  const guide = !isWordpress ? fallbackGuide : null;

  return (
    <main className="articles-page article-detail-page">
      <header className="articles-page__hero">
        <div className="container container--editorial">
          <ScrollReveal>
            <p className="article-detail-page__back-wrap">
              <Link to="/articles" className="article-detail-page__back">
                ← กลับไปดูบทความทั้งหมด
              </Link>
            </p>
            {!isWordpress && !fallbackGuide?.longform ? (
              <>
                <h1 className="articles-page__title">เรื่องราวการดูแลรองเท้า</h1>
                <p className="articles-page__subtitle">
                  คู่มือดูแลรองเท้าคู่โปรดจาก BAZOOKA
                </p>
              </>
            ) : null}
          </ScrollReveal>
        </div>
      </header>

      <section
        className="articles-page__content article-detail-page__content"
        aria-label="เนื้อหาบทความ"
      >
        <div
          className={
            isWordpress
              ? 'article-detail-page__layout article-detail-page__layout--wp'
              : fallbackGuide?.longform
                ? 'article-detail-page__layout article-detail-page__layout--longform'
                : 'article-detail-page__layout'
          }
        >
          {loading ? (
            <p className="articles-page__empty" role="status">
              กำลังโหลดบทความ...
            </p>
          ) : null}

          {!loading && isWordpress ? (
            <ScrollReveal>
              <WordpressArticleDetail post={post} />
            </ScrollReveal>
          ) : null}

          {!loading && guide?.longform && guide.blocks ? (
            <LongformArticle
              title={guide.title}
              blocks={guide.blocks}
              className={guide.articleClass || 'longform-article'}
              videoSrc={guide.embedVideo ? guide.video : undefined}
            />
          ) : null}

          {!loading && guide ? <ArticleStoreProducts articleId={guide.id} /> : null}

          {!loading && guide && !guide.longform ? (
            <ScrollReveal>
              <ArticleCard guide={guide} isActive variant="standalone" />
            </ScrollReveal>
          ) : null}

          {!loading && guide ? (
            <ArticleTopicRelated slug={guide.slug} faqId={faqId} />
          ) : null}
        </div>
      </section>
    </main>
  );
}
