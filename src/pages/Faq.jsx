import { useEffect, useId, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ScrollReveal from '../components/ScrollReveal';
import { FAQ_CATEGORIES, faqItems } from '../data/faqPage';
import './Faq.css';

function FaqIcon({ isOpen }) {
  return (
    <span className="faq-page__icon" aria-hidden="true">
      {isOpen ? '−' : '+'}
    </span>
  );
}

function FaqAccordionItem({ faq, isOpen, onToggle }) {
  const panelId = useId();
  const buttonId = useId();

  return (
    <article
      id={`faq-${faq.id}`}
      className={`faq-page__item${isOpen ? ' faq-page__item--open' : ''}`}
    >
      <h2 className="faq-page__question-wrap">
        <button
          id={buttonId}
          type="button"
          className="faq-page__trigger"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
        >
          <span className="faq-page__question">{faq.question}</span>
          <FaqIcon isOpen={isOpen} />
        </button>
      </h2>
      <div
        id={panelId}
        className="faq-page__panel"
        role="region"
        aria-labelledby={buttonId}
        hidden={!isOpen}
      >
        <p className="faq-page__answer">{faq.answer}</p>
      </div>
    </article>
  );
}

export default function Faq() {
  const { hash } = useLocation();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openId, setOpenId] = useState(null);

  const filteredFaqs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return faqItems.filter((faq) => {
      const matchesCategory =
        activeCategory === 'all' || faq.category === activeCategory;

      if (!matchesCategory) return false;
      if (!query) return true;

      const haystack = `${faq.question} ${faq.answer}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [activeCategory, searchQuery]);

  useEffect(() => {
    if (!hash?.startsWith('#faq-')) return;
    const faqId = hash.replace('#faq-', '');
    const match = faqItems.find((item) => item.id === faqId);
    if (!match) return;

    setActiveCategory('all');
    setSearchQuery('');
    setOpenId(faqId);
  }, [hash]);

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
    setOpenId(null);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setOpenId(null);
  };

  const handleToggle = (faqId) => {
    setOpenId((current) => (current === faqId ? null : faqId));
  };

  return (
    <main className="faq-page">
      <header className="faq-page__hero">
        <div className="container">
          <ScrollReveal className="faq-page__hero-inner">
            <h1 className="faq-page__title">FAQ</h1>
            <p className="faq-page__subtitle">
              คำตอบสั้น ๆ เกี่ยวกับสินค้า การสั่งซื้อ และการจัดส่ง
            </p>
          </ScrollReveal>
        </div>
      </header>

      <section className="faq-page__content" aria-label="คำถามที่พบบ่อย">
        <div className="faq-page__shell">
          <label className="faq-page__search">
            <span className="visually-hidden">ค้นหาคำถาม</span>
            <input
              type="search"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="ค้นหาคำถาม..."
              autoComplete="off"
            />
          </label>

          <div
            className="faq-page__categories"
            role="tablist"
            aria-label="หมวดหมู่คำถาม"
          >
            {FAQ_CATEGORIES.map((category) => {
              const isActive = activeCategory === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`faq-page__category-btn${
                    isActive ? ' faq-page__category-btn--active' : ''
                  }`}
                  onClick={() => handleCategoryChange(category.id)}
                >
                  {category.label}
                </button>
              );
            })}
          </div>

          {filteredFaqs.length > 0 ? (
            <div className="faq-page__list">
              {filteredFaqs.map((faq) => (
                <FaqAccordionItem
                  key={faq.id}
                  faq={faq}
                  isOpen={openId === faq.id}
                  onToggle={() => handleToggle(faq.id)}
                />
              ))}
            </div>
          ) : (
            <p className="faq-page__empty" role="status">
              ไม่พบคำถามที่ตรงกับการค้นหา
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
