import { Link } from 'react-router-dom';
import './JournalSection.css';

const articles = [
  {
    slug: 'deep-clean-suede',
    category: 'คู่มือดูแล',
    title: 'วิธีทำความสะอาดหนังกลับอย่างลึก',
    excerpt: 'พิธีการทีละขั้นตอนเพื่อยกคราบโดยไม่ทำลายขนสัมผัส',
  },
  {
    slug: 'protect-before-wear',
    category: 'การปกป้อง',
    title: 'เคลือบก่อนใส่ทุกครั้ง',
    excerpt: 'ทำไมการเคลือบก่อนออกจากบ้านถึงสำคัญสำหรับรองเท้าพรีเมียม',
  },
  {
    slug: 'daily-refresh',
    category: 'พิธีการประจำวัน',
    title: 'พิธีการฟื้นฟูประจำวัน',
    excerpt: 'รักษาความสดใหม่ระหว่างการใส่ด้วยความพยายามน้อยที่สุด',
  },
];

export default function JournalSection() {
  return (
    <section className="journal" id="journal">
      <div className="container">
        <header className="journal__header">
          <p className="section-label">บทความ</p>
          <h2 className="section-title">ศิลปะการดูแลรองเท้า</h2>
          <p className="journal__desc">
            คู่มือจากทีม BAZOOKA — สำหรับนักสะสมที่ใส่ใจในทุกรายละเอียด
          </p>
        </header>

        <ul className="journal__grid">
          {articles.map((article, index) => (
            <li key={article.slug}>
              <Link to="/articles" className="journal__card">
                <span className="journal__index">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="journal__category">{article.category}</span>
                <h3 className="journal__title">{article.title}</h3>
                <p className="journal__excerpt">{article.excerpt}</p>
                <span className="journal__read">อ่านบทความ</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="journal__cta">
          <Link to="/articles" className="btn-outline">
            ดูบทความทั้งหมด
          </Link>
        </div>
      </div>
    </section>
  );
}
