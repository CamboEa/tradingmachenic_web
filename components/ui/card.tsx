import { cn } from "@/lib/ui/cn";
import { ui } from "@/lib/ui/styles";

export function Card({
  children,
  className,
  hover,
  padding = true,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: boolean;
}) {
  return (
    <div
      className={cn(
        ui.cardSolid,
        hover && ui.cardHover,
        padding && "p-5 sm:p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Panel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn(ui.panel, className)}>{children}</div>;
}
