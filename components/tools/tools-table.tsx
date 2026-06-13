"use client";

import { DeleteToolButton } from "@/components/tools/delete-tool-button";
import {
  AdminTable,
  Badge,
  EditLink,
  RowActions,
  TableThumb,
  type Column,
  type Filter,
} from "@/components/ui";
import type { Tool } from "@/lib/supabase/tools";

const columns: Column<Tool>[] = [
  {
    header: "Tool",
    cell: (tool) => (
      <div className="flex items-center gap-3">
        <TableThumb src={tool.image_url} alt={tool.name} />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate font-semibold text-slate-brand">{tool.name}</span>
            <span className="shrink-0 text-xs text-slate-400">v{tool.version}</span>
          </div>
          {tool.description_en ? (
            <p className="mt-0.5 line-clamp-1 max-w-md text-xs text-slate-400">
              {tool.description_en}
            </p>
          ) : null}
        </div>
      </div>
    ),
  },
  {
    header: "Type",
    cell: (tool) => (
      <Badge variant="neutral">{tool.type === "indicator" ? "Indicator" : "Expert Advisor"}</Badge>
    ),
  },
  {
    header: "Platform",
    cell: (tool) => <Badge variant="neutral">{tool.platform}</Badge>,
  },
  {
    header: "Pricing",
    cell: (tool) => (
      <Badge variant={tool.pricing === "free" ? "teal" : "gold"}>
        {tool.pricing === "free" ? "Free" : "Paid"}
      </Badge>
    ),
  },
  {
    header: "Downloads",
    align: "center",
    cell: (tool) => (
      <div className="leading-tight">
        <div className="font-semibold tabular-nums text-slate-brand">{tool.download_count}</div>
        {tool.platform === "MT4 & MT5" ? (
          <div className="mt-0.5 text-xs text-slate-400">
            MT4 {tool.download_count_mt4} · MT5 {tool.download_count_mt5}
          </div>
        ) : null}
      </div>
    ),
  },
  {
    header: "Status",
    cell: (tool) => (
      <Badge variant={tool.status === "published" ? "published" : "draft"}>
        {tool.status === "published" ? "Published" : "Draft"}
      </Badge>
    ),
  },
  {
    header: "Actions",
    align: "right",
    cell: (tool) => (
      <RowActions>
        <EditLink href={`/admin/tools/edit/${tool.id}`} />
        <DeleteToolButton id={tool.id} name={tool.name} />
      </RowActions>
    ),
  },
];

const filter: Filter<Tool> = {
  allLabel: "All tools",
  groups: [
    {
      label: "Status",
      options: [
        { label: "Published", value: "status:published", predicate: (t) => t.status === "published" },
        { label: "Draft", value: "status:draft", predicate: (t) => t.status === "draft" },
      ],
    },
    {
      label: "Type",
      options: [
        { label: "Indicator", value: "type:indicator", predicate: (t) => t.type === "indicator" },
        { label: "Expert Advisor", value: "type:ea", predicate: (t) => t.type === "ea" },
      ],
    },
    {
      label: "Pricing",
      options: [
        { label: "Free", value: "pricing:free", predicate: (t) => t.pricing === "free" },
        { label: "Paid", value: "pricing:paid", predicate: (t) => t.pricing === "paid" },
      ],
    },
  ],
};

export function ToolsTable({ tools }: { tools: Tool[] }) {
  return (
    <AdminTable
      data={tools}
      getKey={(tool) => tool.id}
      columns={columns}
      filter={filter}
      searchPlaceholder="Search tools by name…"
      searchText={(tool) => `${tool.name} ${tool.description_en ?? ""} ${tool.platform}`}
    />
  );
}
