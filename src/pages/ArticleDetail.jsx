import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import ArticleCard from '../components/ArticleCard';
import { ArticleTopicRelated } from '../components/HubRelatedContent';
import ScrollReveal from '../components/ScrollReveal';
import { getCareGuideBySlug } from '../data/careGuides';
import './Articles.css';

export default function ArticleDetail() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const faqId = searchParams.get('faq');
  const guide = getCareGuideBySlug(slug);

  if (!guide) {
    return <Navigate to="/articles" replace />;
  }

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
            <h1 className="articles-page__title">เรื่องราวการดูแลรองเท้า</h1>
            <p className="articles-page__subtitle">
              คู่มือดูแลรองเท้าคู่โปรดจาก BAZOOKA
            </p>
          </ScrollReveal>
        </div>
      </header>

      <section
        className="articles-page__content article-detail-page__content"
        aria-label="เนื้อหาบทความ"
      >
        <div className="article-detail-page__layout">
          <ScrollReveal>
            <ArticleCard guide={guide} isActive variant="standalone" />
          </ScrollReveal>
          <ArticleTopicRelated slug={guide.slug} faqId={faqId} />
        </div>
      </section>
    </main>
  );
}
