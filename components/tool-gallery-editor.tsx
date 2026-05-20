"use client";

import { useState } from "react";
import { R2Uploader } from "@/components/r2-uploader";
import {
  MAX_GALLERY_ITEMS,
  type ToolGalleryItem,
} from "@/lib/supabase/tool-gallery";

type GalleryRow = ToolGalleryItem & { key: string };

function newRow(partial?: Partial<ToolGalleryItem>): GalleryRow {
  return {
    key: crypto.randomUUID(),
    image_url: partial?.image_url ?? "",
    description_en: partial?.description_en ?? "",
    description_km: partial?.description_km ?? "",
  };
}

function toGalleryItems(rows: GalleryRow[]): ToolGalleryItem[] {
  return rows
    .filter((r) => r.image_url.trim().length > 0)
    .map(({ image_url, description_en, description_km }) => ({
      image_url: image_url.trim(),
      ...(description_en?.trim() ? { description_en: description_en.trim() } : {}),
      ...(description_km?.trim() ? { description_km: description_km.trim() } : {}),
    }));
}

export function ToolGalleryEditor({
  initialItems = [],
  onChange,
}: {
  initialItems?: ToolGalleryItem[];
  onChange: (items: ToolGalleryItem[]) => void;
}) {
  const [rows, setRows] = useState<GalleryRow[]>(() =>
    initialItems.length > 0 ? initialItems.map((item) => newRow(item)) : [],
  );

  const sync = (next: GalleryRow[]) => {
    setRows(next);
    onChange(toGalleryItems(next));
  };

  const updateRow = (key: string, patch: Partial<GalleryRow>) => {
    sync(rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  };

  const removeRow = (key: string) => {
    sync(rows.filter((r) => r.key !== key));
  };

  const addRow = () => {
    if (rows.length >= MAX_GALLERY_ITEMS) return;
    sync([...rows, newRow()]);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-slate-500">
          Add screenshots or backtest charts. Each image can have English and Khmer captions.
        </p>
        <button
          type="button"
          onClick={addRow}
          disabled={rows.length >= MAX_GALLERY_ITEMS}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#1e293b] transition hover:border-[#0ea5e9]/40 hover:text-[#0ea5e9] disabled:cursor-not-allowed disabled:opacity-50"
        >
          + Add image
        </button>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-xs text-slate-500">
          No gallery images yet. Use &quot;Add image&quot; to upload proof screenshots.
        </p>
      ) : null}

      {rows.map((row, index) => (
        <div
          key={row.key}
          className="rounded-xl border border-slate-200 bg-slate-50/80 p-4"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Image {index + 1}
            </span>
            <button
              type="button"
              onClick={() => removeRow(row.key)}
              className="text-xs font-semibold text-red-600 hover:text-red-700"
            >
              Remove
            </button>
          </div>

          <R2Uploader
            bucketName="trading-tool"
            accept="image/png,image/jpeg,image/webp"
            label="Gallery image"
            hint="PNG, JPG, WebP — max 20 MB"
            initialUrl={row.image_url || undefined}
            onUploaded={(url) => updateRow(row.key, { image_url: url })}
          />

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Caption (English)
              </label>
              <textarea
                rows={2}
                value={row.description_en ?? ""}
                onChange={(e) => updateRow(row.key, { description_en: e.target.value })}
                placeholder="e.g. Forward test on XAUUSD H1, Jan–Mar 2025…"
                className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Caption (Khmer)
              </label>
              <textarea
                rows={2}
                value={row.description_km ?? ""}
                onChange={(e) => updateRow(row.key, { description_km: e.target.value })}
                placeholder="ពិពណ៌នារូបភាព…"
                className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
