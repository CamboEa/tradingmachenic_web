import type { EducationCategory } from "@/lib/education-categories";

/** FIN HUB KH brand tokens (see app/globals.css). */
export const brand = {
  slate: "#22332E",
  gold: "#629696",
  background: "#F8FAFC",
  surfaceSoft: "#EEF8F7",
  inkMuted: "#4A6462",
  bridge: "#B2CECE",
} as const;

const categoryOptionImages: Record<EducationCategory, string> = {
  forex: "/background_image/each_option/forex.png",
  stock: "/background_image/each_option/stock.png",
  crypto: "/background_image/each_option/crypto.png",
  siac: "/background_image/each_option/siac.png",
};

/** Shared page header for Forex / Stock / Crypto / SIAC (swap per category when assets exist). */
const categoryHeaderImages: Record<EducationCategory, string> = {
  forex: "/Images/bg-forex-header.png",
  stock: "/Images/bg-forex-header.png",
  crypto: "/Images/bg-forex-header.png",
  siac: "/Images/bg-forex-header.png",
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

export function getCategoryHeaderImage(category: EducationCategory): string {
  return categoryHeaderImages[category];
}
