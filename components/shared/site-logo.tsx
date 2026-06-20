import Image from "next/image";

import { BRAND_NAME } from "@/lib/brand";

/** Public path to the brand mark (see `public/Logo/logov2.png`). */
export const LOGO_SRC = "/Logo/logov2.png";

const SIZES = {
 sm: { box: "h-8 w-8", px: 32 },
 md: { box: "h-10 w-10", px: 40 },
 lg: { box: "h-12 w-12", px: 48 },
 /** Hero headline — large display, no extra chrome */
 hero: { box: "h-32 w-32 sm:h-36 sm:w-36 lg:h-44 lg:w-44", px: 176 },
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
 const { box, px } = SIZES[size];

 return (
 <Image
 src={LOGO_SRC}
 alt={BRAND_NAME}
 width={px}
 height={px}
 priority={priority}
 className={`${box} shrink-0 object-contain ${className}`.trim()}
 />
 );
}
