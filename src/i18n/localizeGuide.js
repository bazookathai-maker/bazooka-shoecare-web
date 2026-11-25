import { JOURNAL_EN } from './journalEn';
import { localizedProductName } from './productCopy';

const TEXT_KEYS = ['text', 'alt', 'caption', 'title', 'description', 'posterAlt'];

function mergeBlock(block, copy) {
  if (!block || !copy) return block;
  const next = { ...block };
  for (const key of TEXT_KEYS) {
    if (typeof copy[key] === 'string') next[key] = copy[key];
  }
  if (Array.isArray(block.parts) && Array.isArray(copy.parts)) {
    next.parts = block.parts.map((part, index) => ({
      ...part,
      text: copy.parts[index] ?? part.text,
    }));
  }
  return next;
}

export function localizeGuide(guide, locale) {
  if (locale !== 'en' || !guide) return guide;
  const copy = JOURNAL_EN[guide.slug] || JOURNAL_EN[guide.id];
  if (!copy) return guide;

  return {
    ...guide,
    title: copy.title || guide.title,
    description: copy.description || guide.description,
    summary: copy.description || guide.summary,
    category: copy.category || guide.category,
    coverAlt: copy.coverAlt || guide.coverAlt,
    videoCaption: copy.videoCaption ?? guide.videoCaption,
    videoTitle: copy.videoTitle ?? guide.videoTitle,
    videoDescription: copy.videoDescription ?? guide.videoDescription,
    videoPosterAlt: copy.videoPosterAlt ?? guide.videoPosterAlt,
    products: Array.isArray(guide.products)
      ? guide.products.map((product, index) => ({
          ...product,
          label: copy.products?.[index] || product.label,
        }))
      : guide.products,
    blocks: Array.isArray(guide.blocks)
      ? guide.blocks.map((block, index) => mergeBlock(block, copy.blocks?.[index]))
      : guide.blocks,
  };
}

const LABEL_EN = {
  'แปรงทำความสะอาดหนังกลับ 2 in 1': 'BAZOOKA 2-in-1 suede cleaning brush',
  'สเปรย์กันน้ำรองเท้า': 'BAZOOKA water-repellent spray',
  'ชุดสเปรย์กันน้ำรองเท้าและแปรงหนังกลับ': 'BAZOOKA spray and suede brush set',
  'โฟมทำความสะอาดรองเท้า': 'BAZOOKA shoe cleaning foam',
  'ชุดโฟมทำความสะอาดรองเท้า': 'BAZOOKA shoe cleaning foam set',
  'สเปรย์ดับกลิ่นรองเท้า': 'BAZOOKA shoe deodorizing spray',
  'ชุดโฟมแพ็กคู่': 'BAZOOKA shoe-cleaning foam twin pack',
  'สเปรย์กันน้ำรองเท้าแพ็กคู่': 'BAZOOKA water-repellent spray twin pack',
  'BAZOOKA สเปรย์ x 2': 'BAZOOKA spray, two cans',
  'BAZOOKA คลีนเนอร์': 'BAZOOKA cleaner',
  'BAZOOKA สเปรย์ x 2 + BAZOOKA คลีนเนอร์': 'BAZOOKA spray, two cans, and cleaner',
  'ชุดครบเซ็ต BAZOOKA': 'BAZOOKA complete set',
  'โปรครบเซ็ต BAZOOKA สเปรย์ x 2 คลีนเนอร์': 'BAZOOKA spray, two cans, and cleaner set',
  'BAZOOKA โปรจับคู่': 'BAZOOKA pair set',
  'แปรงขัดหนังกลับ 2 in 1': '2-in-1 suede brush',
  'สเปรย์รีเฟรช': 'Refresh spray',
  'ซื้อ 2 แถม 1 สเปรย์รีเฟรช': 'Buy 2 get 1 refresh spray',
  'โฟมทำความสะอาดรองเท้า BAZOOKA': 'BAZOOKA shoe-cleaning foam',
  'ชุดโฟมทำความสะอาดรองเท้า BAZOOKA': 'BAZOOKA shoe-cleaning foam set',
};

export function displayHubLabel(link, locale, t) {
  if (locale !== 'en' || !link) return link?.label || '';
  if (!link.href) return LABEL_EN[link.label] || link.label || '';
  const article = String(link.href).match(/\/articles\/([^?#]+)/);
  if (article && JOURNAL_EN[article[1]]?.title) return JOURNAL_EN[article[1]].title;
  const product = String(link.href).match(/\/products\/(\d+)/);
  if (product) return localizedProductName(product[1], LABEL_EN[link.label] || link.label, locale);
  if (LABEL_EN[link.label]) return LABEL_EN[link.label];
  const faq = String(link.href).match(/#faq-([^?#]+)/);
  if (faq) {
    return (
      t?.faq?.items?.[faq[1]]?.question ||
      t?.home?.faqs?.[faq[1]]?.question ||
      link.label
    );
  }
  return link.label;
}
