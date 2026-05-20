export type ToolGalleryItem = {
  image_url: string;
  description_en?: string;
  description_km?: string;
};

const MAX_GALLERY_ITEMS = 12;

export function parseToolGallery(raw: unknown): ToolGalleryItem[] {
  if (!Array.isArray(raw)) return [];

  const items: ToolGalleryItem[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const row = entry as Record<string, unknown>;
    const image_url = typeof row.image_url === "string" ? row.image_url.trim() : "";
    if (!image_url) continue;

    const description_en =
      typeof row.description_en === "string" ? row.description_en.trim() : "";
    const description_km =
      typeof row.description_km === "string" ? row.description_km.trim() : "";

    items.push({
      image_url,
      ...(description_en ? { description_en } : {}),
      ...(description_km ? { description_km } : {}),
    });
    if (items.length >= MAX_GALLERY_ITEMS) break;
  }
  return items;
}

export function normalizeToolGallery(items: ToolGalleryItem[]): ToolGalleryItem[] {
  return parseToolGallery(items);
}

export { MAX_GALLERY_ITEMS };
