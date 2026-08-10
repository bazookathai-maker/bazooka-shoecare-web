import { Link } from 'react-router-dom';

function formatArticleDate(isoDate) {
  if (!isoDate) return '';

  try {
    return new Intl.DateTimeFormat('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(isoDate));
  } catch {
    return isoDate;
  }
}

function cleanTitle(title = '') {
  return title.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
}

export default function JournalArticleCard({ guide }) {
  const title = cleanTitle(guide.title);
  const cover =
    guide.cover || guide.products?.[0]?.image || '/products/product-5.jpg.jpg';
  const category = guide.category || 'คู่มือดูแล';
  const dateLabel = formatArticleDate(guide.publishedAt);

  return (
    <article className="journal-article-card">
      <Link
        to={`/articles/${guide.slug}`}
        className="journal-article-card__link"
        aria-label={`อ่านบทความ: ${title}`}
      >
        <div className="journal-article-card__media">
          <img
            src={cover}
            alt=""
            className="journal-article-card__image"
            loading="lazy"
            decoding="async"
          />
        </div>

        <div className="journal-article-card__body">
          <p className="journal-article-card__category">{category}</p>
          <h2 className="journal-article-card__title">{title}</h2>
          <p className="journal-article-card__excerpt">{guide.summary}</p>
          <div className="journal-article-card__meta">
            {dateLabel ? (
              <time
                className="journal-article-card__date"
                dateTime={guide.publishedAt}
              >
                {dateLabel}
              </time>
            ) : null}
            <span className="journal-article-card__read">อ่านเพิ่มเติม</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
