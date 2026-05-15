import Image from "next/image";

/** Public path to the brand mark (see `public/Logo/logo.png`). */
export const LOGO_SRC = "/Logo/logo.png";

const SIZES = {
  sm: { box: "h-8 w-8", px: 32 },
  md: { box: "h-10 w-10", px: 40 },
  lg: { box: "h-12 w-12", px: 48 },
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
      alt="Trading Machenic"
      width={px}
      height={px}
      priority={priority}
      className={`${box} shrink-0 object-contain ${className}`.trim()}
    />
  );
}
