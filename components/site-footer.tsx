import type { Dictionary } from "@/lib/i18n";

export function SiteFooter({ dict }: { dict: Dictionary }) {
  return (
    <footer className="mt-auto border-t border-[color-mix(in_oklab,var(--color-bridge)_12%,transparent)] bg-[var(--color-surface)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-[var(--color-ink-muted)] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>{dict.footer.tagline}</p>
        <p className="text-[var(--color-ink-soft)]">{dict.footer.rights}</p>
      </div>
    </footer>
  );
}
