import { useEffect, useMemo, useState } from 'react';
import JournalArticleCard from '../components/JournalArticleCard';
import ScrollReveal from '../components/ScrollReveal';
import {
  WP_ARTICLES_ENABLED,
  fetchWpCategories,
  fetchWpPosts,
} from '../api/wordpress';
import { ARTICLE_CATEGORIES, careGuides } from '../data/careGuides';
import { useLocale } from '../i18n/LocaleContext';
import { localizeGuide } from '../i18n/localizeGuide';
import useSeo from '../hooks/useSeo';
import { INDEX_ENGLISH, PAGE_SEO } from '../utils/seo';
import './Articles.css';

const PAGE_SIZE = 6;

function buildFallbackCategories() {
  return ARTICLE_CATEGORIES;
}

function buildFallbackPosts() {
  return careGuides.map((guide) => ({
    ...guide,
    source: 'fallback',
  }));
}

export default function Articles() {
  const { locale, t } = useLocale();
  const journal = t.journal;
  useSeo(
    locale === 'en'
      ? {
          title: journal.seoTitle,
          description: journal.seoDescription,
          path: '/en/articles',
          noindex: !INDEX_ENGLISH,
        }
      : PAGE_SEO.articles,
  );
  const [posts, setPosts] = useState(() =>
    WP_ARTICLES_ENABLED ? [] : buildFallbackPosts(),
  );
  const [categories, setCategories] = useState(buildFallbackCategories);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(WP_ARTICLES_ENABLED);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!WP_ARTICLES_ENABLED) return undefined;
    let cancelled = false;

    async function load() {
      try {
        const [{ posts: wpPosts }, wpCategories] = await Promise.all([
          fetchWpPosts({ perPage: 50 }),
          fetchWpCategories(),
        ]);

        if (cancelled) return;

        if (wpPosts.length > 0) {
          setPosts(wpPosts);
          setCategories([
            { id: 'all', label: 'ทั้งหมด' },
            ...(wpCategories.length
              ? wpCategories
              : Array.from(
                  new Map(
                    wpPosts.map((post) => [
                      post.topic,
                      { id: post.topic, label: post.category },
                    ]),
                  ).values(),
                )),
          ]);
        } else {
          setPosts(buildFallbackPosts());
          setCategories(buildFallbackCategories());
        }
      } catch {
        if (cancelled) return;
        setPosts(buildFallbackPosts());
        setCategories(buildFallbackCategories());
        setNotice('fallback');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const visiblePosts = useMemo(
    () => posts.map((post) => localizeGuide(post, locale)),
    [posts, locale],
  );

  const filteredPosts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return visiblePosts.filter((post, index) => {
      const source = posts[index];
      const matchesCategory =
        activeCategory === 'all' || post.topic === activeCategory;

      if (!matchesCategory) return false;
      if (!query) return true;

      const haystack = [
        post.title,
        post.summary,
        post.category,
        source?.title,
        source?.summary,
        source?.category,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [visiblePosts, posts, activeCategory, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);

  const pagePosts = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredPosts.slice(start, start + PAGE_SIZE);
  }, [filteredPosts, safePage]);

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
    setCurrentPage(1);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  return (
    <main className="articles-page">
      <header className="articles-page__hero">
        <div className="container">
          <ScrollReveal className="articles-page__hero-inner">
            <h1 className="articles-page__title">Journal</h1>
            <p className="articles-page__subtitle">{journal.subtitle}</p>
          </ScrollReveal>
        </div>
      </header>

      <section className="articles-page__content" aria-label={journal.listLabel}>
        <div className="container">
          <div className="articles-page__toolbar">
            <div
              className="articles-page__categories"
              role="tablist"
              aria-label={journal.categoriesLabel}
            >
              {categories.map((category) => {
                const isActive = activeCategory === category.id;
                return (
                  <button
                    key={category.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={`articles-page__category-btn${
                      isActive ? ' articles-page__category-btn--active' : ''
                    }`}
                    onClick={() => handleCategoryChange(category.id)}
                  >
                    {journal.categories[category.id] || category.label}
                  </button>
                );
              })}
            </div>

            <label className="articles-page__search">
              <span className="visually-hidden">{journal.searchLabel}</span>
              <input
                type="search"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder={journal.searchPlaceholder}
                autoComplete="off"
              />
            </label>
          </div>

          {loading ? (
            <p className="articles-page__empty" role="status">
              {journal.loading}
            </p>
          ) : null}

          {notice ? (
            <p className="articles-page__empty" role="status">
              {journal.notice}
            </p>
          ) : null}

          {!loading && pagePosts.length > 0 ? (
            <ul className="articles-page__grid">
              {pagePosts.map((post) => (
                <li key={post.id}>
                  <JournalArticleCard guide={post} />
                </li>
              ))}
            </ul>
          ) : null}

          {!loading && pagePosts.length === 0 ? (
            <p className="articles-page__empty" role="status">
              {journal.empty}
            </p>
          ) : null}

          {filteredPosts.length > PAGE_SIZE ? (
            <nav
              className="articles-page__pagination"
              aria-label={journal.pagination}
            >
              <button
                type="button"
                className="articles-page__page-btn"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={safePage <= 1}
              >
                {journal.previous}
              </button>

              <div className="articles-page__page-list">
                {Array.from({ length: totalPages }, (_, index) => {
                  const page = index + 1;
                  const isActive = page === safePage;
                  return (
                    <button
                      key={page}
                      type="button"
                      className={`articles-page__page-num${
                        isActive ? ' articles-page__page-num--active' : ''
                      }`}
                      aria-current={isActive ? 'page' : undefined}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                className="articles-page__page-btn"
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                disabled={safePage >= totalPages}
              >
                {journal.next}
              </button>
            </nav>
          ) : null}
        </div>
      </section>
    </main>
  );
}
