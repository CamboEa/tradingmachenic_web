"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { createCurriculumModule, updateCurriculumModule } from "@/lib/supabase/actions";
import { ui, FIELD_CLASS } from "@/lib/ui/styles";
import { cn } from "@/lib/ui/cn";

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
 <form className="max-w-2xl space-y-5" onSubmit={handleSubmit}>
   <div>
     <label className="mb-1.5 block text-xs font-semibold text-ink-muted">Sort order</label>
     <input
       type="number"
       name="sort_order"
       defaultValue={module?.sort_order ?? 0}
       className={cn(FIELD_CLASS, "max-w-[10rem]")}
     />
   </div>

   <div className="grid gap-4 sm:grid-cols-2">
     <div>
       <label className="mb-1.5 block text-xs font-semibold text-ink-muted">Title (English)</label>
       <input name="title_en" required defaultValue={module?.title_en} className={FIELD_CLASS} />
     </div>
     <div>
       <label className="mb-1.5 block text-xs font-semibold text-ink-muted">Title (Khmer)</label>
       <input name="title_km" required defaultValue={module?.title_km} className={FIELD_CLASS} />
     </div>
   </div>

   <div>
     <label className="mb-1.5 block text-xs font-semibold text-ink-muted">Focus (English)</label>
     <textarea name="focus_en" required rows={3} defaultValue={module?.focus_en} className={FIELD_CLASS} />
   </div>
   <div>
     <label className="mb-1.5 block text-xs font-semibold text-ink-muted">Focus (Khmer)</label>
     <textarea name="focus_km" required rows={3} defaultValue={module?.focus_km} className={FIELD_CLASS} />
   </div>

   <div>
     <label className="mb-1.5 block text-xs font-semibold text-ink-muted">Activities (English)</label>
     <p className="mb-1 text-xs text-ink-soft">One bullet per line.</p>
     <textarea name="activities_en" rows={6} defaultValue={module?.activities_en} className={cn(FIELD_CLASS, "font-mono")} />
   </div>
   <div>
     <label className="mb-1.5 block text-xs font-semibold text-ink-muted">Activities (Khmer)</label>
     <p className="mb-1 text-xs text-ink-soft">One bullet per line (same line count as English recommended).</p>
     <textarea name="activities_km" rows={6} defaultValue={module?.activities_km} className={cn(FIELD_CLASS, "font-mono")} />
   </div>

   <div className="pt-2">
     <button type="submit" disabled={isSaving} className={ui.btnPrimary}>
       {isSaving ? "Saving…" : isEdit ? "Save module" : "Create module"}
     </button>
   </div>
 </form>
 );
}
