import { useEffect, useState } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import ArticleCard from '../components/ArticleCard';
import { ArticleTopicRelated } from '../components/HubRelatedContent';
import ScrollReveal from '../components/ScrollReveal';
import { fetchWpPostBySlug } from '../api/wordpress';
import { getCareGuideBySlug } from '../data/careGuides';
import './Articles.css';

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
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
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

  if (!loading && notFound) {
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
            {!isWordpress ? (
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

          {!loading && guide ? (
            <>
              <ScrollReveal>
                <ArticleCard guide={guide} isActive variant="standalone" />
              </ScrollReveal>
              <ArticleTopicRelated slug={guide.slug} faqId={faqId} />
            </>
          ) : null}
        </div>
      </section>
    </main>
  );
}
