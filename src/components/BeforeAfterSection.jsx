import ScrollReveal from './ScrollReveal';
import BeforeAfterCompare from './BeforeAfterCompare';
import './BeforeAfterSection.css';

export default function BeforeAfterSection() {
  return (
    <section className="before-after" id="transformation">
      <div className="container before-after__inner">
        <ScrollReveal className="before-after__header">
          <p className="section-label">Transformation</p>
          <h2 className="before-after__headline">
            <span className="before-after__line">From worn</span>
            <span className="before-after__line before-after__line--accent">
              to ready again
            </span>
          </h2>
        </ScrollReveal>
      </div>

      <ScrollReveal delay={80} className="before-after__compare-wrap">
        <BeforeAfterCompare />
        <p className="before-after__hint">ลากเพื่อเปิดเผยการเปลี่ยนแปลง</p>
      </ScrollReveal>
    </section>
  );
}
