import type { EducationCategory } from "@/lib/education-categories";

/** FIN HUB KH brand tokens (see app/globals.css). */
export const brand = {
  slate: "#162220",
  gold: "#7ab8b8",
  background: "#0a100f",
  surfaceSoft: "#1a2a28",
  inkMuted: "#94a8a5",
  bridge: "#2d4542",
} as const;

const categoryOptionImages: Record<EducationCategory, string> = {
  forex: "/background_image/each_option/forex.png",
  stock: "/background_image/each_option/stock.png",
  crypto: "/background_image/each_option/crypto.png",
  siac: "/background_image/each_option/siac.png",
};

export type CategoryTheme = {
  slug: EducationCategory;
  image: string;
  tagline: string;
};

export const educationCategoryThemes: Record<EducationCategory, CategoryTheme> = {
  forex: {
    slug: "forex",
    image: categoryOptionImages.forex,
    tagline: "Currency markets & execution",
  },
  stock: {
    slug: "stock",
    image: categoryOptionImages.stock,
    tagline: "Equities & market structure",
  },
  crypto: {
    slug: "crypto",
    image: categoryOptionImages.crypto,
    tagline: "Digital assets & volatility",
  },
  siac: {
    slug: "siac",
    image: categoryOptionImages.siac,
    tagline: "Securities & community education",
  },
};

export function getCategoryTheme(category: EducationCategory): CategoryTheme {
  return educationCategoryThemes[category];
}

export function getCategoryImage(category: EducationCategory): string {
  return getCategoryTheme(category).image;
}
