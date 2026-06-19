import './AboutBrand.css';

export default function AboutBrand() {
  return (
    <section className="about" id="about">
      <div className="container about__inner">
        <div className="about__visual" aria-hidden="true">
          <div className="about__frame">
            <span className="about__monogram">B</span>
          </div>
        </div>

        <div className="about__content">
          <p className="section-label">เรื่องราวของเรา</p>
          <h2 className="section-title">
            สร้างสรรค์สำหรับผู้ที่ใส่ใจอย่างแท้จริง
          </h2>
          <div className="about__text">
            <p>
              BAZOOKA คือแบรนด์ดูแลรองเท้าสนีกเกอร์ระดับพรีเมียม
              จากความเชื่อที่ว่ารองเท้าของคุณสมควรได้รับความใส่ใจเท่ากับเสื้อผ้าชิ้นอื่น ๆ
              เราคัดสูตรด้วยส่วนผสมที่ผ่านการทดสอบ ปลอดภัยต่อวัสดุ
              แต่ทรงพลังต่อคราบ
            </p>
            <p>
              ตั้งแต่การฟื้นฟูประจำวันจนถึงการดูแลลึก
              คอลเลกชันของเราออกแบบมาสำหรับนักสะสม ผู้หลงใหลรองเท้า
              และทุกคนที่ไม่ยอมปล่อยให้คู่โปรดซีดจาง
              สะอาด · ฟื้นฟู · ปกป้อง — นี่คือพิธีการของ BAZOOKA
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
