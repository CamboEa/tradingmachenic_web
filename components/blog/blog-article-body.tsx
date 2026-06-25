import { isBlogHtmlContent, parseBlogBody, splitBoldSegments, type BlogBlock } from "@/lib/blog-content";
import { sanitizeBlogHtml } from "@/lib/blog-content-sanitize";

function InlineText({ text }: { text: string }) {
  const segments = splitBoldSegments(text);
  return (
    <>
      {segments.map((seg, i) =>
        seg.bold ? (
          <strong key={i} className="font-semibold text-foreground">
            {seg.text}
          </strong>
        ) : (
          <span key={i}>{seg.text}</span>
        ),
      )}
    </>
  );
}

function BlockView({ block }: { block: BlogBlock }) {
  switch (block.type) {
    case "h2":
      return (
        <h2 className="mt-10 text-xl font-bold tracking-tight text-foreground first:mt-0 sm:text-2xl">
          <InlineText text={block.text} />
        </h2>
      );
    case "h3":
      return (
        <h3 className="mt-8 text-lg font-semibold text-foreground">
          <InlineText text={block.text} />
        </h3>
      );
    case "ul":
      return (
        <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-relaxed text-ink-muted">
          {block.items.map((item, i) => (
            <li key={i}>
              <InlineText text={item} />
            </li>
          ))}
        </ul>
      );
    case "paragraph":
      return (
        <p className="mt-4 text-base leading-[1.75] text-ink-muted sm:text-[1.0625rem]">
          <InlineText text={block.text} />
        </p>
      );
    default:
      return null;
  }
}

function BlogArticleHtml({ content }: { content: string }) {
  const safe = sanitizeBlogHtml(content);
  if (!safe.trim()) return null;

  return (
    <article
      className="blog-article-body blog-article-html"
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}

export function BlogArticleBody({ content }: { content: string }) {
  if (!content.trim()) return null;

  if (isBlogHtmlContent(content)) {
    return <BlogArticleHtml content={content} />;
  }

  const blocks = parseBlogBody(content);
  if (blocks.length === 0) return null;

  return (
    <article className="blog-article-body">
      {blocks.map((block, i) => (
        <BlockView key={i} block={block} />
      ))}
    </article>
  );
}
