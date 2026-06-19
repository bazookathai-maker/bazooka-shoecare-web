/** Homepage storytelling content & media */
export const homeHero = {
  poster: '/herojpg.png',
  video: '/videos/hero-loop.mp4',
};

/** Our Products — 3 main systems (directly after Hero) */
export const homeOurProducts = [
  {
    id: 'cleaner',
    slug: 'organic-cleaner',
    name: 'Bazooka Cleaner',
    benefit: 'น้ำยาทำความสะอาดรองเท้าแบบแห้ง\nสูตรจากธรรมชาติ ไม่มีสารเคมี',
    image: '/products/organic-cleaner.jpg.jpg',
    label: 'Clean',
  },
  {
    id: 'protector',
    slug: 'protector-spray',
    name: 'Protector Spray',
    benefit: 'สเปรย์ปกป้องรองเท้า\nกันน้ำ กันคราบ พร้อมใช้ทุกวัน',
    image: '/products/protector-spray.jpg.jpg',
    label: 'Protect',
  },
  {
    id: 'refresh',
    slug: 'refresh-spray',
    name: 'Refresh Spray',
    benefit: 'สเปรย์ดับกลิ่นรองเท้า\nหอมสดชื่น ลดกลิ่นอับ',
    image: '/products/refresh-spray.jpg.jpg',
    label: 'Refresh',
  },
];

/** Top Picks — recommended products after Our Products carousel */
export const homeTopPicks = [
  {
    id: 'complete-spray-cleaner-pro',
    name: 'โปรครบเซ็ต BAZOOKA\nสเปรย์ x 2\nคลีนเนอร์',
    description: 'ชุดทำความสะอาดรองเท้า + สเปรย์ดับกลิ่น',
    price: 719,
    badge: 'BEST SELLER',
    image: '/products/product-26.jpg.jpg',
    fallback: '/products/product-16.jpg.jpg',
    href: '/products/complete-spray-cleaner-pro',
  },
  {
    id: 'set-complete-bazooka',
    name: 'ชุดครบเซ็ต BAZOOKA',
    description: 'ชุดทำความสะอาดรองเท้า + สเปรย์ดับกลิ่น + แปรงขนแข็ง',
    price: 730,
    badge: 'COMPLETE SET',
    image: '/products/product-27.jpg.jpg',
    fallback: '/products/product-16.jpg.jpg',
    href: '/products/set-complete-bazooka',
  },
  {
    id: 'spray-cleaner-pro2',
    name: 'BAZOOKA\nสเปรย์ x 2\nBAZOOKA\nคลีนเนอร์',
    description: 'ชุดทำความสะอาดรองเท้า (PRO2)',
    price: 1185,
    badge: 'RECOMMENDED',
    image: '/products/product-8.jpg.png',
    fallback: '/products/product-16.jpg.jpg',
    href: '/products/spray-cleaner-pro2',
  },
  {
    id: 'bazooka-spray-twin-pack',
    name: 'BAZOOKA\nสเปรย์ x 2',
    description:
      'สเปรย์กันน้ำ เคลือบกันสิ่งสกปรกจากของเหลว สูตรจากญี่ปุ่น (1 แถม 1)',
    price: 650,
    badge: 'DAILY CARE',
    image: '/products/product-11.jpg.png',
    fallback: '/products/product-10.jpg.png',
    href: '/products/bazooka-spray-twin-pack',
  },
  {
    id: 'promo-pair-bundle',
    name: 'BAZOOKA\nโปรจับคู่',
    description:
      '(แปรงขัดหนังกลับ +\nสเปรย์กันน้ำ)\nBAZOOKA ทำความสะอาดรองเท้าหนังกลับแบบไม่ต้องซักน้ำ',
    price: 830,
    badge: 'RECOMMENDED',
    image: '/products/product-2.jpg.png',
    fallback: '/products/product-3.jpg.png',
    href: '/products/promo-pair-bundle',
  },
  {
    id: 'bazooka-cleaner-cloth-brush',
    name: 'BAZOOKA\nคลีนเนอร์',
    description:
      'น้ำยาทำความสะอาดรองเท้าแบบแห้ง สูตรจากธรรมชาติ ฟรี ผ้าแปรง',
    price: 495,
    badge: 'RECOMMENDED',
    image: '/products/product-5.jpg.jpg',
    fallback: '/products/organic-cleaner.jpg.jpg',
    href: '/products/bazooka-cleaner-cloth-brush',
  },
];

/** Article slider — HOW TO CARE section */
export const articleSlides = [
  { image: '/images/how-to/article-cover-1.jpg' },
  { image: '/images/how-to/article-cover-2.jpg' },
];

/** How To Care — editorial category cards */
export const homeHowToCare = [
  {
    id: 'articles',
    title: 'บทความ',
    subtitle: 'เคล็ดลับดูแลรองเท้าคู่โปรด',
    cta: 'อ่านเพิ่มเติม',
    href: '/articles',
    slides: articleSlides,
  },
  {
    id: 'how-to',
    title: 'วิธีการใช้',
    subtitle: 'เรียนรู้การใช้งานผลิตภัณฑ์ BAZOOKA',
    cta: 'ดูวิธีใช้',
    href: '/how-to',
    image: '/images/how-to/howto-step-1.png',
  },
];

/** Problem section — sneaker wear storytelling */
export const problemCloseups = [
  {
    id: 'stain',
    caption: 'คราบบนพื้นขาว',
    image: '/images/problem/stain-white.jpg',
    fallback: '/products/cleaner-howto-2.jpg',
    size: 'large',
  },
  {
    id: 'mesh',
    caption: 'ฝุ่นในผ้าเมช',
    image: '/images/problem/mesh-dust.jpg',
    fallback: '/products/cleaner-howto-1.jpg',
    size: 'medium',
  },
  {
    id: 'mud',
    caption: 'โคลนที่พื้นรองเท้า',
    image: '/images/problem/mud-sole.jpg',
    fallback: '/products/refresh-howto-2.jpg',
    size: 'medium',
  },
  {
    id: 'wear',
    caption: 'ผิวที่เริ่มเสื่อม',
    image: '/images/problem/worn-texture.jpg',
    fallback: '/products/protector-howto-2.jpg',
    size: 'small',
  },
  {
    id: 'odor',
    caption: 'ความชื้นในกระเป๋า',
    image: '/images/problem/bag-odor.jpg',
    fallback: '/products/refresh-howto-1.jpg',
    size: 'small',
  },
  {
    id: 'damage',
    caption: 'ร่องรอยจากชีวิตจริง',
    image: '/images/problem/daily-wear.jpg',
    fallback: '/products/cleaner-howto-2.jpg',
    size: 'large',
  },
];

export const problemLifestyle = {
  image: '/images/problem/lifestyle-moment.jpg',
  fallback: '/herojpg.png',
  eyebrow: 'ชีวิตจริง',
  quote: 'รองเท้าที่คุณใส่ทุกวัน\nไม่เคยหยุดเดิน',
  detail:
    'เมือง ฝน กาแฟ การเดินทาง — ทุกช่วงเวลาทิ้งร่องรอยที่มองไม่เห็นจนกว่าจะสายเกินไป',
};

export const storyPillars = [
  {
    step: 'ทำความสะอาด',
    name: 'ออร์แกนิก คลีนเนอร์',
    text: 'ทำความสะอาดแบบแห้ง อ่อนโยนต่อหนังกลับ หนัง และผ้า',
    image: '/products/organic-cleaner.jpg.jpg',
    poster: '/products/cleaner-howto-1.jpg',
    video: '/videos/cleaner-howto.mp4',
    showDetailLink: false,
  },
  {
    step: 'ปกป้อง',
    name: 'สเปรย์ปกป้อง',
    text: 'เคลือบป้องกันน้ำและคราบ ให้รองเท้าพร้อมทุกสถานการณ์',
    image: '/products/protector-spray.jpg.jpg',
    poster: '/products/protector-howto-1.jpg',
    video: '/videos/protector-howto.mp4',
    showDetailLink: false,
  },
  {
    step: 'ฟื้นฟู',
    name: 'สเปรย์รีเฟรช',
    text: 'ดับกลิ่นและฟื้นฟูความสด ระหว่างการใส่ซ้ำ',
    image: '/products/refresh-spray.jpg.jpg',
    poster: '/products/refresh-howto-1.jpg',
    video: '/videos/refresh-howto.mp4',
    showDetailLink: false,
  },
];

export const productCategories = [
  {
    id: 'cleaners',
    label: 'ทำความสะอาด',
    title: 'ผลิตภัณฑ์ทำความสะอาด',
    text: 'สูตรทำความสะอาดอ่อนโยน สำหรับทุกวัสดุ',
    image: '/products/organic-cleaner.jpg.jpg',
    href: '/products',
  },
  {
    id: 'protectors',
    label: 'ปกป้อง',
    title: 'ผลิตภัณฑ์ปกป้อง',
    text: 'เคลือบปกป้องน้ำและคราบในชีวิตจริง',
    image: '/products/protector-spray.jpg.jpg',
    href: '/products',
  },
  {
    id: 'refresh',
    label: 'ฟื้นฟู',
    title: 'ผลิตภัณฑ์ฟื้นฟู',
    text: 'ดับกลิ่น ฟื้นฟูความสดระหว่างวัน',
    image: '/products/refresh-spray.jpg.jpg',
    href: '/products',
  },
  {
    id: 'kits',
    label: 'ครบเซ็ต',
    title: 'ชุดและอุปกรณ์',
    text: 'ชุดดูแลครบ และอุปกรณ์เสริม',
    image: '/products/product-16.jpg.jpg',
    href: '/products',
  },
];

/** How it works — cinematic ritual intro */
export const ritualCinematicVideo = {
  src: '/videos/ritual-cinematic.mp4',
  fallback: '/videos/cleaner-howto.mp4',
  poster: '/products/cleaner-howto-1.jpg',
};

export const storySteps = [
  {
    title: 'เตรียมรองเท้า',
    text: 'ปัดฝุ่นและทำความสะอาดเบื้องต้นก่อนเริ่มพิธีการดูแล',
    image: '/products/cleaner-howto-1.jpg',
  },
  {
    title: 'ทำความสะอาด',
    text: 'ใช้คลีนเนอร์ตามวัสดุ ขัดเบา ๆ แล้วปล่อยให้แห้ง',
    image: '/products/cleaner-howto-2.jpg',
  },
  {
    title: 'เคลือบปกป้อง',
    text: 'พ่นสเปรย์ปกป้องเมื่อแห้งสนิท เพื่อกันน้ำและคราบในชีวิตจริง',
    image: '/products/protector-howto-2.jpg',
  },
  {
    title: 'ฟื้นฟู & ดับกลิ่น',
    text: 'สเปรย์รีเฟรชระหว่างใส่ซ้ำ — สด สะอาด พร้อมออกจากบ้าน',
    image: '/products/refresh-howto-2.jpg',
  },
];

/** Snap Shot — fullscreen white sneaker pause */
export const snapShot = {
  image: '/images/snapshot/white-sneakers.jpg',
  fallback: '/products/cleaner-howto-2.jpg',
};

/** Lifestyle scenes */
export const lifestyleScenes = [
  {
    id: 'urban',
    label: 'URBAN',
    layout: 'hero',
    image: '/images/lifestyle/urban.jpg',
    fallback: '/products/cleaner-howto-2.jpg',
  },
  {
    id: 'cafe',
    label: 'CAFE',
    layout: 'tall',
    image: '/images/lifestyle/cafe.jpg',
    fallback: '/products/refresh-howto-1.jpg',
  },
  {
    id: 'travel',
    label: 'TRAVEL',
    layout: 'tall',
    image: '/images/lifestyle/travel.jpg',
    fallback: '/products/refresh-howto-2.jpg',
  },
  {
    id: 'studio',
    label: 'STUDIO',
    layout: 'wide',
    image: '/images/lifestyle/studio.jpg',
    fallback: '/products/protector-howto-2.jpg',
  },
];

export const lifestyleMotion = {
  poster: '/products/refresh-howto-1.jpg',
  video: '/videos/lifestyle-motion.mp4',
};

/** Homepage review videos — community row */
const HOME_REVIEW_VIDEO_ALLOWLIST = new Set([
  '/videos/reviews/review-1.mp4',
  '/videos/reviews/review-2.mp4',
  '/videos/reviews/review-3.mp4',
  '/videos/reviews/review-4.mp4',
  '/videos/reviews/review-6.mp4',
]);

const allHomeReviewVideos = [
  { src: '/videos/reviews/review-1.mp4', handle: '@bazooka.review', quote: 'รีวิวจากผู้ใช้จริง' },
  { src: '/videos/reviews/review-2.mp4', handle: '@bazooka.review', quote: 'รีวิวจากผู้ใช้จริง' },
  { src: '/videos/reviews/review-3.mp4', handle: '@bazooka.review', quote: 'รีวิวจากผู้ใช้จริง' },
  { src: '/videos/reviews/review-4.mp4', handle: '@bazooka.review', quote: 'รีวิวจากผู้ใช้จริง' },
  { src: '/videos/reviews/review-6.mp4', handle: '@bazooka.review', quote: 'รีวิวจากผู้ใช้จริง' },
];

export const homeReviewVideos = allHomeReviewVideos.filter((item) =>
  HOME_REVIEW_VIDEO_ALLOWLIST.has(item.src),
);

/** Community reviews */
export const communityReviewVideo = {
  src: '/videos/review-loop.mp4',
  fallback: '/videos/lifestyle-motion.mp4',
  poster: '/products/refresh-howto-1.jpg',
};

export const storyReviews = [
  {
    id: 'bank',
    name: 'Bank',
    city: 'Bangkok',
    usage: 'ใช้กับรองเท้าขาวคู่ประจำ',
    product: 'Bazooka Cleaner',
    quote:
      'คราบฝุ่นที่พื้นยางดูจางลงตั้งแต่ครั้งแรก เหมือนได้รองเท้าคู่เดิมกลับมาอีกครั้ง',
    tag: 'ออร์แกนิก คลีนเนอร์',
    avatar: '/images/reviews/bank.jpg',
    avatarFallback: '/products/cleaner-howto-1.jpg',
    sneaker: '/images/reviews/sneaker-bank.jpg',
    sneakerFallback: '/products/cleaner-howto-2.jpg',
    rating: 5,
  },
  {
    id: 'mint',
    name: 'Mint',
    city: 'Chiang Mai',
    usage: 'ใช้หลังออกกำลังกาย',
    product: 'Refresh Spray',
    quote:
      'กลิ่นอับในรองเท้าวิ่งลดลงชัดเจน กลิ่นสะอาด ไม่ฉุน และใช้ได้ทุกวัน',
    tag: 'สเปรย์รีเฟรช',
    avatar: '/images/reviews/mint.jpg',
    avatarFallback: '/products/refresh-howto-1.jpg',
    sneaker: '/images/reviews/sneaker-mint.jpg',
    sneakerFallback: '/products/refresh-howto-2.jpg',
    rating: 5,
  },
  {
    id: 'ton',
    name: 'Ton',
    city: 'Nonthaburi',
    usage: 'ใช้ก่อนเดินทาง',
    product: 'Protector Spray',
    quote:
      'พอฉีดก่อนใส่ รองเท้าเช็ดทำความสะอาดง่ายขึ้นมาก โดยเฉพาะวันที่เจอฝุ่นกับละอองน้ำ',
    tag: 'สเปรย์ปกป้อง',
    avatar: '/images/reviews/ton.jpg',
    avatarFallback: '/products/protector-howto-1.jpg',
    sneaker: '/images/reviews/sneaker-ton.jpg',
    sneakerFallback: '/products/protector-howto-2.jpg',
    rating: 5,
  },
];
