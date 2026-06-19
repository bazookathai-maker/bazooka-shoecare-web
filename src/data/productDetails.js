import { findProductBySlug, homeFeaturedProducts } from './products';

const CATEGORY_LABELS = {
  cleaners: 'ทำความสะอาด',
  protectors: 'ปกป้อง',
  refresh: 'ฟื้นฟู',
  brushes: 'อุปกรณ์',
  kits: 'ชุดสุดคุ้ม',
};

const THAI_CATEGORY_TO_FILTER = {
  ทำความสะอาด: 'cleaners',
  ปกป้อง: 'protectors',
  ฟื้นฟู: 'refresh',
  อุปกรณ์: 'brushes',
  ชุดสุดคุ้ม: 'kits',
};

const SHARED_BEFORE_AFTER = {
  image: '/before-after/before-after.jpg',
  alt: 'รองเท้าก่อนและหลังการดูแลด้วย BAZOOKA',
  caption: 'ผลลัพธ์หลังพิธีการดูแล — สีสด รายละเอียดชัด',
};

const DEFAULT_REVIEWS = [
  {
    quote: 'คุณภาพดี ใช้ง่าย เหมาะกับรองเท้าพรีเมียมทุกวัน',
    author: 'ค. — กรุงเทพฯ',
  },
  {
    quote: 'บริการและสินค้าตรงตามที่โฆษณา แนะนำเลย',
    author: 'ม. — เชียงใหม่',
  },
  {
    quote: 'แบรนด์ที่ไว้ใจได้สำหรับคนรักสนีกเกอร์',
    author: 'ต. — ภูเก็ต',
  },
];

const CATEGORY_DEFAULTS = {
  cleaners: {
    benefits: ['สูตรอ่อนโยน', 'ทำความสะอาดลึก', 'ปลอดภัยต่อวัสดุพรีเมียม'],
    howToUse: [
      { step: '01', title: 'เตรียมรองเท้า', text: 'ปัดฝุ่นและทำความสะอาดเบื้องต้นก่อนใช้สูตร' },
      { step: '02', title: 'ใช้สูตรทำความสะอาด', text: 'ทาหรือพ่นตามคำแนะนำบนฉลาก ทิ้งไว้สั้น ๆ' },
      { step: '03', title: 'ขัดและเช็ด', text: 'ใช้แปรงหรือผ้าเช็ดเบา ๆ จนสะอาดและแห้ง' },
      { step: '04', title: 'ปกป้อง', text: 'ตามด้วยสเปรย์ปกป้องเพื่อยืดอายุการใช้งาน' },
    ],
    reviews: DEFAULT_REVIEWS,
  },
  protectors: {
    benefits: ['กันน้ำและคราบ', 'เคลือบเนียน', 'เหมาะกับการใช้งานจริงทุกวัน'],
    howToUse: [
      { step: '01', title: 'ทำความสะอาดก่อน', text: 'รองเท้าต้องสะอาดและแห้งสนิทก่อนพ่น' },
      { step: '02', title: 'พ่นทั่วพื้นผิว', text: 'พ่นสเปรย์ให้ทั่ว ระยะ 15–20 ซม.' },
      { step: '03', title: 'ปล่อยให้แห้ง', text: 'ทิ้งไว้ในที่อากาศถ่ายเท อย่างน้อย 30 นาที' },
      { step: '04', title: 'เคลือบซ้ำ', text: 'พ่นซ้ำ 1–2 ชั้นสำหรับการปกป้องสูงสุด' },
    ],
    reviews: [
      {
        quote: 'สเปรย์ปกป้องใช้ง่าย น้ำไม่ซึมหลังเคลือบ รองเท้าดูใหม่ตลอด',
        author: 'ม. — เชียงใหม่',
      },
      ...DEFAULT_REVIEWS.slice(1),
    ],
  },
  refresh: {
    benefits: ['ดับกลิ่นอย่างแท้จริง', 'หอมสดชื่น', 'พกพาสะดวก'],
    howToUse: [
      { step: '01', title: 'ทำความสะอาด', text: 'เช็ดรองเท้าให้สะอาดก่อนพ่นดับกลิ่น' },
      { step: '02', title: 'พ่นภายใน', text: 'พ่นภายในรองเท้าและจุดที่มีกลิ่น' },
      { step: '03', title: 'ระบายอากาศ', text: 'วางในที่แห้ง ปล่อยให้อากาศถ่ายเท' },
      { step: '04', title: 'ใช้ซ้ำตามต้องการ', text: 'พ่นซ้ำเมื่อใช้งานหนักหรือหลังออกกำลังกาย' },
    ],
    reviews: [
      {
        quote: 'ดับกลิ่นได้ดี ไม่ฉุนเกินไป ใช้หลังวิ่งแล้วสดชื่น',
        author: 'ต. — ภูเก็ต',
      },
      ...DEFAULT_REVIEWS.slice(1),
    ],
  },
  brushes: {
    benefits: ['ขนแปรงคุณภาพ', 'ขัดละเอียด', 'ช่วยยืดอายุรองเท้า'],
    howToUse: [
      { step: '01', title: 'เลือกแปรงที่เหมาะ', text: 'ใช้แปรงนุ่มกับผิวบน และแปรงแข็งกับพื้น' },
      { step: '02', title: 'ขัดเบา ๆ', text: 'ขัดเป็นวงกลม ไม่กดแรงเกินไป' },
      { step: '03', title: 'ทำความสะอาดแปรง', text: 'ล้างแปรงและปล่อยให้แห้งหลังใช้งาน' },
      { step: '04', title: 'เก็บรักษา', text: 'เก็บในที่แห้ง ห่างจากความชื้น' },
    ],
    reviews: DEFAULT_REVIEWS,
  },
  kits: {
    benefits: ['ครบในชุดเดียว', 'ประหยัดกว่าซื้อแยก', 'เหมาะกับการดูแลประจำ'],
    howToUse: [
      { step: '01', title: 'ทำความสะอาด', text: 'เริ่มด้วยคลีนเนอร์ตามขั้นตอนมาตรฐาน' },
      { step: '02', title: 'ฟื้นฟู / ดับกลิ่น', text: 'ใช้สเปรย์รีเฟรชหรือสูตรเสริมตามชุด' },
      { step: '03', title: 'ปกป้อง', text: 'เคลือบด้วยสเปรย์กันน้ำเมื่อแห้งสนิท' },
      { step: '04', title: 'ดูแลซ้ำ', text: 'ทำซ้ำตามความถี่การใช้งาน' },
    ],
    reviews: DEFAULT_REVIEWS,
  },
};

/** Core products — display-only with Add to Cart; no PDP or card navigation */
export const PRODUCTS_WITHOUT_DETAIL_PAGE = [
  'organic-cleaner',
  'protector-spray',
  'refresh-spray',
];

export function isDisplayOnlyProduct(slug) {
  return Boolean(slug && PRODUCTS_WITHOUT_DETAIL_PAGE.includes(slug));
}

const FEATURED_OVERRIDES = {};

function resolveFilterCategory(product) {
  if (product.filterCategory) return product.filterCategory;
  return THAI_CATEGORY_TO_FILTER[product.category] ?? 'kits';
}

function buildGallery(product, overrideGallery) {
  if (overrideGallery?.length) return overrideGallery;
  return [{ src: product.image, alt: product.name }];
}

function buildProductDetail(slug) {
  const product = findProductBySlug(slug);
  if (!product) return null;

  const override = FEATURED_OVERRIDES[slug];
  const filterCategory = resolveFilterCategory(product);
  const defaults = CATEGORY_DEFAULTS[filterCategory] ?? CATEGORY_DEFAULTS.kits;
  const gallery = buildGallery(product, override?.gallery);

  const cleaningGallery =
    override?.cleaningGallery ??
    [
      ...gallery.map((img) => ({
        src: img.src,
        alt: img.alt,
        caption: img.alt,
      })),
      {
        src: SHARED_BEFORE_AFTER.image,
        alt: SHARED_BEFORE_AFTER.alt,
        caption: SHARED_BEFORE_AFTER.caption,
      },
    ];

  return {
    slug,
    id: product.id,
    name: override?.name ?? product.name,
    breadcrumbLabel: override?.breadcrumbLabel ?? override?.name ?? product.name,
    category:
      override?.category ??
      CATEGORY_LABELS[filterCategory] ??
      product.category,
    description: override?.description ?? product.description,
    usageIntro:
      override?.usageIntro ??
      'แนะนำวิธีใช้งาน ภาพประกอบ และวิดีโอ — สำหรับการดูแลรองเท้าอย่างถูกต้อง',
    gallery,
    cleaningGallery,
    benefits: override?.benefits ?? defaults.benefits ?? [],
    howToUse: override?.howToUse ?? defaults.howToUse,
    beforeAfter: SHARED_BEFORE_AFTER,
    recommended: homeFeaturedProducts
      .filter((p) => p.slug !== slug)
      .map((p) => ({
        slug: p.slug,
        name: p.name,
        description: p.description,
        image: p.image,
        category: p.category,
      })),
    video: {
      title: 'วิดีโอวิธีทำความสะอาด',
      caption: override?.videoCaption ?? 'พิธีการดูแลรองเท้าแบบมืออาชีพ',
      poster: override?.videoPoster ?? gallery[0].src,
      src: override?.videoSrc ?? null,
      cinematic: override?.videoCinematic ?? false,
      fullWidth: override?.videoFullWidth ?? false,
      portrait: override?.videoPortrait ?? false,
    },
  };
}

export function getProductDetailBySlug(slug) {
  if (!slug || isDisplayOnlyProduct(slug)) return null;
  return buildProductDetail(slug);
}

