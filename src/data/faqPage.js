import {
  RETURN_CONTACT_SUMMARY,
  RETURN_POLICY,
  RETURN_POLICY_SUMMARY,
  SHIPPING_POLICY_SUMMARY,
} from './storePolicies';

export const FAQ_CATEGORIES = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'product-usage', label: 'การใช้งานผลิตภัณฑ์' },
  { id: 'shoe-care', label: 'การดูแลรองเท้า' },
  { id: 'ordering', label: 'การสั่งซื้อ' },
  { id: 'payment', label: 'การชำระเงิน' },
  { id: 'shipping', label: 'การจัดส่ง' },
  { id: 'returns', label: 'การคืนสินค้า' },
];

export const faqItems = [
  {
    id: 'shoe-types',
    category: 'shoe-care',
    question: 'รองเท้าผ้าใบสีขาวควรทำความสะอาดอย่างไร?',
    answer:
      'ปัดฝุ่นและเศษที่หลุดออกก่อน แล้วใช้โฟมทำความสะอาดรองเท้ากับคราบ หน้าสินค้า 126 ระบุว่าผ้าสีขาวให้ใช้ผ้าขาวชุบน้ำเช็ดฟองออก ก่อนเช็ดด้วยผ้าแห้งแล้วตาก ความเหลืองหรือคราบดำที่อยู่ในเนื้อผ้าอาจยังเหลือ โฟมขวดเดียวไม่มีแปรง แปรงขนอ่อนอยู่ในชุดโฟม 68',
    links: [
      { href: '/articles/white-canvas', label: 'วิธีทำความสะอาดรองเท้าผ้าใบสีขาว' },
      { href: '/products/126', label: 'โฟมทำความสะอาดรองเท้า' },
      { href: '/products/68', label: 'ชุดโฟมทำความสะอาดรองเท้า' },
    ],
  },
  {
    id: 'water-needed',
    category: 'shoe-care',
    question: 'ทำความสะอาดรองเท้าหนังกลับต้องทำอย่างไร?',
    answer:
      'ปัดฝุ่นด้วยด้านขนของแปรงหนังกลับ 2 in 1 ในทิศทางเดียวกัน แล้วใช้ด้านยางถูเบา ๆ เฉพาะคราบที่ฝัง ทำแบบแห้ง ไม่ต้องซัก และควรเลี่ยงน้ำปริมาณมาก เมื่อแห้งแล้วค่อยพ่นสเปรย์ปกป้อง คราบบางชนิดอาจยังเหลืออยู่',
    links: [
      { href: '/articles/suede-clean', label: 'วิธีทำความสะอาดรองเท้าหนังกลับ' },
      { href: '/products/130', label: 'แปรงทำความสะอาดหนังกลับ 2 in 1' },
      { href: '/articles/protect-refresh', label: 'สเปรย์กันน้ำรองเท้า' },
      { href: '/products/128', label: 'สเปรย์กันน้ำรองเท้า' },
    ],
  },
  {
    id: 'protector-benefits',
    category: 'product-usage',
    question: 'สเปรย์กันน้ำช่วยป้องกันอะไรได้บ้าง?',
    answer:
      'หน้าสินค้า 128 ระบุว่าช่วยให้ของเหลวไม่ซึม และช่วยป้องกันไม่ให้รองเท้าเลอะจากสิ่งสกปรกที่เป็นของเหลว วัสดุที่ระบุคือหนังแท้ หนังเทียม หนังกลับ และผ้า ใช้เมื่อรองเท้าสะอาดและแห้งแล้ว ไม่ได้ระบุว่าใช้ได้กับรองเท้าทุกประเภท',
    links: [
      { href: '/articles/protect-refresh', label: 'สเปรย์กันน้ำรองเท้า' },
      { href: '/products/128', label: 'สเปรย์กันน้ำรองเท้า' },
    ],
  },
  {
    id: 'protector-frequency',
    category: 'product-usage',
    question: 'สเปรย์กันน้ำควรพ่นห่างเท่าใด?',
    answer:
      'ไม่มีระยะพ่นเดียวสำหรับทุกรายการ ให้ดูวิธีใช้ของสินค้ารุ่นที่ซื้อ สินค้า 128, 143 และ 145 ระบุประมาณ 15–20 ซม. สินค้า 136 และ 147 ระบุประมาณ 10–20 ซม. ตัวเลข 20–30 นาทีบนสินค้า 128 เป็นเวลาพักก่อนพ่นทับ ไม่ใช่ระยะพ่น พ่นเมื่อรองเท้าสะอาดและแห้งแล้ว',
    links: [
      { href: '/articles/protect-refresh', label: 'สเปรย์กันน้ำรองเท้า' },
      { href: '/products/128', label: 'สเปรย์กันน้ำรองเท้า' },
      { href: '/products/143', label: 'สเปรย์กันน้ำรองเท้าแพ็กคู่' },
      { href: '/products/145', label: 'ชุดสเปรย์กันน้ำรองเท้าและแปรงหนังกลับ' },
      { href: '/products/136', label: 'ชุดทำความสะอาดรองเท้าและสเปรย์กันน้ำ' },
      { href: '/products/147', label: 'ชุดทำความสะอาดรองเท้า สเปรย์ดับกลิ่น และแปรงขนแข็ง' },
    ],
  },
  {
    id: 'deodorizer-effect',
    category: 'shoe-care',
    question: 'วิธีทำความสะอาดรองเท้าง่ายๆ ใน 3 ขั้นตอน',
    answer:
      'ไม่มีวิธีเดียวที่ใช้กับรองเท้าทุกประเภท โฟมทำความสะอาดใช้กับคราบบนวัสดุที่หน้าระบุ สเปรย์กันน้ำใช้เมื่อรองเท้าสะอาดและแห้งแล้ว สเปรย์ดับกลิ่นใช้กับกลิ่น ไม่ได้ล้างคราบ และไม่ได้ทำให้รองเท้าเปียกแห้ง ทั้งสามอย่างใช้แทนกันไม่ได้',
    links: [
      { href: '/articles/white-canvas', label: 'วิธีทำความสะอาดรองเท้าผ้าใบสีขาว' },
      { href: '/articles/suede-clean', label: 'วิธีทำความสะอาดรองเท้าหนังกลับ' },
      { href: '/articles/white-sneaker-restore', label: 'วิธีทำความสะอาดรองเท้าวิ่ง' },
      { href: '/articles/rain-wet-clean', label: 'วิธีทำความสะอาดรองเท้า ON CLOUD' },
      { href: '/articles/storage-odor-prevent', label: 'วิธีทำความสะอาดรองเท้าสตั๊ด' },
      { href: '/products/126', label: 'โฟมทำความสะอาดรองเท้า' },
      { href: '/products/128', label: 'สเปรย์กันน้ำรองเท้า' },
      { href: '/products/134', label: 'สเปรย์ดับกลิ่นรองเท้า' },
    ],
  },
  {
    id: 'sport-shoe-wash',
    category: 'shoe-care',
    question: 'วิธีซักรองเท้ากีฬา',
    answer:
      'ไม่มีวิธีซักเครื่องเดียวสำหรับรองเท้ากีฬาทุกชนิด คำแนะนำเรื่องซักเครื่องต้องดูชนิดรองเท้าและผู้ผลิต รองเท้าวิ่งในบทความ BAZOOKA ใช้โฟมกับคราบ รองเท้า ON CLOUD ตาม On ไม่ควรใส่รองเท้าทั้งคู่เข้าเครื่องซักผ้าหรือเครื่องอบ รองเท้าสตั๊ดให้แยกตามคำแนะนำของ Nike, adidas และ PUMA',
    links: [
      { href: '/articles/white-sneaker-restore', label: 'วิธีทำความสะอาดรองเท้าวิ่ง' },
      { href: '/articles/rain-wet-clean', label: 'วิธีทำความสะอาดรองเท้า ON CLOUD' },
      { href: '/articles/storage-odor-prevent', label: 'วิธีทำความสะอาดรองเท้าสตั๊ด' },
    ],
  },
  {
    id: 'suede-cleaning',
    category: 'product-usage',
    question: 'สเปรย์ดับกลิ่นรองเท้าใช้อย่างไร?',
    answer:
      'ฉีดสเปรย์ดับกลิ่นรองเท้า 134 ลงบนพื้นผิวที่ต้องการกำจัดกลิ่น และใช้เป็นประจำตามหน้าสินค้า สเปรย์นี้ดูแลกลิ่น ไม่ใช่น้ำยาล้างโคลน และไม่ได้ทำให้รองเท้าที่ยังเปียกแห้ง',
    links: [
      { href: '/articles/shoe-deodorize', label: 'วิธีกำจัดกลิ่นอับรองเท้า' },
      { href: '/products/134', label: 'สเปรย์ดับกลิ่นรองเท้า' },
    ],
  },
  {
    id: 'how-to-order',
    category: 'ordering',
    question: 'สั่งซื้อสินค้าบนเว็บไซต์อย่างไร?',
    answer:
      'เลือกสินค้าที่ต้องการ กดเพิ่มลงตะกร้า จากนั้นไปที่หน้า Checkout กรอกที่อยู่และช่องทางชำระเงินให้ครบถ้วน',
  },
  {
    id: 'order-edit',
    category: 'ordering',
    question: 'แก้ไขหรือยกเลิกคำสั่งซื้อได้หรือไม่?',
    answer:
      'หากออเดอร์ยังไม่เข้าสู่ขั้นตอนจัดส่ง สามารถติดต่อทีมงานเพื่อขอแก้ไขหรือยกเลิกได้โดยเร็วที่สุด',
  },
  {
    id: 'payment-methods',
    category: 'payment',
    question: 'รองรับการชำระเงินช่องทางใดบ้าง?',
    answer:
      'รองรับการชำระผ่านช่องทางที่แสดงในหน้า Checkout เช่น บัตรและช่องทางออนไลน์ที่ร้านเปิดใช้งาน',
  },
  {
    id: 'payment-failed',
    category: 'payment',
    question: 'ชำระเงินไม่สำเร็จต้องทำอย่างไร?',
    answer:
      'ตรวจสอบยอดและข้อมูลบัตรอีกครั้ง หรือลองช่องทางอื่น หากยังไม่สำเร็จ ให้ติดต่อทีมงานพร้อมเลขออเดอร์',
  },
  {
    id: 'shipping-time',
    category: 'shipping',
    question: 'ใช้เวลาจัดส่งนานแค่ไหน?',
    answer: SHIPPING_POLICY_SUMMARY,
  },
  {
    id: 'shipping-track',
    category: 'shipping',
    question: 'ติดตามพัสดุได้อย่างไร?',
    answer:
      'เมื่อพัสดุถูกส่งออก ระบบจะแจ้งหมายเลขติดตามให้ทางช่องทางที่ระบุไว้ในคำสั่งซื้อ',
  },
  {
    id: 'return-policy',
    category: 'returns',
    question: 'สามารถคืนสินค้าได้ในกรณีใดบ้าง?',
    answer: RETURN_POLICY_SUMMARY,
  },
  {
    id: 'return-process',
    category: 'returns',
    question: 'ขั้นตอนการคืนสินค้าเป็นอย่างไร?',
    answer: `${RETURN_POLICY.sections[0].items[0]} ${RETURN_CONTACT_SUMMARY}`,
  },
];
