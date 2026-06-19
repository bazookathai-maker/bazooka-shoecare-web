import { careGuides, getTopicRelatedGuides } from './careGuides';
import { homeFaqs } from './homeFaq';
import { findProductBySlug } from './products';
import { getProductDetailBySlug } from './productDetails';

export const hubRoutes = {
  article: (slug, faqId) =>
    faqId ? `/articles/${slug}?faq=${faqId}` : `/articles/${slug}`,
  faq: (id) => `/faq#faq-${id}`,
  product: (slug) => `/products/${slug}`,
};

const articleRelations = {
  'suede-clean': {
    faqs: ['suede-cleaning', 'protector-benefits', 'water-needed'],
    articles: ['protect-refresh', 'lazy-sneaker-care'],
    products: ['suede-brush-2in1', 'promo-pair-bundle', 'bazooka-spray-twin-pack'],
  },
  'white-canvas': {
    faqs: ['shoe-types', 'water-needed'],
    articles: ['white-sneaker-restore', 'lazy-sneaker-care'],
    products: ['bazooka-cleaner-cloth-brush', 'set-complete-bazooka'],
  },
  'protect-refresh': {
    faqs: ['protector-benefits', 'protector-frequency'],
    articles: ['suede-clean', 'white-canvas'],
    products: ['bazooka-spray-twin-pack', 'bazooka-spray'],
  },
  'shoe-deodorize': {
    faqs: ['deodorizer-effect', 'water-needed'],
    articles: ['white-sneaker-restore', 'lazy-sneaker-care'],
    products: ['refresh-spray-portable', 'refresh-spray-2plus1'],
  },
  'white-sneaker-restore': {
    faqs: ['shoe-types', 'water-needed', 'deodorizer-effect'],
    articles: ['white-canvas', 'shoe-deodorize'],
    products: ['bazooka-cleaner-cloth-brush', 'set-complete-bazooka'],
  },
  'rain-wet-clean': {
    faqs: ['shoe-types', 'water-needed', 'protector-benefits'],
    articles: ['white-sneaker-restore', 'protect-refresh'],
    products: ['bazooka-cleaner-cloth-brush', 'bazooka-spray-twin-pack'],
  },
  'storage-odor-prevent': {
    faqs: ['shoe-types', 'water-needed'],
    articles: ['white-sneaker-restore', 'rain-wet-clean'],
    products: ['bazooka-cleaner-cloth-brush', 'refresh-spray-portable'],
  },
  'lazy-sneaker-care': {
    faqs: ['water-needed', 'shoe-types'],
    articles: ['white-canvas', 'shoe-deodorize'],
    products: [
      'bazooka-cleaner-cloth-brush',
      'promo-pair-bundle',
      'set-complete-bazooka',
    ],
  },
};

const faqRelations = {
  'shoe-types': ['white-canvas'],
  'water-needed': ['suede-clean'],
  'protector-benefits': ['protect-refresh'],
  'protector-frequency': ['protect-refresh'],
  'deodorizer-effect': ['white-canvas', 'lazy-sneaker-care'],
  'sport-shoe-wash': [
    'white-sneaker-restore',
    'rain-wet-clean',
    'storage-odor-prevent',
  ],
  'suede-cleaning': ['shoe-deodorize'],
};

const productRelations = {
  'bazooka-spray-twin-pack': ['protect-refresh', 'suede-clean'],
  'bazooka-spray': ['protect-refresh', 'rain-wet-clean'],
  'bazooka-cleaner-cloth-brush': ['suede-clean', 'white-canvas', 'lazy-sneaker-care'],
  'suede-brush-2in1': ['suede-clean'],
  'refresh-spray-portable': ['shoe-deodorize'],
  'refresh-spray-2plus1': ['shoe-deodorize'],
  'set-complete-bazooka': ['lazy-sneaker-care', 'white-canvas'],
  'promo-pair-bundle': ['suede-clean'],
  'spray-cleaner-pro2': ['white-canvas', 'protect-refresh'],
};

const reviewRelations = {
  'review-t': {
    slug: 'bazooka-spray-twin-pack',
    label: 'BAZOOKA สเปรย์ x 2',
  },
  snoozerjoule: {
    slug: 'bazooka-cleaner-cloth-brush',
    label: 'BAZOOKA คลีนเนอร์',
  },
  nattakornprommanop: {
    slug: 'spray-cleaner-pro2',
    label: 'BAZOOKA สเปรย์ x 2 + BAZOOKA คลีนเนอร์',
  },
  'kod-or': {
    slug: 'set-complete-bazooka',
    label: 'ชุดครบเซ็ต BAZOOKA',
  },
  'user-review': {
    slug: 'set-complete-bazooka',
    label: 'ชุดครบเซ็ต BAZOOKA',
  },
  'user-review-protector': {
    slug: 'bazooka-spray-twin-pack',
    label: 'BAZOOKA สเปรย์ x 2',
  },
};

function formatProductName(name) {
  return name.replace(/\n/g, ' ').trim();
}

function getArticleSlug(id) {
  const guide = careGuides.find((item) => item.id === id);
  return guide?.slug ?? id;
}

function getArticleTitle(id) {
  const guide = careGuides.find((item) => item.id === id);
  return guide ? guide.title.replace(/\n/g, ' ') : id;
}

function getFaqQuestion(id) {
  return homeFaqs.find((item) => item.id === id)?.question ?? id;
}

function getProductLabel(slug) {
  const product = findProductBySlug(slug);
  return product ? formatProductName(product.name) : slug;
}

function toHubLink(type, id, label) {
  if (type === 'article') {
    return { href: hubRoutes.article(getArticleSlug(id)), label };
  }
  if (type === 'faq') {
    return { href: hubRoutes.faq(id), label };
  }
  if (type === 'product') {
    return { href: hubRoutes.product(id), label };
  }
  return { href: '#', label };
}

function mapIds(type, ids, labelFn) {
  return ids.map((id) => toHubLink(type, id, labelFn(id)));
}

function isProductLinkable(slug) {
  return Boolean(getProductDetailBySlug(slug));
}

export function getArticleRelatedContent(articleId) {
  const relations = articleRelations[articleId];
  if (!relations) {
    return { faqs: [], articles: [], products: [] };
  }

  return {
    faqs: mapIds('faq', relations.faqs, getFaqQuestion),
    articles: mapIds('article', relations.articles, getArticleTitle),
    products: mapIds('product', relations.products.filter(isProductLinkable), getProductLabel),
  };
}

export function getFaqRelatedArticles(faqId) {
  const articleIds = faqRelations[faqId] ?? [];
  return articleIds.map((id) => ({
    href: hubRoutes.article(getArticleSlug(id), faqId),
    label: getArticleTitle(id),
  }));
}

export function getTopicRelatedArticles(slug, faqId) {
  let related = getTopicRelatedGuides(slug);

  if (faqId && faqRelations[faqId]) {
    const allowedIds = new Set(faqRelations[faqId]);
    related = related.filter((guide) => allowedIds.has(guide.id));
  }

  return related.map((guide) => ({
    href: hubRoutes.article(guide.slug, faqId),
    label: guide.title.replace(/\n/g, ' '),
  }));
}

export function getProductRelatedArticles(slug) {
  const articleIds = productRelations[slug] ?? [];
  return mapIds('article', articleIds, getArticleTitle);
}

export function getReviewRelatedProduct(reviewId) {
  const relation = reviewRelations[reviewId];
  if (!relation || !isProductLinkable(relation.slug)) return null;

  return {
    href: hubRoutes.product(relation.slug),
    label: relation.label ?? getProductLabel(relation.slug),
  };
}
