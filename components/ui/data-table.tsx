import Link from "next/link";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/ui/cn";
import { ui } from "@/lib/ui/styles";

/**
 * DataTable — the standard admin list surface.
 *
 * Wrap <Th> cells in `head` and <Td>/<Tr> rows as children:
 *
 *   <DataTable head={<><Th>Name</Th><Th align="right">Actions</Th></>}>
 *     {rows.map((r) => (
 *       <Tr key={r.id}>
 *         <Td>{r.name}</Td>
 *         <Td align="right"><RowActions>…</RowActions></Td>
 *       </Tr>
 *     ))}
 *   </DataTable>
 */
export function DataTable({
  head,
  children,
  className,
}: {
  head: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card padding={false} className={cn("overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className={ui.tableHeadRow}>{head}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">{children}</tbody>
        </table>
      </div>
    </Card>
  );
}

const alignClass = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const;

export function Th({
  children,
  align = "left",
  className,
}: {
  children?: React.ReactNode;
  align?: keyof typeof alignClass;
  className?: string;
}) {
  return <th className={cn(ui.tableTh, alignClass[align], className)}>{children}</th>;
}

export function Tr({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <tr className={cn(ui.tableRow, className)}>{children}</tr>;
}

export function Td({
  children,
  align = "left",
  className,
}: {
  children?: React.ReactNode;
  align?: keyof typeof alignClass;
  className?: string;
}) {
  return <td className={cn(ui.tableTd, alignClass[align], className)}>{children}</td>;
}

/** Thumbnail cell content: image or a consistent placeholder. */
export function TableThumb({
  src,
  alt = "",
  className,
  rounded = "rounded-lg",
}: {
  src?: string | null;
  alt?: string;
  className?: string;
  rounded?: string;
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={cn("h-12 w-12 shrink-0 border border-bridge/30 object-cover", rounded, className)}
      />
    );
  }
  return (
    <div
      className={cn(
        "flex h-12 w-12 shrink-0 items-center justify-center border border-bridge/30 bg-surface-soft text-slate-300",
        rounded,
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z"
        />
      </svg>
    </div>
  );
}

/** Right-aligned container for row action buttons. */
export function RowActions({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center justify-end gap-1.5">{children}</div>;
}

const PencilIcon = (
  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
    <path d="M2.695 14.762l-1.262 3.155a.5.5 0 0 0 .65.65l3.155-1.262a4 4 0 0 0 1.343-.886L17.5 5.501a2.121 2.121 0 0 0-3-3L3.58 13.419a4 4 0 0 0-.885 1.343Z" />
  </svg>
);

/** Edit action: a square icon link for table rows. */
export function EditLink({ href, label = "Edit" }: { href: string; label?: string }) {
  return (
    <Link href={href} className={ui.iconBtn} aria-label={label} title={label}>
      {PencilIcon}
    </Link>
  );
}
