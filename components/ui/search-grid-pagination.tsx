"use client";

interface SearchGridPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function SearchGridPagination({
  page,
  totalPages,
  onPageChange,
}: SearchGridPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav
      className="mt-8 flex justify-center"
      aria-label="Pagination"
    >
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(0, page - 1))}
          disabled={page === 0}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-teal/40 hover:text-teal disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Previous page"
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
            <path
              fillRule="evenodd"
              d="M9.78 4.22a.75.75 0 0 1 0 1.06L7.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L5.47 8.53a.75.75 0 0 1 0-1.06l3.25-3.25a.75.75 0 0 1 1.06 0Z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onPageChange(i)}
            className={`flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-lg border px-2 text-xs font-semibold transition ${
              i === page
                ? "border-teal bg-teal text-white"
                : "border-slate-200 bg-white text-slate-500 hover:border-teal/40 hover:text-teal"
            }`}
            aria-label={`Page ${i + 1}`}
            aria-current={i === page ? "page" : undefined}
          >
            {i + 1}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
          disabled={page === totalPages - 1}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-teal/40 hover:text-teal disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Next page"
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
            <path
              fillRule="evenodd"
              d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 1 1-1.06-1.06L9.19 8 6.22 5.03a.75.75 0 0 1 0-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </nav>
  );
}

export function paginateItems<T>(items: T[], page: number, perPage: number): T[] {
  return items.slice(page * perPage, (page + 1) * perPage);
}

export function totalPagesFor(count: number, perPage: number): number {
  return Math.max(1, Math.ceil(count / perPage));
}
