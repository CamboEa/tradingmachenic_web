import Link from "next/link";
import { cn } from "@/lib/ui/cn";
import { ui } from "@/lib/ui/styles";

const variants = {
  primary: ui.btnPrimary,
  secondary: ui.btnSecondary,
  ghost: ui.btnGhost,
  gold: ui.btnGold,
  danger: ui.btnDanger,
} as const;

type Variant = keyof typeof variants;

function buttonClass(variant: Variant, className?: string) {
  return cn(variants[variant], className);
}

export function Button({
  children,
  variant = "primary",
  className,
  type = "button",
  disabled,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={buttonClass(variant, className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className,
}: {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <Link href={href} className={buttonClass(variant, className)}>
      {children}
    </Link>
  );
}
