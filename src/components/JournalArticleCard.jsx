import { getVerifiedArticleDates } from '../utils/seo';
import { useLocale } from '../i18n/LocaleContext';
import LocaleLink from './LocaleLink';

function formatArticleDate(isoDate, locale) {
  if (!isoDate) return '';
  const parsed = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return '';

  return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parsed);
}

function cleanTitle(title = '') {
  return title.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
}

export default function JournalArticleCard({ guide }) {
  const { locale, t } = useLocale();
  const title = cleanTitle(guide.title);
  const cover =
    guide.cover || guide.products?.[0]?.image || '/products/product-5.jpg.jpg';
  const category = guide.category || t.journal.fallbackCategory;
  const publishedAt = getVerifiedArticleDates(guide)?.published || '';
  const dateLabel = formatArticleDate(publishedAt, locale);

  return (
    <article className="journal-article-card">
      <LocaleLink
        to={`/articles/${guide.slug}`}
        className="journal-article-card__link"
        aria-label={t.journal.readArticle(title)}
      >
        <div className="journal-article-card__media">
          <img
            src={cover}
            alt={guide.coverAlt || ''}
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
                dateTime={publishedAt}
              >
                {dateLabel}
              </time>
            ) : null}
            <span className="journal-article-card__read">{t.journal.readMore}</span>
          </div>
        </div>
      </LocaleLink>
    </article>
  );
}
