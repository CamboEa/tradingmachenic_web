import type { EducationCategory } from "@/lib/education-categories";

/** FIN HUB KH brand tokens — match app/globals.css (logoV4 teal/cyan). */
export const brand = {
  slate: "#182428",
  gold: "#2ee8f5",
  teal: "#0a9396",
  highlight: "#00e5ff",
  background: "#182428",
  surfaceSoft: "#2a3f46",
  inkMuted: "#a8e8ea",
  bridge: "#35565c",
} as const;

const categoryOptionImages: Record<EducationCategory, string> = {
  forex: "/background_image/each_option/forex.png",
  stock: "/background_image/each_option/stock.png",
  crypto: "/background_image/each_option/crypto.png",
  siac: "/background_image/each_option/siac.png",
};

/** Wide hero banners — left side kept darker for readable titles. */
const categoryHeaderImages: Record<EducationCategory, string> = {
  forex: "/Images/bg-forex-header.png",
  stock: "/Images/bg-stock-header.png",
  crypto: "/Images/bg-crypto-header.png",
  siac: "/background_image/educaiton_background.png",
};

export const educationHubHeaderImage = "/Images/bg-education-header.png";

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
