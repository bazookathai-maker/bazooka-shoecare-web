import { Link } from 'react-router-dom';
import { ArticleCardVideo } from './ArticleCard';

function ArticleParts({ parts }) {
  return parts.map((part, index) =>
    part.href ? (
      <Link key={index} to={part.href}>
        {part.text}
      </Link>
    ) : (
      <span key={index}>{part.text}</span>
    ),
  );
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
  return null;
}

export default function LongformArticle({ title, blocks, className, videoSrc }) {
  const videoAfterFirstParagraph = Boolean(videoSrc) && blocks[0]?.type === 'p';
  const head = videoAfterFirstParagraph ? blocks.slice(0, 1) : [];
  const tail = videoAfterFirstParagraph ? blocks.slice(1) : blocks;

  return (
    <article className={className}>
      <h1>{title}</h1>
      {head.map((block, index) => (
        <ArticleBlock key={index} block={block} />
      ))}
      {videoSrc ? (
        <div className="longform-article__video">
          <ArticleCardVideo src={videoSrc} title={title} isActive />
        </div>
      ) : null}
      {tail.map((block, index) => (
        <ArticleBlock key={head.length + index} block={block} />
      ))}
    </article>
  );
}
