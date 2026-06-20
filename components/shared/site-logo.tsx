import Image from "next/image";

import { BRAND_NAME } from "@/lib/brand";

/** Public path to the FH emblem (see `public/Logo/logoV4.png`). */
export const LOGO_SRC = "/Logo/logoV4.png";

const SIZES = {
  sm:  { box: "h-8 w-8 object-contain",  w: 1024, h: 1024 },
  md:  { box: "h-10 w-10 object-contain", w: 1024, h: 1024 },
  lg:  { box: "h-12 w-12 object-contain", w: 1024, h: 1024 },
  /** FH emblem for the site header — pairs with the FINHUBKH wordmark */
  nav: { box: "h-9 w-9 object-contain",   w: 1024, h: 1024 },
  /** Hero headline — large display */
  hero: { box: "h-32 w-32 object-contain sm:h-36 sm:w-36 lg:h-44 lg:w-44", w: 1024, h: 1024 },
} as const;

type SiteLogoSize = keyof typeof SIZES;

export function SiteLogo({
  size = "md",
  className = "",
  priority = false,
}: {
  size?: SiteLogoSize;
  className?: string;
  priority?: boolean;
}) {
  const { box, w, h } = SIZES[size];

  return (
    <Image
      src={LOGO_SRC}
      alt={BRAND_NAME}
      width={w}
      height={h}
      priority={priority}
      className={`${box} shrink-0 ${className}`.trim()}
    />
  );
}
