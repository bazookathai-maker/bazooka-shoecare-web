import { renderArticleHtml } from './articleHtml';
import {
  PROTECT_REFRESH_COVER,
  PROTECT_REFRESH_DESCRIPTION,
  PROTECT_REFRESH_TITLE,
  protectRefreshBlocks,
} from './protectRefreshArticle';
import {
  SHOE_CLEANER_COVER,
  SHOE_CLEANER_DESCRIPTION,
  SHOE_CLEANER_TITLE,
  shoeCleanerBlocks,
} from './shoeCleanerArticle';
import {
  SHOE_DEODORIZE_COVER,
  SHOE_DEODORIZE_DESCRIPTION,
  SHOE_DEODORIZE_TITLE,
  shoeDeodorizeBlocks,
} from './shoeDeodorizeArticle';
import {
  ON_CLOUD_COVER,
  ON_CLOUD_DESCRIPTION,
  ON_CLOUD_TITLE,
  onCloudBlocks,
} from './onCloudArticle';
import {
  STUDS_COVER,
  STUDS_DESCRIPTION,
  STUDS_TITLE,
  studsBlocks,
} from './studsArticle';
import {
  RUNNING_SHOE_COVER,
  RUNNING_SHOE_DESCRIPTION,
  RUNNING_SHOE_TITLE,
  RUNNING_SHOE_VIDEO_CAPTION,
  runningShoeBlocks,
} from './runningShoeArticle';
import {
  SUEDE_CLEAN_COVER,
  SUEDE_CLEAN_DESCRIPTION,
  SUEDE_CLEAN_TITLE,
  suedeCleanBlocks,
} from './suedeCleanArticle';
import {
  WHITE_CANVAS_COVER,
  WHITE_CANVAS_DESCRIPTION,
  WHITE_CANVAS_TITLE,
  whiteCanvasBlocks,
} from './whiteCanvasArticle';

export { renderArticleHtml };

export const ARTICLE_CATEGORIES = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'white-sneaker', label: 'รองเท้าสีขาว' },
  { id: 'shoe-cleaner', label: 'น้ำยาทำความสะอาด' },
  { id: 'suede-care', label: 'หนังกลับ' },
  { id: 'protector-spray', label: 'การปกป้อง' },
  { id: 'running-shoes', label: 'รองเท้าวิ่ง' },
  { id: 'football-boots', label: 'รองเท้าสตั๊ด' },
  { id: 'deodorizer', label: 'ดับกลิ่น' },
  { id: 'crocs-care', label: 'CROCS' },
];

const TOPIC_LABELS = Object.fromEntries(
  ARTICLE_CATEGORIES.filter((item) => item.id !== 'all').map((item) => [
    item.id,
    item.label,
  ]),
);

export const careGuides = [
  {
    id: 'white-canvas',
    slug: 'white-canvas',
    topic: 'white-sneaker',
    category: TOPIC_LABELS['white-sneaker'],
    publishedAt: '2025-11-12',
    cover: WHITE_CANVAS_COVER,
    title: WHITE_CANVAS_TITLE,
    description: WHITE_CANVAS_DESCRIPTION,
    summary: WHITE_CANVAS_DESCRIPTION,
    longform: true,
    blocks: whiteCanvasBlocks,
    articleClass: 'longform-article',
    embedVideo: true,
    video: '/videos/articles/white-sneaker-cleaning-guide.mp4',
    products: [
      {
        label: 'BAZOOKA สเปรย์ x 2 + BAZOOKA คลีนเนอร์',
        image: '/products/product-8.jpg.png',
      },
      {
        label: 'โปรครบเซ็ต BAZOOKA สเปรย์ x 2 คลีนเนอร์',
        image: '/products/product-26.jpg.jpg',
      },
      { label: 'ชุดครบเซ็ต BAZOOKA', image: '/products/product-27.jpg.jpg' },
    ],
  },
  {
    id: 'suede-clean',
    slug: 'suede-clean',
    topic: 'suede-care',
    category: TOPIC_LABELS['suede-care'],
    publishedAt: '2025-10-28',
    cover: SUEDE_CLEAN_COVER,
    title: SUEDE_CLEAN_TITLE,
    description: SUEDE_CLEAN_DESCRIPTION,
    summary: SUEDE_CLEAN_DESCRIPTION,
    longform: true,
    blocks: suedeCleanBlocks,
    articleClass: 'suede-article',
    embedVideo: true,
    video: '/videos/articles/suede-care-guide.mp4',
    videoCaption:
      'วิดีโอสาธิตการใช้ด้านขนของแปรงหนังกลับ 2 in 1 และการพ่น Protector Spray ของ BAZOOKA บนรองเท้าหนังกลับ',
    products: [
      { label: 'BAZOOKA โปรจับคู่', image: '/products/product-2.jpg.png' },
      { label: 'BAZOOKA สเปรย์ x 2', image: '/products/product-11.jpg.png' },
      {
        label: 'แปรงขัดหนังกลับ 2 in 1',
        image: '/products/product-23.jpg.PNG',
      },
    ],
  },
  {
    id: 'protect-refresh',
    slug: 'protect-refresh',
    topic: 'protector-spray',
    category: TOPIC_LABELS['protector-spray'],
    publishedAt: '2025-10-08',
    cover: PROTECT_REFRESH_COVER,
    title: PROTECT_REFRESH_TITLE,
    description: PROTECT_REFRESH_DESCRIPTION,
    summary: PROTECT_REFRESH_DESCRIPTION,
    longform: true,
    blocks: protectRefreshBlocks,
    articleClass: 'longform-article',
    video: '/videos/articles/protect-and-refresh-guide.mp4',
    products: [
      { label: 'BAZOOKA โปรจับคู่', image: '/products/product-2.jpg.png' },
      {
        label: 'แปรงขัดหนังกลับ 2 in 1',
        image: '/products/product-23.jpg.PNG',
      },
      {
        label: 'BAZOOKA สเปรย์ x 2 + BAZOOKA คลีนเนอร์',
        image: '/products/product-8.jpg.png',
      },
    ],
  },
  {
    id: 'lazy-sneaker-care',
    slug: 'lazy-sneaker-care',
    topic: 'white-sneaker',
    category: TOPIC_LABELS['white-sneaker'],
    publishedAt: '2025-09-22',
    cover: '/products/cleaner-howto-2.jpg',
    title: 'คืนชีพรองเท้าฉบับคนขี้เกียจ\nง่ายๆ 3 ขั้นตอน',
    summary:
      'หลายคนเป็นคนรักรองเท้า มีรองเท้าคู่โปรดที่ใส่บ่อย แต่พอใช้งานไปสักพักก็เริ่มมีคราบ ฝุ่น จนอยากทำความสะอาด แต่ก็ขี้เกียจซัก หรือไม่มีเวลามานั่งขัดรองเท้าทั้งคู่',
    video: null,
    products: [
      { label: 'BAZOOKA คลีนเนอร์', image: '/products/product-5.jpg.jpg' },
      { label: 'BAZOOKA โปรจับคู่', image: '/products/product-2.jpg.png' },
      { label: 'ชุดครบเซ็ต BAZOOKA', image: '/products/product-27.jpg.jpg' },
    ],
  },
  {
    id: 'white-sneaker-restore',
    slug: 'white-sneaker-restore',
    topic: 'running-shoes',
    category: TOPIC_LABELS['running-shoes'],
    publishedAt: '2025-09-04',
    cover: RUNNING_SHOE_COVER,
    title: RUNNING_SHOE_TITLE,
    description: RUNNING_SHOE_DESCRIPTION,
    summary: RUNNING_SHOE_DESCRIPTION,
    longform: true,
    blocks: runningShoeBlocks,
    articleClass: 'longform-article',
    embedVideo: true,
    video: '/videos/articles/running-shoe-cleaning.mp4',
    videoCaption: RUNNING_SHOE_VIDEO_CAPTION,
    products: [],
  },
  {
    id: 'rain-wet-clean',
    slug: 'rain-wet-clean',
    topic: 'running-shoes',
    category: TOPIC_LABELS['running-shoes'],
    publishedAt: '2025-08-18',
    cover: ON_CLOUD_COVER,
    title: ON_CLOUD_TITLE,
    description: ON_CLOUD_DESCRIPTION,
    summary: ON_CLOUD_DESCRIPTION,
    longform: true,
    blocks: onCloudBlocks,
    articleClass: 'longform-article',
    video: null,
    products: [],
  },
  {
    id: 'storage-odor-prevent',
    slug: 'storage-odor-prevent',
    topic: 'football-boots',
    category: TOPIC_LABELS['football-boots'],
    publishedAt: '2025-08-02',
    cover: STUDS_COVER,
    title: STUDS_TITLE,
    description: STUDS_DESCRIPTION,
    summary: STUDS_DESCRIPTION,
    longform: true,
    blocks: studsBlocks,
    articleClass: 'longform-article',
    video: null,
    products: [],
  },
  {
    id: 'shoe-deodorize',
    slug: 'shoe-deodorize',
    topic: 'deodorizer',
    category: TOPIC_LABELS['deodorizer'],
    publishedAt: '2025-07-15',
    cover: SHOE_DEODORIZE_COVER,
    title: SHOE_DEODORIZE_TITLE,
    description: SHOE_DEODORIZE_DESCRIPTION,
    summary: SHOE_DEODORIZE_DESCRIPTION,
    longform: true,
    blocks: shoeDeodorizeBlocks,
    articleClass: 'longform-article',
    embedVideo: true,
    video: '/videos/articles/refresh-spray.mp4',
    products: [
      { label: 'สเปรย์รีเฟรช', image: '/products/product-16.jpg.jpg' },
      {
        label: 'ซื้อ 2 แถม 1 สเปรย์รีเฟรช',
        image: '/products/product-25.jpg.jpg',
      },
      { label: 'BAZOOKA คลีนเนอร์', image: '/products/product-5.jpg.jpg' },
    ],
  },
  {
    id: 'crocs-wash',
    slug: 'crocs-wash',
    topic: 'crocs-care',
    category: TOPIC_LABELS['crocs-care'],
    publishedAt: '2025-06-30',
    cover: '/products/organic-cleaner.jpg.jpg',
    title: 'HOW TO ซักรองเท้า CROCS',
    summary:
      'รองเท้า CROCS ทำความสะอาดได้ง่าย หากซักถูกวิธีจะช่วยรักษาสี รูปทรง และความสบายในการใส่ให้คงอยู่ได้นานขึ้น',
    video: null,
    products: [
      { label: 'BAZOOKA คลีนเนอร์', image: '/products/product-5.jpg.jpg' },
      { label: 'สเปรย์รีเฟรช', image: '/products/product-16.jpg.jpg' },
      { label: 'ชุดครบเซ็ต BAZOOKA', image: '/products/product-27.jpg.jpg' },
    ],
  },
  {
    id: 'shoe-cleaner',
    slug: 'shoe-cleaner',
    topic: 'shoe-cleaner',
    category: TOPIC_LABELS['shoe-cleaner'],
    publishedAt: '2026-11-03',
    cover: SHOE_CLEANER_COVER,
    title: SHOE_CLEANER_TITLE,
    description: SHOE_CLEANER_DESCRIPTION,
    summary: SHOE_CLEANER_DESCRIPTION,
    longform: true,
    blocks: shoeCleanerBlocks,
    articleClass: 'longform-article',
    video: null,
    products: [
      { label: 'โฟมทำความสะอาดรองเท้า BAZOOKA', image: '/images/cleaner-2.jpg' },
      { label: 'ชุดโฟมทำความสะอาดรองเท้า BAZOOKA', image: '/images/cleaner-2.jpg' },
    ],
  },
];

export function getCareGuideBySlug(slug) {
  return careGuides.find((guide) => guide.slug === slug || guide.id === slug) ?? null;
}

export function getTopicRelatedGuides(slug) {
  const current = getCareGuideBySlug(slug);
  if (!current?.topic) return [];

  return careGuides.filter(
    (guide) =>
      guide.topic === current.topic &&
      guide.slug !== current.slug &&
      guide.id !== current.id,
  );
}
