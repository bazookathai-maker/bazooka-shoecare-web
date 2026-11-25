/**
 * English display copy keyed by WooCommerce product id.
 * The store still loads Thai names and descriptions from WooCommerce.
 * This map is applied only while the URL locale is English.
 */

const CATEGORY_EN = {
  cleaners: 'Cleaning',
  protectors: 'Protection',
  refresh: 'Refresh',
  brushes: 'Tools',
  kits: 'Sets',
};

function protectorAbout(suedeLine) {
  return [
    'Bazooka Protector Spray is a coating spray for water and dirt.',
    'Made in Japan.',
    'A nano surface coating that helps liquids from soaking in, so they bead off the shoe.',
    'The coating is meant to leave the material surface as it is, without making it fuzzy or waxy.',
    'It helps protect shoes from dulling in UV light.',
    'It helps protect shoes from liquid dirt and makes that dirt easier to clean.',
    `Materials: genuine leather, synthetic leather, ${suedeLine}, and fabric.`,
    'One coat lasts about 1 month to 1 year, depending on use and storage.',
    '250 ml, about 5–7 pairs.',
  ].join('\n');
}

const SUEDE_SOFT = 'suede (especially recommended, because water can leave marks)';
const SUEDE_STRONG =
  'suede (especially recommended, because if it gets wet it can mark and cannot be cleaned)';

const PROTECTOR_BENEFITS_FULL = [
  'Made in Japan, with a milder odor and a coating meant to protect more and last longer',
  'A nano surface coating that helps liquids from soaking in, so they bead off like water on a lotus leaf',
  'Meant to leave the material surface as it is, without making it fuzzy or waxy',
  'Helps protect shoes from dulling in UV light',
  'Helps protect shoes from liquid dirt and makes that dirt easier to clean',
  '250 ml, about 5–7 pairs. One coat lasts about 1 month to 1 year, depending on use and storage',
];

const PROTECTOR_BENEFITS = [
  'Made in Japan',
  'A nano surface coating that helps liquids from soaking in',
  'Meant to leave the material surface as it is, without making it fuzzy or waxy',
  'Helps protect shoes from dulling in UV light',
  'Helps protect shoes from liquid dirt and makes that dirt easier to clean',
  '250 ml, about 5–7 pairs. One coat lasts about 1 month to 1 year, depending on use and storage',
];

function spraySteps({ distance, wait, extra = '' }) {
  return [
    'Basic spray directions',
    '1. The item to be coated must be clean and dry.',
    `2. Shake the can and spray from about ${distance}.`,
    `3. Leave it to dry for at least ${wait}.`,
    '4. Spray the whole surface again, as in step 2.',
    'For fabric, use a dryer on medium heat for about 10 minutes so the coating can work into the side fibers.',
    '5. Leave it to dry for at least 24 hours.',
    'For fabric, test with a drop of water. If the water does not bead, repeat steps 4 and 5.',
    extra,
  ]
    .filter(Boolean)
    .join('\n');
}

const SPRAY_REPEAT_NOTE =
  'Do not spray the same spot many times in a row. The spray may not dry in time, or may dry slowly, and the water-repellent result can be weaker if the shoes need to be worn right away.';

const SPRAY_GAP_NOTE =
  'Note: the spray cannot coat open gaps. On fabric it coats the fibers. Gaps between fibers may still let liquid through, but the coating protects the fibers themselves.';

const ASK_SHOP_NOTE =
  'If you have a problem using the product, please message the shop before leaving a review.';

function cleanerAbout({ contents, whiteNote, avoidNote, askShop = false }) {
  return [
    'Bazooka Cleaner is a dry cleaner with a natural formula.',
    'The formula uses coconut oil and jojoba oil extracts. It is meant to help care for the shoe surface so it is not worn down by cleaning chemicals.',
    'It can be used dry or with water.',
    'It is easy to use on shoes, bags, and hats.',
    'Materials: leather that can get wet, synthetic leather, fabric, and canvas.',
    '150 ml, about 10–15 pairs.',
    contents,
    whiteNote,
    avoidNote,
    askShop ? ASK_SHOP_NOTE : '',
  ]
    .filter(Boolean)
    .join('\n');
}

const CLEANER_BENEFITS = [
  'Natural formula with coconut oil and jojoba oil extracts',
  'Can be used dry or with water',
  'Easy to use on shoes, bags, and hats',
  'For leather that can get wet, synthetic leather, fabric, and canvas',
  '150 ml, about 10–15 pairs',
];

const WHITE_CLOTH_NOTE =
  'Note: on white fabric, wipe the foam off with a damp white cloth, then wipe with a dry cloth and air-dry.';

const AVOID_VELVET = 'Not recommended for velvet that cannot get wet.';
const AVOID_VELVET_AND_LEATHER =
  'Not recommended for suede, velvet, or genuine leather that cannot get wet.';
const AVOID_VELVET_LEATHER_ONLY =
  'Not recommended for velvet, or for genuine leather that cannot get wet.';

function deodorizerAbout({ smokeLine, warning = true }) {
  return [
    'Multi-purpose deodorizing spray. Natural formula with bamboo extract.',
    'For stale odor, bacteria that cause odor, and odor from smoke.',
    'Can be used on clothes, shoes, and other items as needed.',
    smokeLine,
    'Helps reduce stale shoe odor.',
    'Helps with unwanted odor.',
    'Helps with bacteria that cause odor.',
    'Easy to carry, and it can be sprayed as often as you want.',
    'How to use: spray onto the surface where you want to reduce odor. Use it regularly to help with bacteria that lead to unwanted odor.',
    warning
      ? 'Warning: do not ingest. For external use only. Keep out of reach of children. Keep away from heat and sunlight.'
      : '',
  ]
    .filter(Boolean)
    .join('\n');
}

const DEODORIZER_BENEFITS = [
  'Helps reduce stale shoe odor',
  'Helps with smoke odor on clothes',
  'Helps with unwanted odor',
  'Helps with bacteria that cause odor',
  'Bamboo extract',
  'Easy to carry, and it can be sprayed as often as you want',
];

const DEODORIZER_USE =
  'Spray onto the surface where you want to reduce odor. Use it regularly to help with bacteria that lead to unwanted odor.\nWarning: do not ingest. For external use only. Keep out of reach of children. Keep away from heat and sunlight.';

const BRUSH_ABOUT = [
  'The 2-in-1 suede brush cleans suede shoes without water or washing.',
  'Brush dust off with the bristle side first, then use the rubber side on set-in marks. Some marks may remain. It is meant to be simple to use.',
  'For suede shoes that pick up dust and dirt set into the suede surface.',
].join('\n');

const BRUSH_STEPS = [
  'How to use the suede brush',
  'Start with the bristle side. Use the soft bristles to lift dust and loose dirt. Brush in one direction so the nap stays even.',
  'Then use the rubber side. For set-in marks, rub lightly along the mark. The rubber side is meant to lift the mark without damaging the suede.',
  'Using the suede brush helps keep suede shoes clean. Clean them regularly to help the shoes last.',
].join('\n');

export const PRODUCT_COPY_EN = {
  881: {
    name: 'Complete Sneaker Care BAZOOKA',
    card: 'BAZOOKA spray, cleaner, and deodorizing spray in one set',
    hero: 'BAZOOKA spray and cleaner set, with a water-repellent coating spray, a shoe cleaner, and a deodorizing spray.',
    category: CATEGORY_EN.kits,
    about: [
      protectorAbout(SUEDE_SOFT),
      cleanerAbout({
        contents: 'In the set: 1 BAZOOKA Cleaner, 1 microfiber cloth, and 1 soft brush.',
        whiteNote: WHITE_CLOTH_NOTE,
        avoidNote: AVOID_VELVET_AND_LEATHER,
      }),
      deodorizerAbout({
        smokeLine: 'Helps with smoke odor, cigarette smoke, and smoke on clothes.',
      }),
    ].join('\n\n'),
    benefits: [...PROTECTOR_BENEFITS_FULL.slice(0, 5), ...CLEANER_BENEFITS.slice(0, 3), ...DEODORIZER_BENEFITS.slice(0, 3)],
    howTo: [
      spraySteps({ distance: '10–20 cm', wait: '20 minutes' }),
      DEODORIZER_USE,
    ].join('\n\n'),
  },
  147: {
    name: 'BAZOOKA cleaner, deodorizer and brush set',
    card: 'Cleaner, deodorizing spray, and a stiff brush in one set',
    hero: 'One set for protection, cleaning, and odor.',
    category: CATEGORY_EN.kits,
    about: [
      'New Bazooka full set. One set for protection, cleaning, and odor.',
      protectorAbout(SUEDE_STRONG),
      cleanerAbout({
        contents: 'In the set: 1 BAZOOKA Cleaner, 1 microfiber cloth, 1 soft brush, and 1 stiff brush.',
        whiteNote: WHITE_CLOTH_NOTE,
        avoidNote: AVOID_VELVET_LEATHER_ONLY,
      }),
      deodorizerAbout({
        smokeLine: 'Helps with smoke odor, cigarette smoke, and smoke on clothes.',
      }),
    ].join('\n\n'),
    benefits: [...PROTECTOR_BENEFITS.slice(0, 4), 'Set includes a stiff brush', ...DEODORIZER_BENEFITS.slice(0, 2)],
    howTo: [
      spraySteps({ distance: '10–20 cm', wait: '20 minutes' }),
      DEODORIZER_USE,
    ].join('\n\n'),
  },
  145: {
    name: 'BAZOOKA spray and suede brush set',
    card: 'Water-repellent spray with a 2-in-1 suede brush',
    hero: 'A 2-in-1 suede brush for cleaning suede without water, sold with the protector spray.',
    category: CATEGORY_EN.kits,
    about: [
      BRUSH_ABOUT,
      protectorAbout(SUEDE_STRONG),
    ].join('\n\n'),
    benefits: [
      'Cleans suede without water or washing',
      'Bristle side for dust, rubber side for set-in marks',
      'Some marks may remain',
      ...PROTECTOR_BENEFITS.slice(0, 3),
    ],
    howTo: [
      'How to use the suede brush',
      '1. Start with the bristle side. Use the soft bristles to lift dust and loose dirt. Brush in one direction so the nap stays even.',
      '2. Use the rubber side for set-in marks. Rub lightly along the mark. It is meant to lift the mark without damaging the suede.',
      'Using the suede brush helps keep suede shoes clean. Clean them regularly to help the shoes last.',
      spraySteps({
        distance: '15–20 cm',
        wait: '20–30 minutes',
        extra: `${SPRAY_REPEAT_NOTE}\n${SPRAY_GAP_NOTE}`,
      }),
      ASK_SHOP_NOTE,
    ].join('\n'),
  },
  143: {
    name: 'BAZOOKA water-repellent spray twin pack',
    card: 'Two cans of BAZOOKA water-repellent coating spray',
    hero: 'Bazooka Protector Spray, a coating spray for water and dirt. Twin pack.',
    category: CATEGORY_EN.protectors,
    about: protectorAbout(SUEDE_STRONG),
    benefits: PROTECTOR_BENEFITS,
    howTo: [
      spraySteps({
        distance: '15–20 cm',
        wait: '20–30 minutes',
        extra: `${SPRAY_REPEAT_NOTE}\n${SPRAY_GAP_NOTE}`,
      }),
      ASK_SHOP_NOTE,
    ].join('\n'),
  },
  140: {
    name: 'BAZOOKA shoe-cleaning foam twin pack',
    card: 'Two bottles of natural dry shoe cleaner',
    hero: 'Bazooka Cleaner, a dry cleaner with a natural formula. Twin pack.',
    category: CATEGORY_EN.cleaners,
    about: cleanerAbout({
      contents: 'In the set: 1 BAZOOKA Cleaner, 1 microfiber cloth, and 1 soft brush.',
      askShop: true,
    }),
    benefits: CLEANER_BENEFITS,
    howTo: '',
  },
  136: {
    name: 'BAZOOKA cleaner and protector spray set',
    card: 'Shoe cleaner and water-repellent spray together',
    hero: 'Bazooka Protector Spray and Bazooka Cleaner in one set.',
    category: CATEGORY_EN.kits,
    about: [
      protectorAbout(SUEDE_STRONG),
      cleanerAbout({
        contents: 'In the set: 1 BAZOOKA Cleaner, 1 Bazooka Protector Spray, 1 microfiber cloth, and 1 soft brush.',
      }),
    ].join('\n\n'),
    benefits: [...PROTECTOR_BENEFITS.slice(0, 3), ...CLEANER_BENEFITS.slice(0, 3)],
    howTo: [
      spraySteps({
        distance: '10–20 cm',
        wait: '20 minutes',
        extra: SPRAY_GAP_NOTE,
      }),
    ].join('\n'),
  },
  134: {
    name: 'BAZOOKA shoe deodorizing spray',
    card: 'Deodorizing spray with bamboo extract',
    hero: 'Multi-purpose deodorizing spray with a natural bamboo-extract formula.',
    category: CATEGORY_EN.refresh,
    about: deodorizerAbout({
      smokeLine: 'Helps with grill smoke, hotpot smoke, cigarette smoke, and smoke on clothes.',
    }),
    benefits: [
      'Helps reduce stale shoe odor',
      'Helps with grill, hotpot, and cigarette smoke on clothes',
      'Helps with unwanted odor',
      'Helps with bacteria that cause odor',
      'Bamboo extract',
      'Easy to carry, and it can be sprayed as often as you want',
    ],
    howTo: DEODORIZER_USE,
  },
  130: {
    name: 'BAZOOKA 2-in-1 suede cleaning brush',
    card: 'Bristle and rubber brush for suede, used dry',
    hero: 'A 2-in-1 suede brush that cleans suede shoes without water or washing.',
    category: CATEGORY_EN.brushes,
    about: BRUSH_ABOUT,
    benefits: [
      'Cleans suede without water or washing',
      'Brush dust off with the bristle side first',
      'Use the rubber side on set-in marks',
      'Some marks may remain',
      'For dust and dirt set into the suede surface',
    ],
    howTo: BRUSH_STEPS,
  },
  128: {
    name: 'BAZOOKA water-repellent spray',
    card: 'Coating spray that helps resist water and liquid dirt',
    hero: 'Bazooka Protector Spray, a coating spray for water and dirt.',
    category: CATEGORY_EN.protectors,
    about: protectorAbout(SUEDE_SOFT),
    benefits: PROTECTOR_BENEFITS,
    howTo: spraySteps({
      distance: '15–20 cm',
      wait: '20–30 minutes',
      extra: `${SPRAY_REPEAT_NOTE}\n${SPRAY_GAP_NOTE}`,
    }),
  },
  126: {
    name: 'BAZOOKA shoe cleaning foam',
    card: 'Dry shoe cleaner with a natural formula',
    hero: 'Bazooka Cleaner, a dry cleaner with a natural formula.',
    category: CATEGORY_EN.cleaners,
    about: cleanerAbout({
      whiteNote: WHITE_CLOTH_NOTE,
      avoidNote: AVOID_VELVET,
    }),
    benefits: [...CLEANER_BENEFITS, 'On white fabric, wipe the foam off with a damp white cloth'],
    howTo: '',
  },
  68: {
    name: 'BAZOOKA shoe cleaning foam set',
    card: 'Natural dry cleaner with a cloth and soft brush',
    hero: 'Bazooka Cleaner, a dry cleaner with a natural formula, with a cloth and brush.',
    category: CATEGORY_EN.cleaners,
    about: cleanerAbout({
      contents: 'In the set: 1 Bazooka cleaner, 1 microfiber cloth, and 1 soft brush.',
      askShop: true,
    }),
    benefits: [...CLEANER_BENEFITS.slice(0, 4), 'Includes a microfiber cloth and a soft brush'],
    howTo: '',
  },
};

export function localizeStoreProduct(product, locale) {
  if (!product || locale !== 'en') return product;
  const copy = PRODUCT_COPY_EN[String(product.id)];
  if (!copy) return product;
  const inStock = Boolean(product.isInStock);
  return {
    ...product,
    sourceName: product.name,
    name: copy.name,
    shortDescription: copy.card,
    description: copy.card,
    longDescription: copy.about,
    category: copy.category || product.category,
    heroDescription: copy.hero,
    aboutDescription: copy.about,
    howToText: copy.howTo,
    benefits: copy.benefits,
    breadcrumbLabel: copy.name,
    stockLabel: inStock ? 'In stock' : 'Out of stock',
    stockLabelShort: inStock ? 'In stock' : 'Out of stock',
  };
}

export function hasEnglishProductCopy(id) {
  return Boolean(PRODUCT_COPY_EN[String(id)]);
}

export function localizedProductName(id, fallback, locale) {
  if (locale !== 'en') return fallback;
  return PRODUCT_COPY_EN[String(id)]?.name || fallback;
}
