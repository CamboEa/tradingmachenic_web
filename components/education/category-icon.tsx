import type { EducationCategory } from "@/lib/education-categories";

type IconProps = {
  className?: string;
};

export function CategoryForexIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden>
      <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="2.5" opacity="0.35" />
      <path
        d="M18 38c6-10 14-14 22-14s16 4 22 14"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M14 24h36M32 14v36"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.7"
      />
      <circle cx="32" cy="32" r="5" fill="currentColor" />
    </svg>
  );
}

export function CategoryStockIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden>
      <rect x="12" y="30" width="8" height="22" rx="2" fill="currentColor" opacity="0.55" />
      <rect x="24" y="22" width="8" height="30" rx="2" fill="currentColor" opacity="0.75" />
      <rect x="36" y="14" width="8" height="38" rx="2" fill="currentColor" />
      <rect x="48" y="26" width="8" height="26" rx="2" fill="currentColor" opacity="0.65" />
      <path
        d="M10 46h44"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.45"
      />
    </svg>
  );
}

export function CategoryCryptoIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden>
      <circle cx="32" cy="32" r="24" stroke="currentColor" strokeWidth="2.5" />
      <path
        d="M24 22h12c6 0 10 3 10 8s-4 8-10 8H24v-16Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M24 38h14c6 0 10 3 10 8s-4 8-10 8H24V38Z" stroke="currentColor" strokeWidth="2.5" />
      <path d="M28 18v4M36 18v4M28 42v4M36 42v4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function CategorySiacIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden>
      <path
        d="M14 46V24l18-10 18 10v22"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M24 46V34h16v12" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <path
        d="M20 28h24M32 14v8"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.65"
      />
      <circle cx="32" cy="40" r="2.5" fill="currentColor" />
    </svg>
  );
}

const icons = {
  forex: CategoryForexIcon,
  stock: CategoryStockIcon,
  crypto: CategoryCryptoIcon,
  siac: CategorySiacIcon,
} as const;

export function CategoryIcon({
  category,
  className,
}: {
  category: EducationCategory;
  className?: string;
}) {
  const Icon = icons[category];
  return <Icon className={className} />;
}

export function CategoryIconBadge({
  category,
  size = "md",
}: {
  category: EducationCategory;
  size?: "sm" | "md" | "lg";
}) {
  const box =
    size === "sm" ? "h-10 w-10 rounded-xl" : size === "lg" ? "h-16 w-16 rounded-2xl" : "h-12 w-12 rounded-xl";
  const icon = size === "sm" ? "h-5 w-5" : size === "lg" ? "h-9 w-9" : "h-7 w-7";

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center ${box} bg-white/15 text-white ring-1 ring-white/25 backdrop-blur-sm`}
    >
      <CategoryIcon category={category} className={icon} />
    </span>
  );
}
