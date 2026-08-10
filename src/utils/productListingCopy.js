/**
 * Listing-only copy helpers for /products cards.
 * Does not alter Product Detail (full Woo name/description stay untouched there).
 */

function collapseSpaces(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function sanitizeListingText(value) {
  return collapseSpaces(
    String(value || '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&quot;/gi, '"')
      .replace(/&#8211;/g, '–')
      .replace(/&#8212;/g, '—')
      .replace(/\*\*/g, '')
      .replace(/[🍃👟✅★☆]/gu, ' '),
  );
}

/**
 * Short listing title from Woo name — drop promo markers, trailing clutter.
 */
export function formatListingName(rawName) {
  let name = sanitizeListingText(rawName);
  if (!name) return 'สินค้า BAZOOKA';

  name = name
    .replace(/^\*+[^*]*\*+/g, '')
    .replace(/\b(PRO\s*\d+|COMPLETE\d*|PRODUO\d*|SKU[:\s]*\S+)/gi, '')
    .replace(/\s*[|/]\s*/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  // Prefer Thai/main phrase before long English marketing tail when both exist.
  const parenMatch = name.match(/^(.+?)\s*\(([^)]{0,40})\)\s*(.*)$/);
  if (parenMatch) {
    const head = collapseSpaces(parenMatch[1]);
    const inside = collapseSpaces(parenMatch[2]);
    const tail = collapseSpaces(parenMatch[3]);
    // Keep short useful paren (e.g. 1แถม1, 2ขวด) — drop long explanatory paren blocks.
    if (inside.length <= 18 && /แถม|ขวด|ชุด|2-in-1|2in1/i.test(inside)) {
      name = collapseSpaces(`${head} (${inside}) ${tail}`);
    } else if (head.length >= 8) {
      name = collapseSpaces(`${head} ${tail}`);
    }
  }

  // Cut after ~48 chars at a word boundary for denser cards (CSS also clamps to 2 lines).
  if (name.length > 52) {
    const sliced = name.slice(0, 52);
    const cut = Math.max(sliced.lastIndexOf(' '), sliced.lastIndexOf('+'));
    name = `${(cut > 24 ? sliced.slice(0, cut) : sliced).trim()}…`;
  }

  return name || sanitizeListingText(rawName);
}

/**
 * One short sentence for the card. Prefer short_description; else first prose line of description.
 * Returns '' when nothing useful (caller reserves space but hides empty copy).
 */
export function formatListingDescription(shortDescription, longDescription) {
  const short = sanitizeListingText(shortDescription);
  if (short) {
    return shortenSentence(short, 88);
  }

  const long = sanitizeListingText(longDescription);
  if (!long) return '';

  // Drop bullet-only dumps — take first non-bullet sentence-like chunk.
  const chunks = long
    .split(/(?<=[.!?。])\s+|–\s+|—\s+|•\s+|-\s+/)
    .map((part) => collapseSpaces(part.replace(/^[-–—*•]\s*/, '')))
    .filter((part) => part.length >= 12 && !/^คำเตือน|ห้าม/.test(part));

  const first = chunks[0] || long;
  return shortenSentence(first, 88);
}

function shortenSentence(text, maxLen) {
  const value = collapseSpaces(text);
  if (value.length <= maxLen) return value;
  const sliced = value.slice(0, maxLen);
  const cut = Math.max(
    sliced.lastIndexOf(' '),
    sliced.lastIndexOf('、'),
    sliced.lastIndexOf(','),
  );
  return `${(cut > maxLen * 0.45 ? sliced.slice(0, cut) : sliced).trim()}…`;
}
