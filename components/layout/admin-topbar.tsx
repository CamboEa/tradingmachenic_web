"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { SiteLogo } from "@/components/shared/site-logo";
import {
  NAV,
  currentAdminLabel,
  currentAdminNavItem,
  isNavActive,
} from "@/components/layout/admin-nav";

export function AdminTopbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const label = currentAdminLabel(pathname);
  const section = currentAdminNavItem(pathname);
  const backHref =
    section && pathname !== section.href
      ? section.href
      : pathname !== "/admin"
        ? "/admin"
        : null;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-bridge/40 bg-surface/85 px-4 backdrop-blur-md lg:px-10">
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-bridge/40 text-ink-muted transition hover:bg-surface-soft lg:hidden"
          aria-label="Open navigation menu"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
            <path fillRule="evenodd" d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75ZM2 10a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10Zm0 5.25a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
          </svg>
        </button>

        {backHref ? (
          <Link
            href={backHref}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center gap-1.5 rounded-lg text-sm font-semibold text-ink-muted transition hover:bg-surface-soft hover:text-foreground sm:w-20"
          >
            <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4" aria-hidden>
              <path d="M7.78 12.53a.75.75 0 0 1-1.06 0L2.47 8.28a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 1.06L4.81 7h7.44a.75.75 0 0 1 0 1.5H4.81l2.97 2.97a.75.75 0 0 1 0 1.06Z" />
            </svg>
            <span className="hidden sm:inline">Back</span>
          </Link>
        ) : (
          <span aria-hidden className="h-9 w-9 shrink-0 sm:w-20" />
        )}

        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex h-9 items-center gap-1.5 border-l border-bridge/40 pl-3 text-sm"
        >
          <span className="font-medium text-ink-soft">Admin</span>
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 text-ink-muted">
            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.168 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Z" clipRule="evenodd" />
          </svg>
          <span className="font-semibold text-foreground">{label}</span>
        </nav>
      </div>

      <Link
        href="/"
        target="_blank"
        className="inline-flex items-center gap-1.5 rounded-lg border border-bridge/40 bg-surface px-3 py-1.5 text-xs font-semibold text-ink-muted transition hover:border-teal/40 hover:text-teal"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
          <path d="M11 3a1 1 0 1 0 0 2h2.586l-6.293 6.293a1 1 0 1 0 1.414 1.414L15 6.414V9a1 1 0 1 0 2 0V4a1 1 0 0 0-1-1h-5Z" />
          <path d="M5 5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-3a1 1 0 1 0-2 0v3H5V7h3a1 1 0 0 0 0-2H5Z" />
        </svg>
        View site
      </Link>

      {/* Mobile drawer */}
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          />
          <div className="absolute left-0 top-0 flex h-full w-72 max-w-[85%] flex-col bg-slate-brand shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-3">
                <SiteLogo size="sm" className="rounded-lg ring-1 ring-white/10" />
                <p className="text-sm font-semibold text-white">Admin Panel</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/8 hover:text-white"
                aria-label="Close"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                  <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                </svg>
              </button>
            </div>
            <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
              {NAV.map((section) => (
                <div key={section.heading}>
                  <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {section.heading}
                  </p>
                  <ul className="space-y-0.5">
                    {section.items.map((item) => {
                      const active = isNavActive(item.href, pathname);
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className={[
                              "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                              active
                                ? "bg-white/10 text-white"
                                : "text-slate-400 hover:bg-white/8 hover:text-white",
                            ].join(" ")}
                          >
                            <span className={active ? "text-teal" : "text-slate-500 group-hover:text-slate-200"}>
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
          </div>
        </div>
      ) : null}
    </header>
  );
}
