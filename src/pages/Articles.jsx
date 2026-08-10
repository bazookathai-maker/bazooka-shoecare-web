import { useEffect, useMemo, useState } from 'react';
import JournalArticleCard from '../components/JournalArticleCard';
import ScrollReveal from '../components/ScrollReveal';
import { fetchWpCategories, fetchWpPosts } from '../api/wordpress';
import { ARTICLE_CATEGORIES, careGuides } from '../data/careGuides';
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
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState(buildFallbackCategories);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');

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
      } catch (err) {
        if (cancelled) return;
        setPosts(buildFallbackPosts());
        setCategories(buildFallbackCategories());
        setError(
          err instanceof Error
            ? err.message
            : 'ไม่สามารถโหลดบทความจาก WordPress ได้ กำลังแสดงข้อมูลตัวอย่าง',
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredPosts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return posts.filter((post) => {
      const matchesCategory =
        activeCategory === 'all' || post.topic === activeCategory;

      if (!matchesCategory) return false;
      if (!query) return true;

      const haystack = [post.title, post.summary, post.category]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [posts, activeCategory, searchQuery]);

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
            <p className="articles-page__subtitle">
              คู่มือดูแลรองเท้าสั้นๆ จากทีม BAZOOKA
            </p>
          </ScrollReveal>
        </div>
      </header>

      <section className="articles-page__content" aria-label="รายการบทความ">
        <div className="container">
          <div className="articles-page__toolbar">
            <div
              className="articles-page__categories"
              role="tablist"
              aria-label="หมวดหมู่บทความ"
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
                    {category.label}
                  </button>
                );
              })}
            </div>

            <label className="articles-page__search">
              <span className="visually-hidden">ค้นหาบทความ</span>
              <input
                type="search"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="ค้นหาบทความ..."
                autoComplete="off"
              />
            </label>
          </div>

          {loading ? (
            <p className="articles-page__empty" role="status">
              กำลังโหลดบทความ...
            </p>
          ) : null}

          {error ? (
            <p className="articles-page__empty" role="status">
              {error}
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
              ไม่พบบทความที่ตรงกับการค้นหา
            </p>
          ) : null}

          {filteredPosts.length > PAGE_SIZE ? (
            <nav
              className="articles-page__pagination"
              aria-label="หน้าบทความ"
            >
              <button
                type="button"
                className="articles-page__page-btn"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={safePage <= 1}
              >
                ก่อนหน้า
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
                ถัดไป
              </button>
            </nav>
          ) : null}
        </div>
      </section>
    </main>
  );
}
