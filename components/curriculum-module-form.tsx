"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { createCurriculumModule, updateCurriculumModule } from "@/lib/supabase/actions";

type ModuleRow = {
  id: string;
  phase_id: string;
  sort_order: number;
  title_en: string;
  title_km: string;
  focus_en: string;
  focus_km: string;
  activities_en: string;
  activities_km: string;
};

interface Props {
  phaseId: string;
  module?: ModuleRow;
}

export function CurriculumModuleForm({ phaseId, module }: Props) {
  const isEdit = !!module;
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const sort_order = Number(fd.get("sort_order") ?? 0);
    const title_en = (fd.get("title_en") as string) || "";
    const title_km = (fd.get("title_km") as string) || "";
    const focus_en = (fd.get("focus_en") as string) || "";
    const focus_km = (fd.get("focus_km") as string) || "";
    const activities_en = (fd.get("activities_en") as string) || "";
    const activities_km = (fd.get("activities_km") as string) || "";

    if (!title_en || !title_km || !focus_en || !focus_km) {
      toast.error("Titles and focus fields are required.");
      return;
    }

    setIsSaving(true);
    try {
      const result = isEdit
        ? await updateCurriculumModule(module.id, {
            sort_order,
            title_en,
            title_km,
            focus_en,
            focus_km,
            activities_en,
            activities_km,
          })
        : await createCurriculumModule({
            phase_id: phaseId,
            sort_order,
            title_en,
            title_km,
            focus_en,
            focus_km,
            activities_en,
            activities_km,
          });

      if (result.error) toast.error(result.error);
      else {
        toast.success(isEdit ? "Module updated" : "Module created");
        setTimeout(() => {
          window.location.href = "/admin/program";
        }, 800);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="w-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-base font-bold text-[#1e293b]">{isEdit ? "Edit module" : "New module"}</h2>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">Sort order</label>
          <input
            type="number"
            name="sort_order"
            defaultValue={module?.sort_order ?? 0}
            className="w-full max-w-[10rem] rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#0ea5e9] focus:bg-white"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">Title (English)</label>
            <input
              name="title_en"
              required
              defaultValue={module?.title_en}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#0ea5e9] focus:bg-white"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">Title (Khmer)</label>
            <input
              name="title_km"
              required
              defaultValue={module?.title_km}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#0ea5e9] focus:bg-white"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">Focus (English)</label>
          <textarea
            name="focus_en"
            required
            rows={3}
            defaultValue={module?.focus_en}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#0ea5e9] focus:bg-white"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">Focus (Khmer)</label>
          <textarea
            name="focus_km"
            required
            rows={3}
            defaultValue={module?.focus_km}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#0ea5e9] focus:bg-white"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">Activities (English)</label>
          <p className="mb-1 text-xs text-slate-400">One bullet per line.</p>
          <textarea
            name="activities_en"
            rows={6}
            defaultValue={module?.activities_en}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 font-mono text-sm outline-none focus:border-[#0ea5e9] focus:bg-white"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">Activities (Khmer)</label>
          <p className="mb-1 text-xs text-slate-400">One bullet per line (same line count as English recommended).</p>
          <textarea
            name="activities_km"
            rows={6}
            defaultValue={module?.activities_km}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 font-mono text-sm outline-none focus:border-[#0ea5e9] focus:bg-white"
          />
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full rounded-lg bg-[#0ea5e9] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:bg-slate-300"
        >
          {isSaving ? "Saving…" : isEdit ? "Save module" : "Create module"}
        </button>
      </form>
    </div>
  );
}
