function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderParts(parts) {
  return parts
    .map((part) => {
      if (!part.href) return esc(part.text);
      const external = /^https?:\/\//i.test(part.href);
      const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : '';
      return `<a href="${esc(part.href)}"${attrs}>${esc(part.text)}</a>`;
    })
    .join('');
}

function renderBlock(block) {
  if (block.type === 'h2') return `<h2>${esc(block.text)}</h2>`;
  if (block.type === 'h3') return `<h3>${esc(block.text)}</h3>`;
  if (block.type === 'p') {
    const inner = block.parts ? renderParts(block.parts) : esc(block.text);
    return `<p>${inner}</p>`;
  }
  if (block.type === 'figure') {
    const loading = block.eager ? 'eager' : 'lazy';
    return `<figure><img src="${esc(block.src)}" alt="${esc(block.alt)}" width="1024" height="1024" loading="${loading}" decoding="async"><figcaption>${esc(block.caption)}</figcaption></figure>`;
  }
  return '';
}

function renderVideo(src, caption) {
  const captionHtml = caption
    ? `<figcaption class="longform-article__video-caption">${esc(caption)}</figcaption>`
    : '';
  return `<figure class="longform-article__video"><video src="${esc(src)}" muted playsinline preload="metadata"></video>${captionHtml}</figure>`;
}

/** Shared by React's matching component and the HTML pre-render. */
export function renderArticleHtml({ title, blocks, className, videoSrc, videoCaption }) {
  const parts = [];
  let placed = false;
  blocks.forEach((block) => {
    parts.push(renderBlock(block));
    if (!placed && videoSrc && block.type === 'p') {
      parts.push(renderVideo(videoSrc, videoCaption));
      placed = true;
    }
  });
  return `<article class="${esc(className)}"><h1>${esc(title)}</h1>${parts.join('')}</article>`;
}
