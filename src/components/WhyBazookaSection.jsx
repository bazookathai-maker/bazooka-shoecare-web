import './WhyBazookaSection.css';

const iconProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

const reasons = [
  {
    title: 'ใช้งานง่าย',
    text: 'ขั้นตอนเรียบง่ายสำหรับการดูแลประจำวัน ไม่ต้องใช้อุปกรณ์ซับซ้อน',
    icon: (
      <svg {...iconProps}>
        <path d="M5 8h14M5 12h14M5 16h9" />
      </svg>
    ),
  },
  {
    title: 'สูตรออร์แกนิก',
    text: 'ส่วนผสมจากธรรมชาติ อ่อนโยนต่อวัสดุพรีเมียม',
    icon: (
      <svg {...iconProps}>
        <path d="M12 4c-3.5 5.5-3.5 10.5 0 16 3.5-5.5 3.5-10.5 0-16z" />
        <path d="M12 9v11" />
      </svg>
    ),
  },
  {
    title: 'ปกป้องรองเท้า',
    text: 'เกราะป้องกันน้ำ คราบ และการสึกหรอในชีวิตประจำวัน',
    icon: (
      <svg {...iconProps}>
        <path d="M12 3.5 19 7.25v5.25c0 4.75-3 8.25-7 9.25-4-1-7-4.5-7-9.25V7.25L12 3.5z" />
      </svg>
    ),
  },
  {
    title: 'ดับกลิ่น',
    text: 'กำจัดกลิ่นอย่างแท้จริง ไม่ใช่แค่ปิดบังด้วยน้ำหอม',
    icon: (
      <svg {...iconProps}>
        <path d="M5 14c1.5-1.5 3-1.5 4.5 0s3 1.5 4.5 0 3-1.5 4.5 0" />
        <path d="M8.5 8.5c.75.75 1.5.75 2.25 0M13.25 8.5c.75.75 1.5.75 2.25 0" />
      </svg>
    ),
  },
];

export default function WhyBazookaSection() {
  return (
    <section className="why-bazooka" id="why-bazooka">
      <div className="container why-bazooka__inner">
        <header className="why-bazooka__header">
          <h2 className="why-bazooka__title section-title">ทำไมต้อง BAZOOKA</h2>
          <p className="why-bazooka__desc">
            ดูแลรองเท้า ครบ ทุกขั้นตอน
          </p>
        </header>

        <ul className="why-bazooka__grid">
          {reasons.map((item) => (
            <li key={item.title} className="why-bazooka__item">
              <span className="why-bazooka__icon">{item.icon}</span>
              <h3 className="why-bazooka__item-title">{item.title}</h3>
              <p className="why-bazooka__text">{item.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
