import './BrandPhilosophySection.css';

const pillars = [
  {
    label: 'ออร์แกนิก',
    title: 'ส่วนผสมที่ตั้งใจเลือก',
    text: 'สูตรจากพืช ทำความสะอาดลึกโดยไม่กระทบวัสดุพรีเมียม',
  },
  {
    label: 'พรีเมียม',
    title: 'ยกระดับการดูแลรองเท้า',
    text: 'สูตรผ่านการทดสอบ สำหรับนักสะสมและผู้ที่รักรองเท้าทุกวัน',
  },
  {
    label: 'พิธีการ',
    title: 'การดูแลในชีวิตประจำวัน',
    text: 'จังหวะสามขั้นตอน — สะอาด ฟื้นฟู ปกป้อง — ที่เข้ากับไลฟ์สไตล์ของคุณ',
  },
];

export default function BrandPhilosophySection() {
  return (
    <section className="philosophy" id="philosophy">
      <div className="container philosophy__inner">
        <header className="philosophy__intro">
          <p className="section-label">ปรัชญาแบรนด์</p>
          <h2 className="section-title">แนวทางของ BAZOOKA</h2>
          <p className="philosophy__lead">
            เราเชื่อว่ารองเท้าที่ดีสมควรได้รับการดูแลทุกวัน —
            ไม่ใช่แค่ตอนที่สภาพเริ่มแย่ลง การดูแลควรสงบ แม่นยำ
            และหรูหราในความเรียบง่าย
          </p>
        </header>

        <ul className="philosophy__grid">
          {pillars.map((item) => (
            <li key={item.label} className="philosophy__pillar">
              <span className="philosophy__pillar-label">{item.label}</span>
              <h3 className="philosophy__pillar-title">{item.title}</h3>
              <p className="philosophy__pillar-text">{item.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
