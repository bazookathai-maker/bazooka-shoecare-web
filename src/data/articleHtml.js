import { localizePath } from '../i18n/locale';

export function youtubeVideoId(value) {
  const raw = String(value || '').trim();
  if (/^[\w-]{11}$/.test(raw)) return raw;

  try {
    const url = new URL(raw);
    const host = url.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0] || '';
      return /^[\w-]{11}$/.test(id) ? id : '';
    }
    if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
      const fromQuery = url.searchParams.get('v') || '';
      if (/^[\w-]{11}$/.test(fromQuery)) return fromQuery;
      const parts = url.pathname.split('/').filter(Boolean);
      const marker = parts.findIndex((part) => part === 'embed' || part === 'shorts');
      const id = marker >= 0 ? parts[marker + 1] || '' : '';
      return /^[\w-]{11}$/.test(id) ? id : '';
    }
  } catch {
    return '';
  }

  return '';
}

function formatPublishedDate(isoDate, locale = 'th') {
  const parsed = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parsed);
}

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderParts(parts, locale) {
  return parts
    .map((part) => {
      if (!part.href) return esc(part.text);
      const external = /^https?:\/\//i.test(part.href);
      const href = external ? part.href : localizePath(part.href, locale);
      const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : '';
      return `<a href="${esc(href)}"${attrs}>${esc(part.text)}</a>`;
    })
    .join('');
}

function renderBlock(block, locale) {
  if (block.type === 'h2') return `<h2>${esc(block.text)}</h2>`;
  if (block.type === 'h3') return `<h3>${esc(block.text)}</h3>`;
  if (block.type === 'p') {
    const inner = block.parts ? renderParts(block.parts, locale) : esc(block.text);
    return `<p>${inner}</p>`;
  }
  if (block.type === 'figure') {
    const loading = block.eager ? 'eager' : 'lazy';
    return `<figure><img src="${esc(block.src)}" alt="${esc(block.alt)}" width="1024" height="1024" loading="${loading}" decoding="async"><figcaption>${esc(block.caption)}</figcaption></figure>`;
  }
  if (block.type === 'youtube') return renderYoutube(block, locale);
  if (block.type === 'video' && block.src) {
    return renderVideo(block.src, block.caption, {
      poster: block.poster,
      posterAlt: block.posterAlt,
      title: block.title,
      description: block.description,
      locale,
    });
  }
  return '';
}

function renderVideo(src, caption, extras = {}) {
  const poster = extras.poster
    ? `<img src="${esc(extras.poster)}" alt="${esc(extras.posterAlt || '')}" width="720" height="1280">`
    : '';
  const playLabel = extras.locale === 'en' ? 'Play video' : 'เล่นวิดีโอ';
  const label = extras.title ? `${playLabel}: ${extras.title}` : playLabel;
  const titleHtml = extras.title
    ? `<p class="longform-article__video-title">${esc(extras.title)}</p>`
    : '';
  const descriptionHtml = extras.description
    ? `<p class="longform-article__video-description">${esc(extras.description)}</p>`
    : '';
  const captionHtml = caption
    ? `<figcaption class="longform-article__video-caption">${esc(caption)}</figcaption>`
    : '';
  return `<figure class="longform-article__video"><a href="${esc(src)}">${poster}${esc(label)}</a>${titleHtml}${descriptionHtml}${captionHtml}</figure>`;
}

function renderYoutube(block, locale = 'th') {
  const id = youtubeVideoId(block.videoId || block.url);
  if (!id) return '';
  const title = block.title || (locale === 'en' ? 'YouTube video' : 'วิดีโอบน YouTube');
  const captionHtml = block.caption
    ? `<figcaption class="longform-article__video-caption">${esc(block.caption)}</figcaption>`
    : '';
  return `<figure class="longform-article__video longform-article__video--youtube"><a href="https://www.youtube.com/watch?v=${esc(id)}">${esc(title)}</a>${captionHtml}</figure>`;
}

/** Shared by React's matching component and the HTML pre-render. */
export function renderArticleHtml({
  title,
  blocks,
  className,
  videoSrc,
  videoCaption,
  videoPoster,
  videoPosterAlt,
  videoTitle,
  videoDescription,
  publishedAt,
  locale = 'th',
}) {
  const parts = [];
  let placed = false;
  blocks.forEach((block) => {
    parts.push(renderBlock(block, locale));
    if (!placed && videoSrc && block.type === 'p') {
      parts.push(renderVideo(videoSrc, videoCaption, {
        poster: videoPoster,
        posterAlt: videoPosterAlt,
        title: videoTitle,
        description: videoDescription,
        locale,
      }));
      placed = true;
    }
  });
  const dateHtml = publishedAt
    ? `<time class="longform-article__date" datetime="${esc(publishedAt)}">${esc(formatPublishedDate(publishedAt, locale))}</time>`
    : '';
  return `<article class="${esc(className)}"><h1>${esc(title)}</h1>${dateHtml}${parts.join('')}</article>`;
}
