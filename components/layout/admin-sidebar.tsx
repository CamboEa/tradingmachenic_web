"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SiteLogo } from "@/components/shared/site-logo";
import { BRAND_NAME } from "@/lib/brand";
import { NAV, isNavActive } from "@/components/layout/admin-nav";

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-white/10 bg-slate-brand text-slate-300 lg:flex">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
        <SiteLogo size="md" className="rounded-lg ring-1 ring-white/10" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{BRAND_NAME}</p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Admin Panel
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {NAV.map((section) => (
          <div key={section.heading}>
            <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-soft">
              {section.heading}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = isNavActive(item.href, pathname);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={[
                        "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-surface/5 text-white"
                          : "text-slate-400 hover:bg-surface/5 hover:text-white",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-gold transition-opacity",
                          active ? "opacity-100" : "opacity-0",
                        ].join(" ")}
                        aria-hidden
                      />
                      <span className={active ? "text-foreground" : "text-ink-soft group-hover:text-slate-300"}>
                        {item.icon}
                      </span>
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 px-3 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-400 transition-colors hover:bg-surface/5 hover:text-white"
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
            <path d="M7.78 12.53a.75.75 0 0 1-1.06 0L2.47 8.28a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 1.06L4.81 7h7.44a.75.75 0 0 1 0 1.5H4.81l2.97 2.97a.75.75 0 0 1 0 1.06Z" />
          </svg>
          Back to site
        </Link>
      </div>
    </aside>
  );
}
