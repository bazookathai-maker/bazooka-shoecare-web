import { useId, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
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

export default function HomeFaqSection() {
  const { hash } = useLocation();
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    if (!hash?.startsWith('#faq-')) return;
    const faqId = hash.replace('#faq-', '');
    const index = homeFaqs.findIndex((item) => item.id === faqId);
    if (index >= 0) setOpenIndex(index);
  }, [hash]);

  const handleToggle = (index) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

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
      </div>
    </section>
  );
}
