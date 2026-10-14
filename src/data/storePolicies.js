import { CONTACT_EMAIL } from './contact';

export const LINE_ID = '@bazookath';
export const LINE_URL = 'https://line.me/R/ti/p/@bazookath';

/**
 * Single source for the shipping and return policies: the policy pages, FAQ answers, pre-render and
 * structured data all read from here, so customers and Google see the same terms.
 */
export const SHIPPING_POLICY = {
  key: 'shippingPolicy',
  path: '/shipping-policy',
  title: 'นโยบายการจัดส่ง',
  description:
    'นโยบายการจัดส่ง BAZOOKA ส่งฟรีทั่วประเทศไทย เตรียมสินค้าภายใน 1 วัน ขนส่งประมาณ 3–5 วันหลังส่งสินค้าออก นับรวมวันเสาร์–อาทิตย์',
  sections: [
    {
      heading: 'ค่าจัดส่ง',
      items: ['ส่งฟรีทั่วประเทศไทย ค่าจัดส่ง 0 บาท'],
    },
    {
      heading: 'ระยะเวลาจัดส่ง',
      items: [
        'เตรียมสินค้าภายใน 1 วัน',
        'ขนส่งประมาณ 3–5 วันหลังส่งสินค้าออก',
        'ระยะเวลาทั้งหมดนับรวมวันเสาร์–อาทิตย์',
      ],
    },
  ],
  structured: {
    country: 'TH',
    rate: 0,
    currency: 'THB',
    handlingDays: { min: 0, max: 1 },
    transitDays: { min: 3, max: 5 },
    allDaysOfWeek: true,
  },
};

export const RETURN_POLICY = {
  key: 'returnPolicy',
  path: '/return-policy',
  title: 'นโยบายการคืนและเปลี่ยนสินค้า',
  description:
    'นโยบายการคืนและเปลี่ยนสินค้า BAZOOKA แจ้งภายใน 7 วันนับจากวันที่ได้รับสินค้า กรณีสินค้าเสียหายจากการขนส่งหรือมีปัญหาด้านคุณภาพ',
  sections: [
    {
      heading: 'ระยะเวลาแจ้ง',
      items: ['แจ้งภายใน 7 วันนับจากวันที่ได้รับสินค้า'],
    },
    {
      heading: 'กรณีที่รับคืนหรือเปลี่ยนสินค้า',
      items: [
        'สินค้าเสียหายจากการขนส่ง เช่น ฝาแตก ขวดยุบ น้ำยารั่ว',
        'สินค้ามีปัญหาด้านคุณภาพ เช่น ใช้งานไม่ได้ตามประสิทธิภาพที่ระบุ หรือน้ำยา/สเปรย์มีกลิ่นผิดปกติ',
      ],
    },
    {
      heading: 'การเปลี่ยนสินค้าหรือคืนเงิน',
      items: [
        'ลูกค้าเลือกเปลี่ยนสินค้าหรือรับเงินคืนได้อย่างใดอย่างหนึ่ง',
        'ลูกค้าเป็นผู้ออกค่าจัดส่งสินค้าคืน',
      ],
    },
  ],
  contacts: [
    { id: 'line', label: 'LINE', value: LINE_ID, href: LINE_URL, external: true },
    { id: 'email', label: 'อีเมล', value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
  ],
};

export const STORE_POLICIES = [SHIPPING_POLICY, RETURN_POLICY];

export const SHIPPING_POLICY_SUMMARY = SHIPPING_POLICY.sections.flatMap((section) => section.items).join(' ');

export const RETURN_POLICY_SUMMARY = [
  RETURN_POLICY.sections[0].items[0],
  `ในกรณี${RETURN_POLICY.sections[1].items.join(' หรือ')}`,
  ...RETURN_POLICY.sections[2].items,
].join(' ');

export const RETURN_CONTACT_SUMMARY = `ติดต่อ LINE ${LINE_ID} หรืออีเมล ${CONTACT_EMAIL}`;
