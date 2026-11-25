import { useState } from 'react';
import { youtubeVideoId } from '../data/articleHtml';
import { useLocale } from '../i18n/LocaleContext';
import { ArticleCardVideo } from './ArticleCard';
import LocaleLink from './LocaleLink';

function ArticleParts({ parts }) {
  return parts.map((part, index) => {
    if (!part.href) return <span key={index}>{part.text}</span>;
    if (/^https?:\/\//i.test(part.href)) {
      return (
        <a key={index} href={part.href} target="_blank" rel="noopener noreferrer">
          {part.text}
        </a>
      );
    }
    return (
      <LocaleLink key={index} to={part.href}>
        {part.text}
      </LocaleLink>
    );
  });
}

function ArticleBlock({ block }) {
  if (block.type === 'h2') return <h2>{block.text}</h2>;
  if (block.type === 'h3') return <h3>{block.text}</h3>;
  if (block.type === 'p') {
    return (
      <p>{block.parts ? <ArticleParts parts={block.parts} /> : block.text}</p>
    );
  }
  if (block.type === 'figure') {
    return (
      <figure>
        <img
          src={block.src}
          alt={block.alt}
          width="1024"
          height="1024"
          loading={block.eager ? 'eager' : 'lazy'}
          decoding="async"
        />
        <figcaption>{block.caption}</figcaption>
      </figure>
    );
  }
  if (block.type === 'youtube') return <YoutubeBlock block={block} />;
  if (block.type === 'video') return <VideoBlock block={block} />;
  return null;
}

function formatVerifiedDate(isoDate, locale) {
  const parsed = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parsed);
}

function PlayGlyph() {
  return (
    <span className="article-card__video-play" aria-hidden="true">
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="32" r="31" stroke="currentColor" strokeWidth="1.5" />
        <path d="M27 22.5v19l16-9.5-16-9.5z" fill="currentColor" />
      </svg>
    </span>
  );
}

function VideoBlock({ block }) {
  const { locale } = useLocale();
  if (!block.src) return null;
  return (
    <div className="longform-article__video">
      <ArticleCardVideo
        src={block.src}
        title={block.title || (locale === 'en' ? 'Video' : 'วิดีโอ')}
        poster={block.poster}
        isActive
      />
      {block.title ? (
        <p className="longform-article__video-title">{block.title}</p>
      ) : null}
      {block.description ? (
        <p className="longform-article__video-description">{block.description}</p>
      ) : null}
      {block.caption ? (
        <p className="longform-article__video-caption">{block.caption}</p>
      ) : null}
    </div>
  );
}

function YoutubeBlock({ block }) {
  const { locale } = useLocale();
  const id = youtubeVideoId(block.videoId || block.url);
  const [active, setActive] = useState(false);
  if (!id) return null;

  const title = block.title || (locale === 'en' ? 'YouTube video' : 'วิดีโอบน YouTube');

  return (
    <figure className="longform-article__video longform-article__video--youtube">
      {active ? (
        <iframe
          className="longform-article__youtube"
          src={`https://www.youtube-nocookie.com/embed/${id}?rel=0&autoplay=1`}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          className="longform-article__youtube-button"
          aria-label={title}
          onClick={() => setActive(true)}
        >
          <PlayGlyph />
        </button>
      )}
      {block.caption ? (
        <figcaption className="longform-article__video-caption">{block.caption}</figcaption>
      ) : null}
    </figure>
  );
}

export default function LongformArticle({
  title,
  blocks,
  className,
  videoSrc,
  videoPoster,
  videoTitle,
  videoDescription,
  videoCaption,
  publishedAt,
}) {
  const { locale } = useLocale();
  const videoAfterFirstParagraph = Boolean(videoSrc) && blocks[0]?.type === 'p';
  const head = videoAfterFirstParagraph ? blocks.slice(0, 1) : [];
  const tail = videoAfterFirstParagraph ? blocks.slice(1) : blocks;

  return (
    <article className={className}>
      <h1>{title}</h1>
      {publishedAt ? (
        <time className="longform-article__date" dateTime={publishedAt}>
          {formatVerifiedDate(publishedAt, locale)}
        </time>
      ) : null}
      {head.map((block, index) => (
        <ArticleBlock key={index} block={block} />
      ))}
      {videoSrc ? (
        <div className="longform-article__video">
          <ArticleCardVideo
            src={videoSrc}
            title={videoTitle || title}
            poster={videoPoster}
            isActive
          />
          {videoTitle ? (
            <p className="longform-article__video-title">{videoTitle}</p>
          ) : null}
          {videoDescription ? (
            <p className="longform-article__video-description">{videoDescription}</p>
          ) : null}
          {videoCaption ? (
            <p className="longform-article__video-caption">{videoCaption}</p>
          ) : null}
        </div>
      ) : null}
      {tail.map((block, index) => (
        <ArticleBlock key={head.length + index} block={block} />
      ))}
    </article>
  );
}
