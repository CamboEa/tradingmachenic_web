import type { Tool } from "@/lib/supabase/tools";

export function getToolDownloadTotal(tool: Tool): number {
  return (tool.download_count ?? 0) + (tool.download_count_mt4 ?? 0) + (tool.download_count_mt5 ?? 0);
}

export function sortToolsByDownloads(tools: Tool[]): Tool[] {
  return [...tools].sort((a, b) => getToolDownloadTotal(b) - getToolDownloadTotal(a));
}

export function formatDownloadCount(total: number): string {
  if (total >= 1_000_000) return `${(total / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (total >= 1_000) return `${(total / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(total);
}
