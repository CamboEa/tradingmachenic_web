import DOMPurify from "isomorphic-dompurify";

const BLOG_HTML_ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "em",
  "u",
  "s",
  "h2",
  "h3",
  "ul",
  "ol",
  "li",
  "blockquote",
  "a",
];

const BLOG_HTML_ALLOWED_ATTR = ["href", "target", "rel"];

export function sanitizeBlogHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: BLOG_HTML_ALLOWED_TAGS,
    ALLOWED_ATTR: BLOG_HTML_ALLOWED_ATTR,
  });
}
