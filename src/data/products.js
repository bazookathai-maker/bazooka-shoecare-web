import { shopProductSlugs } from './productSlugs';

/** Listing artwork — products page only (27 images) */
const listingImages = [
  '/products/product-1.jpg.jpg',
  '/products/product-2.jpg.png',
  '/products/product-3.jpg.png',
  '/products/product-4.jpg.png',
  '/products/product-5.jpg.jpg',
  '/products/product-6.jpg.png',
  '/products/product-7.jpg.png',
  '/products/product-8.jpg.png',
  '/products/product-9.jpg.png',
  '/products/product-10.jpg.png',
  '/products/product-11.jpg.png',
  '/products/product-12.jpg.png',
  '/products/product-13.jpg.png',
  '/products/product-14.jpg.png',
  '/products/product-15.jpg.png',
  '/products/product-16.jpg.jpg',
  '/products/product-17.jpg.jpg',
  '/products/product-18.jpg.png',
  '/products/product-19.jpg.png',
  '/products/product-20.jpg.png',
  '/products/product-21.jpg.jpg',
  '/products/product-22.jpg.png',
  '/products/product-23.jpg.PNG',
  '/products/product-24.jpg.png',
  '/products/product-25.jpg.jpg',
  '/products/product-26.jpg.jpg',
  '/products/product-27.jpg.jpg',
];

const productCatalog = [
  {
    name: 'ออร์แกนิก คลีนเนอร์',
    slug: 'organic-cleaner',
    description:
      'น้ำยาทำความสะอาดรองเท้าแบบแห้ง\nสูตรจากธรรมชาติ ไม่มีสารเคมี',
    price: 350,
    category: 'ทำความสะอาด',
  },
  {
    name: 'BAZOOKA\nโปรจับคู่',
    description:
      '(แปรงขัดหนังกลับ+\nสเปรย์กันน้ำ)\nBAZOOKA ทำความสะอาดรองเท้าหนังกลับ\nแบบไม่ต้องซักน้ำ',
    price: 830,
    category: 'ชุดสุดคุ้ม',
  },
  {
    name: 'BAZOOKA\nคลีนเนอร์',
    description: 'ชุดคลีนเนอร์(PRO1)+สเปรย์ดับกลิ่น',
    price: 530,
    category: 'ชุดสุดคุ้ม',
  },
  {
    name: 'แปรงขัดรองเท้า',
    description:
      'แปรงรองเท้าพรีเมียม\n*แถมฟรี*\nแปรงพื้นรองเท้า',
    price: 110,
    category: 'อุปกรณ์',
  },
  {
    name: 'BAZOOKA\nคลีนเนอร์',
    description:
      'น้ำยาทำความสะอาดรองเท้าแบบแห้ง\nสูตรจากธรรมชาติ ฟรี ผ้าแปรง',
    price: 495,
    category: 'ทำความสะอาด',
  },
  {
    name: 'ชุดคลีนเนอร์ Pro1 พร้อมปากกากันขอบเหลือง',
    description: '(ชุดทำความสะอาด+ปากกากันเหลือง)',
    price: 595,
    category: 'ชุดสุดคุ้ม',
  },
  {
    name: 'ชุดคลีนเนอร์ Pro1 พร้อมปากกาขอบขาว',
    description: '(โปร1ชุดทำความสะอาด+ปากกาขอบขาว 1 แถม 1)',
    price: 560,
    category: 'ชุดสุดคุ้ม',
  },
  {
    name: 'BAZOOKA\nสเปรย์ x 2\nBAZOOKA\nคลีนเนอร์',
    description: 'ชุดทำความสะอาดรองเท้า (PRO2)',
    price: 1185,
    category: 'ชุดสุดคุ้ม',
  },
  {
    name: 'ชุดสเปรย์และคลีนเนอร์ พร้อมปากกากันขอบเหลือง',
    description:
      '(สเปรย์กันน้ำและชุดทำความสะอาด+ปากกากันเหลือง)',
    price: 899,
    category: 'ชุดสุดคุ้ม',
  },
  {
    name: 'ชุดสเปรย์และคลีนเนอร์ พร้อมปากกาขอบขาว',
    description:
      '(โปร2 สเปรย์กันน้ำและชุดทำความสะอาด+ปากกาขอบขาว 1 แถม 1)',
    price: 870,
    category: 'ชุดสุดคุ้ม',
  },
  {
    name: 'BAZOOKA\nสเปรย์ x 2',
    description:
      'สเปรย์กันน้ำ เคลือบกันสิ่งสกปรกจากของเหลว\nสูตรจากญี่ปุ่น(1แถม1)',
    price: 650,
    category: 'ปกป้อง',
  },
  {
    name: 'BAZOOKA\nสเปรย์ x 2\nBAZOOKA\nคลีนเนอร์',
    description: 'พร้อมชุดทำความสะอาด (PRO3+PRO1)',
    price: 960,
    category: 'ชุดสุดคุ้ม',
  },
  {
    name: 'สเปรย์BAZOOKA พร้อมปากกากันขอบเหลือง',
    description: '( สเปรย์เคลือบกันน้ำ 2 กระป๋อง +ปากกากันเหลือง)',
    price: 869,
    category: 'ปกป้อง',
  },
  {
    name: 'สเปรย์BAZOOKA พร้อมปากกาขอบขาว',
    description: '(สเปรย์เคลือบกันน้ำ 2 กระป๋อง +ปากกาขอบขาว 1 แถม 1)',
    price: 845,
    category: 'ปกป้อง',
  },
  {
    name: 'BAZOOKA คลีนเนอร์ 2 ขวด',
    description: '(น้ำยาทำความสะอาดรองเท้า 2ขวด+ผ้าและแปรง)',
    price: 549,
    category: 'ทำความสะอาด',
  },
  {
    name: 'สเปรย์รีเฟรช',
    description:
      'สเปรย์ดับกลิ่น รองเท้า เสื้อผ้า อเนกประสงค์\nแบบพกพา',
    price: 175,
    category: 'ฟื้นฟู',
  },
  {
    name: 'แปรงพื้นรองเท้า (ขนแข็ง)',
    description: 'ขัดขอบหรือพื้นรองเท้า',
    price: 79,
    category: 'อุปกรณ์',
  },
  {
    name: 'BAZOOKA\nสเปรย์ x 2',
    description: 'สเปรย์เคลือบกันน้ำรองเท้า',
    price: 395,
    category: 'ปกป้อง',
  },
  {
    name: 'ปากกาขอบรองเท้าสีขาว',
    description: 'ปากกาเขียนขอบรองเท้า\n(แก้โฟม/บูสต์ เหลือง)',
    price: 270,
    category: 'อุปกรณ์',
  },
  {
    name: 'จับคู่ปากกาเขียนขอบรองเท้า',
    description: '(1แถม1)\nปากกากันขอบ+ขอบขาว',
    price: 290,
    category: 'ชุดสุดคุ้ม',
  },
  {
    name: 'แปรงขัดรองเท้า',
    description: 'แปรงรองเท้าพรีเมียม',
    price: 89,
    category: 'อุปกรณ์',
  },
  {
    name: 'ปากกากันขอบรองเท้าเหลือง',
    description: '(1แถม1)\n(ปากกากันเหลือง)',
    price: 290,
    category: 'ชุดสุดคุ้ม',
  },
  {
    name: 'แปรงขัดหนังกลับ 2 ใน 1',
    description:
      'BAZOOKA ทำความสะอาดรองเท้าหนังกลับ\nแบบไม่ต้องซักน้ำ ช่วยถนอมผิวรองเท้า',
    price: 169,
    category: 'อุปกรณ์',
  },
  {
    name: 'ผ้าไมโครไฟเบอร์ Pro สีขาว',
    description: '',
    price: 95,
    category: 'อุปกรณ์',
  },
  {
    name: 'ซื้อ 2 แถม 1 สเปรย์รีเฟรช',
    description: 'สเปรย์ดับกลิ่น รองเท้า เสื้อผ้า แบบพกพา',
    price: 320,
    category: 'ฟื้นฟู',
  },
  {
    name: 'โปรครบเซ็ต BAZOOKA\nสเปรย์ x 2\nคลีนเนอร์',
    description: 'ชุดทำความสะอาดรองเท้า+สเปรย์ดับกลิ่น',
    price: 719,
    category: 'ชุดสุดคุ้ม',
  },
  {
    name: 'ชุดครบเซ็ต BAZOOKA',
    description:
      'ชุดทำความสะอาดรองเท้า+สเปรย์ดับกลิ่น+แปรงขนแข็ง',
    price: 730,
    category: 'ชุดสุดคุ้ม',
  },
];

/** Home page — single bottle shots only */
export const homeFeaturedProducts = [
  {
    id: 'home-organic-cleaner',
    slug: 'organic-cleaner',
    name: 'ออร์แกนิก คลีนเนอร์',
    description: 'โฟมทำความสะอาด\nสูตรออร์แกนิก',
    useCase: 'เหมาะกับ: Suede, Canvas, Mesh',
    price: 890,
    category: 'ทำความสะอาด',
    image: '/products/organic-cleaner.jpg.jpg',
    imageFit: 'cover',
  },
  {
    id: 'home-protector-spray',
    slug: 'protector-spray',
    name: 'สเปรย์ปกป้อง',
    description: 'สเปรย์ปกป้องรองเท้า\nกันน้ำ กันคราบ',
    useCase: 'เหมาะกับ: Leather, Suede, Canvas',
    price: 790,
    category: 'ปกป้อง',
    image: '/products/protector-spray.jpg.jpg',
    imageFit: 'cover',
  },
  {
    id: 'home-refresh-spray',
    slug: 'refresh-spray',
    name: 'สเปรย์รีเฟรช',
    description: 'สเปรย์ดับกลิ่น\nหอมสดชื่น ลดกลิ่นอับ',
    useCase: 'เหมาะกับ: Sneakers, Gym Shoes, Daily Wear',
    price: 690,
    category: 'ฟื้นฟู',
    image: '/products/refresh-spray.jpg.jpg',
    imageFit: 'cover',
  },
];

/** Recommended / bestseller listings — shared with /recommended page */
export const BESTSELLER_LISTING_IMAGES = [
  '/products/product-26.jpg.jpg',
  '/products/product-8.jpg.png',
  '/products/product-2.jpg.png',
  '/products/product-11.jpg.png',
  '/products/product-5.jpg.jpg',
  '/products/product-23.jpg.PNG',
];

/** Shop filter categories (27 products) — counts: 3 / 2 / 2 / 14 / 6 */
const shopFilterCategories = [
  'cleaners', // 1 Organic Cleaner
  'kits', // 2 โปรจับคู่
  'kits', // 3 BAZOOKA คลีนเนอร์ ชุด
  'brushes', // 4 Premium Brush Set
  'cleaners', // 5 BAZOOKA คลีนเนอร์ + ผ้าแปรง
  'kits', // 6 BAZOOKA Cleaner Pro1 ชุด
  'kits', // 7 BAZOOKA Cleaner Pro1 Whiter
  'kits', // 8 BAZOOKA สเปรย์+ CLEANER PRO2
  'kits', // 9 BAZOOKA Spray + Cleaner ชุด
  'kits', // 10 BAZOOKA Spray + Cleaner whiter
  'protectors', // 11 BAZOOKA สเปรย์
  'kits', // 12 BAZOOKA สเปรย์ 1 แถม 1 + CLEANER
  'kits', // 13 BAZOOKA spray + Midsole Protector
  'kits', // 14 BAZOOKA spray + Midsole whiter
  'cleaners', // 15 BAZOOKA Cleaner 2
  'refresh', // 16 Refresh Spray
  'brushes', // 17 แปรงพื้นรองเท้า
  'protectors', // 18 BAZOOKA สเปรย์
  'brushes', // 19 BAZOOKA Midsole Whiter
  'kits', // 20 จับคู่ปากกา ปากกากันขอบ+ขอบขาว
  'brushes', // 21 แปรงขัดรองเท้า Premium
  'kits', // 22 BAZOOKA Midsole Protector 1แถม1
  'brushes', // 23 แปรงขัดหนังกลับ 2-in-1
  'brushes', // 24 ผ้าไมโครไฟเบอร์ Pro
  'refresh', // 25 ซื้อ 2 แถม 1 Refresh Spray
  'kits', // 26 โปรครบเซ็ต BAZOOKA สเปรย์+CLEANER
  'kits', // 27 SET COMPLETE BAZOOKA
];

export const PRODUCT_FILTER_TABS = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'bestsellers', label: 'สินค้าขายดี' },
  { id: 'cleaners', label: 'Cleaner' },
  { id: 'protectors', label: 'Protect' },
  { id: 'refresh', label: 'Refresh' },
  { id: 'kits', label: 'ครบเซต' },
  { id: 'brushes', label: 'แปรง&ผ้า&ปากกา' },
];

export function matchesProductFilter(product, filterId) {
  if (filterId === 'all') return true;
  if (filterId === 'bestsellers') return product.isBestseller;
  return product.filterCategory === filterId;
}

/** Products page — listing artwork only (27 cards) */
export const allProducts = productCatalog.map((item, index) => ({
  id: `product-${index + 1}`,
  slug: item.slug ?? shopProductSlugs[index],
  image: listingImages[index],
  imageFit: 'contain',
  filterCategory: shopFilterCategories[index],
  isBestseller: BESTSELLER_LISTING_IMAGES.includes(listingImages[index]),
  ...item,
}));

/** Lookup by URL slug (shop + home featured bottles) */
export function findProductBySlug(slug) {
  return (
    allProducts.find((p) => p.slug === slug) ??
    homeFeaturedProducts.find((p) => p.slug === slug) ??
    null
  );
}

/** Lookup by listing / bottle image (articles, recommendations) */
export function findProductByImage(image) {
  return (
    allProducts.find((p) => p.image === image) ??
    homeFeaturedProducts.find((p) => p.image === image) ??
    null
  );
}
