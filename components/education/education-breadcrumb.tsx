import Link from "next/link";

export function EducationBreadcrumb({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <p className="mb-6 text-sm">
      <Link href={href} className="inline-flex items-center gap-1.5 font-semibold text-teal transition hover:text-highlight">
        <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
          <path d="M7.78 12.53a.75.75 0 0 1-1.06 0L2.47 8.28a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 1.06L4.81 7h7.44a.75.75 0 0 1 0 1.5H4.81l2.97 2.97a.75.75 0 0 1 0 1.06Z" />
        </svg>
        {label}
      </Link>
    </p>
  );
}
