"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { useConfirm } from "@/components/confirm-dialog";
import { deleteCurriculumPhase } from "@/lib/supabase/actions";

export function DeleteCurriculumPhaseButton({ id, label }: { id: string; label: string }) {
 const [deleting, setDeleting] = useState(false);
 const { confirm, ConfirmDialogHost } = useConfirm();

 async function handleDeleteClick() {
 await confirm({
 title: "Delete this phase?",
 description: `Phase "${label}" and all modules inside it will be permanently removed. This cannot be undone.`,
 confirmLabel: "Delete phase",
 cancelLabel: "Keep phase",
 variant: "danger",
 onConfirm: async () => {
 setDeleting(true);
 const { error } = await deleteCurriculumPhase(id);
 if (error) {
 toast.error(error);
 throw new Error(error);
 }
 toast.success(`Phase "${label}" deleted`);
 window.location.href = "/admin/program";
 },
 });
 setDeleting(false);
 }

 return (
 <>
 <button
 type="button"
 onClick={handleDeleteClick}
 disabled={deleting}
 className="rounded-md border border-slate-200 px-3 py-2 text-xs font-medium text-slate-400 transition-colors hover:border-red-300 hover:text-red-500 disabled:opacity-50"
 >
 {deleting ? "Deleting…" : "Delete phase"}
 </button>
 {ConfirmDialogHost}
 </>
 );
}
