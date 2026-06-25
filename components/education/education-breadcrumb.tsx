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
      <Link href={href} className="font-semibold text-teal transition hover:text-highlight">
        ← {label}
      </Link>
    </p>
  );
}
