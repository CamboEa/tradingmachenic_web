import { cn } from "@/lib/ui/cn";
import { ui } from "@/lib/ui/styles";

export function Eyebrow({
  children,
  variant = "public",
  className,
}: {
  children: React.ReactNode;
  variant?: "public" | "admin" | "muted";
  className?: string;
}) {
  return (
    <p
      className={cn(
        variant === "public" && ui.eyebrowPublic,
        variant === "admin" && ui.eyebrowAdmin,
        variant === "muted" && ui.sectionLabel,
        className,
      )}
    >
      {children}
    </p>
  );
}
