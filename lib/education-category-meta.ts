import type { EducationCategory } from "@/lib/education-categories";
import type { Dictionary } from "@/lib/i18n";

export const categoryNavKeys: Record<EducationCategory, keyof Dictionary["nav"]> = {
  forex: "educationForex",
  stock: "educationStock",
  crypto: "educationCrypto",
  siac: "educationSiac",
};

export const categoryHintKeys: Record<EducationCategory, keyof Dictionary["course"]> = {
  forex: "categoryForexHint",
  stock: "categoryStockHint",
  crypto: "categoryCryptoHint",
  siac: "categorySiacHint",
};
