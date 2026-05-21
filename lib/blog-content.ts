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
