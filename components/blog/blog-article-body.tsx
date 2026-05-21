import { parseBlogBody, splitBoldSegments, type BlogBlock } from "@/lib/blog-content";

function InlineText({ text }: { text: string }) {
  const segments = splitBoldSegments(text);
  return (
    <>
      {segments.map((seg, i) =>
        seg.bold ? (
          <strong key={i} className="font-semibold text-[#1e293b]">
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
        <h2 className="mt-10 text-xl font-bold tracking-tight text-[#1e293b] first:mt-0 sm:text-2xl">
          <InlineText text={block.text} />
        </h2>
      );
    case "h3":
      return (
        <h3 className="mt-8 text-lg font-semibold text-[#1e293b]">
          <InlineText text={block.text} />
        </h3>
      );
    case "ul":
      return (
        <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-relaxed text-slate-600">
          {block.items.map((item, i) => (
            <li key={i}>
              <InlineText text={item} />
            </li>
          ))}
        </ul>
      );
    case "paragraph":
      return (
        <p className="mt-4 text-base leading-[1.75] text-slate-600 sm:text-[1.0625rem]">
          <InlineText text={block.text} />
        </p>
      );
    default:
      return null;
  }
}

export function BlogArticleBody({ content }: { content: string }) {
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
