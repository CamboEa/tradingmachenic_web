"use client";

import { signOut } from "@/lib/supabase/actions";

export function SignOutButton({ label }: { label: string }) {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="rounded-lg border border-[color-mix(in_oklab,var(--color-bridge)_55%,transparent)] px-3 py-1.5 text-xs font-semibold text-(--color-ink-muted) transition hover:border-[color-mix(in_oklab,var(--color-bridge)_80%,transparent)] hover:text-(--color-ink) sm:px-4 sm:py-2 sm:text-sm"
      >
        {label}
      </button>
    </form>
  );
}
