import { useId, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ScrollReveal from '../ScrollReveal';
import { FaqRelatedArticles } from '../HubRelatedContent';
import { homeFaqs } from '../../data/homeFaq';
import './HomeFaqSection.css';

function FaqChevron({ isOpen }) {
  return (
    <svg
      className={`home-faq__icon${isOpen ? ' home-faq__icon--open' : ''}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FaqItem({ faq, index, isOpen, onToggle }) {
  const panelId = useId();
  const buttonId = useId();

  return (
    <article
      id={`faq-${faq.id}`}
      className={`home-faq__item${isOpen ? ' home-faq__item--open' : ''}`}
    >
      <h3 className="home-faq__question-wrap">
        <button
          id={buttonId}
          type="button"
          className="home-faq__trigger"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => onToggle(index)}
        >
          <span className="home-faq__question">{faq.question}</span>
          <FaqChevron isOpen={isOpen} />
        </button>
      </h3>
      <div
        id={panelId}
        className="home-faq__panel"
        role="region"
        aria-labelledby={buttonId}
        aria-hidden={!isOpen}
      >
        <div className="home-faq__panel-inner">
          <p className="home-faq__answer">{faq.answer}</p>
          <FaqRelatedArticles faqId={faq.id} />
        </div>
      </div>
    </article>
  );
}

export default function HomeFaqSection({ showViewAllCta = false, ctaOnly = false }) {
  const { hash } = useLocation();
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    if (ctaOnly || !hash?.startsWith('#faq-')) return;
    const faqId = hash.replace('#faq-', '');
    const index = homeFaqs.findIndex((item) => item.id === faqId);
    if (index >= 0) setOpenIndex(index);
  }, [hash, ctaOnly]);

  const handleToggle = (index) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  if (ctaOnly) {
    return (
      <section className="home-faq home-faq--cta-only" id="faq" aria-label="คำถามที่พบบ่อย">
        <div className="container">
          <ScrollReveal className="home-faq__cta-wrap" delay={70}>
            <Link to="/faq" className="home-faq__cta-card">
              ดูคำถามที่พบบ่อย
            </Link>
          </ScrollReveal>
        </div>
      </section>
    );
  }

  return (
    <section className="home-faq" id="faq" aria-labelledby="home-faq-title">
      <div className="container">
        <ScrollReveal className="home-faq__header">
          <h2 id="home-faq-title" className="home-faq__title">
            คำถามที่พบบ่อย
          </h2>
          <p className="home-faq__subtitle">
            รวมคำถามเกี่ยวกับการดูแลรองเท้าและการใช้งานผลิตภัณฑ์
          </p>
        </ScrollReveal>

        <ScrollReveal className="home-faq__list-wrap" delay={70}>
          <div className="home-faq__list">
            {homeFaqs.map((faq, index) => (
              <FaqItem
                key={faq.id}
                faq={faq}
                index={index}
                isOpen={openIndex === index}
                onToggle={handleToggle}
              />
            ))}
          </div>
        </ScrollReveal>

        {showViewAllCta ? (
          <ScrollReveal className="home-faq__footer" delay={120}>
            <Link to="/faq" className="btn-outline home-faq__view-all">
              ดูคำถามที่พบบ่อยทั้งหมด
            </Link>
          </ScrollReveal>
        ) : null}
      </div>
    </section>
  );
}
