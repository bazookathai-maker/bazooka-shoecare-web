import { faqItems } from './faqPage';

/** Care questions shown on the homepage. Answers come from the FAQ page. */
const HOME_FAQ_IDS = [
  'shoe-types',
  'water-needed',
  'protector-benefits',
  'protector-frequency',
  'deodorizer-effect',
  'sport-shoe-wash',
  'suede-cleaning',
];

export const homeFaqs = HOME_FAQ_IDS.map((id) => {
  const item = faqItems.find((faq) => faq.id === id);
  if (!item) throw new Error(`Missing shared FAQ: ${id}`);
  return item;
});
