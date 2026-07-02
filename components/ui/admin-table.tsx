"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { DataTable, Td, Th, Tr } from "@/components/ui/data-table";
import { cn } from "@/lib/ui/cn";

/** Builds a compact page list with ellipses, e.g. [1, "…", 4, 5, 6, "…", 12]. */
function buildPageList(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "…")[] = [1];
  const left = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);

  if (left > 2) pages.push("…");
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < total - 1) pages.push("…");

  pages.push(total);
  return pages;
}

type Align = "left" | "center" | "right";

export type Column<T> = {
  /** Header label. */
  header: React.ReactNode;
  /** Cell renderer for a row. */
  cell: (item: T) => React.ReactNode;
  align?: Align;
  /** Extra classes applied to both the <th> and <td> (e.g. widths). */
  className?: string;
  tdClassName?: string;
};

export type FilterOption<T> = {
  label: string;
  /** Must be unique across the whole filter. */
  value: string;
  /** Return true to keep the item when this option is selected. */
  predicate: (item: T) => boolean;
};

export type FilterGroup<T> = {
  /** Optional <optgroup> label, e.g. "Status". */
  label?: string;
  options: FilterOption<T>[];
};

/** A single combined dropdown that groups every filter option together. */
export type Filter<T> = {
  /** Label for the "no filter" option, e.g. "All tools". */
  allLabel?: string;
  groups: FilterGroup<T>[];
};

export function AdminTable<T>({
  data,
  getKey,
  columns,
  searchText,
  searchPlaceholder = "Search…",
  filter,
  pageSize = 10,
  rowHref,
}: {
  data: T[];
  getKey: (item: T) => string;
  columns: Column<T>[];
  /** Returns the text searched against for an item. */
  searchText?: (item: T) => string;
  searchPlaceholder?: string;
  filter?: Filter<T>;
  /** Rows shown per page. Defaults to 10. */
  pageSize?: number;
  rowHref?: (item: T) => string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filterValue, setFilterValue] = useState("all");
  const [page, setPage] = useState(1);

  const predicateMap = useMemo(() => {
    const map = new Map<string, (item: T) => boolean>();
    filter?.groups.forEach((group) => {
      group.options.forEach((option) => map.set(option.value, option.predicate));
    });
    return map;
  }, [filter]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const predicate = filterValue === "all" ? null : predicateMap.get(filterValue);
    return data.filter((item) => {
      if (q && searchText && !searchText(item).toLowerCase().includes(q)) return false;
      if (predicate && !predicate(item)) return false;
      return true;
    });
  }, [data, query, filterValue, predicateMap, searchText]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const paged = filtered.slice(startIndex, startIndex + pageSize);
  const pageList = buildPageList(currentPage, totalPages);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {searchText ? (
          <div className="relative flex-1">
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft"
              aria-hidden
            >
              <path
                fillRule="evenodd"
                d="M9 3.5a5.5 5.5 0 1 0 3.215 9.96l3.162 3.163a.75.75 0 1 0 1.061-1.06l-3.162-3.163A5.5 5.5 0 0 0 9 3.5ZM5 9a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z"
                clipRule="evenodd"
              />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              className="w-full rounded-xl border border-bridge/40 bg-surface py-2.5 pl-9 pr-3 text-sm text-foreground outline-none transition placeholder:text-ink-soft focus:border-teal focus:ring-2 focus:ring-teal/20"
            />
          </div>
        ) : null}

        {filter ? (
          <div className="relative">
            <select
              value={filterValue}
              onChange={(e) => {
                setFilterValue(e.target.value);
                setPage(1);
              }}
              aria-label="Filter"
              className="w-full cursor-pointer appearance-none rounded-xl border border-bridge/40 bg-surface py-2.5 pl-3 pr-9 text-sm font-medium text-ink-muted outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20 sm:w-56"
            >
              <option value="all">{filter.allLabel ?? "All"}</option>
              {filter.groups.map((group, gi) =>
                group.label ? (
                  <optgroup key={gi} label={group.label}>
                    {group.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </optgroup>
                ) : (
                  group.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))
                ),
              )}
            </select>
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft"
              aria-hidden
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-bridge/40 bg-surface px-6 py-12 text-center">
          <p className="text-sm font-semibold text-ink-muted">No matching results</p>
          <p className="mt-1 text-sm text-ink-soft">Try a different search term or filter.</p>
        </div>
      ) : (
        <>
          <DataTable
            head={
              <>
                {columns.map((col, i) => (
                  <Th key={i} align={col.align} className={col.className}>
                    {col.header}
                  </Th>
                ))}
              </>
            }
          >
            {paged.map((item) => (
              <Tr
                key={getKey(item)}
                className={rowHref ? "cursor-pointer" : undefined}
                tabIndex={rowHref ? 0 : undefined}
                role={rowHref ? "link" : undefined}
                onClick={
                  rowHref
                    ? (event) => {
                        const target = event.target as HTMLElement | null;
                        if (
                          target?.closest(
                            "a,button,input,select,textarea,label,[role='button']",
                          )
                        ) {
                          return;
                        }
                        router.push(rowHref(item));
                      }
                    : undefined
                }
                onKeyDown={
                  rowHref
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          router.push(rowHref(item));
                        }
                      }
                    : undefined
                }
              >
                {columns.map((col, i) => (
                  <Td key={i} align={col.align} className={cn(col.className, col.tdClassName)}>
                    {col.cell(item)}
                  </Td>
                ))}
              </Tr>
            ))}
          </DataTable>

          {filtered.length > pageSize ? (
            <nav
              className="flex flex-col items-center justify-between gap-3 sm:flex-row"
              aria-label="Pagination"
            >
              <p className="text-sm text-ink-soft">
                Showing{" "}
                <span className="font-semibold text-ink-muted">{startIndex + 1}</span>–
                <span className="font-semibold text-ink-muted">
                  {startIndex + paged.length}
                </span>{" "}
                of <span className="font-semibold text-ink-muted">{filtered.length}</span>
              </p>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="inline-flex h-9 items-center rounded-lg border border-bridge/40 bg-surface px-3 text-sm font-medium text-ink-muted transition hover:bg-surface-soft disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Prev
                </button>

                {pageList.map((p, i) =>
                  p === "…" ? (
                    <span key={`gap-${i}`} className="px-2 text-sm text-ink-soft">
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPage(p)}
                      aria-current={p === currentPage ? "page" : undefined}
                      className={cn(
                        "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-sm font-medium tabular-nums transition",
                        p === currentPage
                          ? "border-teal bg-teal text-white"
                          : "border-bridge/40 bg-surface text-ink-muted hover:bg-surface-soft",
                      )}
                    >
                      {p}
                    </button>
                  ),
                )}

                <button
                  type="button"
                  onClick={() => setPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="inline-flex h-9 items-center rounded-lg border border-bridge/40 bg-surface px-3 text-sm font-medium text-ink-muted transition hover:bg-surface-soft disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </nav>
          ) : null}
        </>
      )}
    </div>
  );
}
