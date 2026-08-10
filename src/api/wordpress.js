const WP_BASE_URL = '/wp';

function stripHtml(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/\s+/g, ' ')
    .trim();
}

function getFeaturedImage(post) {
  const media = post?._embedded?.['wp:featuredmedia']?.[0];
  return (
    media?.source_url ||
    media?.media_details?.sizes?.large?.source_url ||
    media?.media_details?.sizes?.medium_large?.source_url ||
    ''
  );
}

function getPrimaryCategory(post) {
  const termGroups = post?._embedded?.['wp:term'];
  if (!Array.isArray(termGroups)) {
    return { id: 'uncategorized', name: 'บทความ', slug: 'uncategorized' };
  }

  const categories = termGroups.flat().filter((term) => term?.taxonomy === 'category');
  const primary = categories[0];
  if (!primary) {
    return { id: 'uncategorized', name: 'บทความ', slug: 'uncategorized' };
  }

  return {
    id: String(primary.id),
    name: stripHtml(primary.name) || 'บทความ',
    slug: primary.slug || String(primary.id),
  };
}

export function mapWpPost(post) {
  const category = getPrimaryCategory(post);
  const title = stripHtml(post?.title?.rendered) || 'บทความ BAZOOKA';
  const summary =
    stripHtml(post?.excerpt?.rendered) ||
    stripHtml(post?.content?.rendered).slice(0, 160);

  return {
    id: `wp-${post.id}`,
    wpId: post.id,
    slug: post.slug,
    title,
    summary,
    category: category.name,
    topic: category.slug,
    publishedAt: post.date,
    cover: getFeaturedImage(post) || '/products/cleaner-howto-1.jpg',
    contentHtml: post?.content?.rendered || '',
    source: 'wordpress',
  };
}

export function mapWpCategory(category) {
  return {
    id: category.slug || String(category.id),
    wpId: category.id,
    label: stripHtml(category.name) || category.slug,
    count: Number(category.count) || 0,
  };
}

async function wpFetch(path) {
  const response = await fetch(`${WP_BASE_URL}${path}`, {
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
    },
  });

  if (!response.ok) {
    throw new Error(`โหลดข้อมูล WordPress ไม่สำเร็จ (${response.status})`);
  }

  return response;
}

export async function fetchWpPosts({ perPage = 50, page = 1, categoryId } = {}) {
  const params = new URLSearchParams({
    per_page: String(perPage),
    page: String(page),
    status: 'publish',
    _embed: '1',
  });

  if (categoryId) {
    params.set('categories', String(categoryId));
  }

  const response = await wpFetch(`/wp/v2/posts?${params.toString()}`);
  const data = await response.json();
  if (!Array.isArray(data)) {
    throw new Error('รูปแบบข้อมูลบทความไม่ถูกต้อง');
  }

  return {
    posts: data.map(mapWpPost),
    total: Number(response.headers.get('X-WP-Total') || data.length),
    totalPages: Number(response.headers.get('X-WP-TotalPages') || 1),
  };
}

export async function fetchWpPostBySlug(slug) {
  const safeSlug = String(slug || '').trim();
  if (!safeSlug) return null;

  const params = new URLSearchParams({
    slug: safeSlug,
    status: 'publish',
    _embed: '1',
  });

  const response = await wpFetch(`/wp/v2/posts?${params.toString()}`);
  const data = await response.json();
  if (!Array.isArray(data) || data.length === 0) return null;
  return mapWpPost(data[0]);
}

export async function fetchWpCategories() {
  const params = new URLSearchParams({
    per_page: '100',
    hide_empty: 'true',
  });

  const response = await wpFetch(`/wp/v2/categories?${params.toString()}`);
  const data = await response.json();
  if (!Array.isArray(data)) return [];

  return data
    .map(mapWpCategory)
    .filter((category) => category.count > 0 && category.id !== 'uncategorized')
    .sort((a, b) => a.label.localeCompare(b.label, 'th'));
}
