export type BlogBlock =
  | { type: "paragraph"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] };

/** Lightweight markup: ## / ### headings, - bullets, blank line paragraphs. */
export function parseBlogBody(raw: string): BlogBlock[] {
  const blocks: BlogBlock[] = [];
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  let ulItems: string[] = [];

  const flushUl = () => {
    if (ulItems.length > 0) {
      blocks.push({ type: "ul", items: [...ulItems] });
      ulItems = [];
    }
  };

  let i = 0;
  while (i < lines.length) {
    const trimmed = lines[i].trim();
    if (!trimmed) {
      flushUl();
      i++;
      continue;
    }

    if (trimmed.startsWith("## ")) {
      flushUl();
      blocks.push({ type: "h2", text: trimmed.slice(3).trim() });
      i++;
      continue;
    }

    if (trimmed.startsWith("### ")) {
      flushUl();
      blocks.push({ type: "h3", text: trimmed.slice(4).trim() });
      i++;
      continue;
    }

    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      ulItems.push(trimmed.slice(2).trim());
      i++;
      continue;
    }

    flushUl();
    const paraLines = [trimmed];
    i++;
    while (i < lines.length && lines[i].trim()) {
      const next = lines[i].trim();
      if (next.startsWith("## ") || next.startsWith("### ") || next.startsWith("- ") || next.startsWith("* ")) {
        break;
      }
      paraLines.push(next);
      i++;
    }
    blocks.push({ type: "paragraph", text: paraLines.join(" ") });
  }

  flushUl();
  return blocks;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inlineMarkdownToHtml(text: string): string {
  return splitBoldSegments(text)
    .map((seg) =>
      seg.bold ? `<strong>${escapeHtml(seg.text)}</strong>` : escapeHtml(seg.text),
    )
    .join("");
}

/** True when content was saved from the rich text editor (HTML). */
export function isBlogHtmlContent(raw: string): boolean {
  const t = raw.trim();
  if (!t.startsWith("<")) return false;
  return /<\/?(p|h[1-6]|ul|ol|li|div|br|strong|em)\b/i.test(t);
}

/** Convert legacy markdown articles for the rich text editor. */
export function blogMarkdownToHtml(raw: string): string {
  const blocks = parseBlogBody(raw);
  if (blocks.length === 0) return "";
  return blocks
    .map((block) => {
      switch (block.type) {
        case "h2":
          return `<h2>${inlineMarkdownToHtml(block.text)}</h2>`;
        case "h3":
          return `<h3>${inlineMarkdownToHtml(block.text)}</h3>`;
        case "ul":
          return `<ul>${block.items.map((item) => `<li><p>${inlineMarkdownToHtml(item)}</p></li>`).join("")}</ul>`;
        case "paragraph":
          return `<p>${inlineMarkdownToHtml(block.text)}</p>`;
        default:
          return "";
      }
    })
    .join("");
}

/** Normalize stored body for TipTap (HTML as-is, markdown converted). */
export function blogBodyForEditor(raw: string): string {
  if (!raw.trim()) return "";
  if (isBlogHtmlContent(raw)) return raw;
  return blogMarkdownToHtml(raw);
}

/** True when editor HTML has no meaningful text. */
export function isBlogBodyEmpty(html: string): boolean {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length === 0;
}

/** Split **bold** segments for inline rendering. */
export function splitBoldSegments(text: string): { bold: boolean; text: string }[] {
  const parts: { bold: boolean; text: string }[] = [];
  const re = /\*\*(.+?)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      parts.push({ bold: false, text: text.slice(last, m.index) });
    }
    parts.push({ bold: true, text: m[1] });
    last = m.index + m[0].length;
  }
  if (last < text.length) {
    parts.push({ bold: false, text: text.slice(last) });
  }
  return parts.length > 0 ? parts : [{ bold: false, text }];
}
