"use client";

import { useEffect, useRef, useState } from "react";

type Option<T extends string> = { value: T; label: string };

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      aria-hidden
    >
      <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 shrink-0 text-teal" aria-hidden>
      <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
    </svg>
  );
}

export function Dropdown<T extends string>({
  value,
  options,
  onChange,
  className,
}: {
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value) ?? options[0];

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  return (
    <div ref={ref} className={`relative ${className ?? ""}`}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-full w-full min-w-36 cursor-pointer items-center justify-between gap-3 rounded-xl border border-bridge/40 bg-surface px-4 py-2.5 text-sm font-semibold text-ink-muted shadow-sm transition hover:border-bridge/60 hover:bg-surface-soft focus:outline-none focus:ring-2 focus:ring-teal/25"
      >
        <span>{selected.label}</span>
        <ChevronDown open={open} />
      </button>

      {/* Panel */}
      {open && (
        <ul
          role="listbox"
          aria-label="Filter options"
          className="absolute left-0 top-full z-30 mt-1.5 min-w-full overflow-hidden rounded-xl border border-bridge/40 bg-surface py-1 shadow-lg shadow-black/25 ring-1 ring-black/5 animate-in fade-in slide-in-from-top-1 duration-150"
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`flex cursor-pointer items-center justify-between gap-4 px-4 py-2.5 text-sm transition-colors ${
                  isSelected
                    ? "bg-teal/5 font-semibold text-teal"
                    : "text-ink-muted hover:bg-surface-soft"
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <CheckIcon />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
