"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { useConfirm } from "@/components/shared/confirm-dialog";
import { TrashIcon } from "@/components/ui/icons";
import { deleteCurriculumPhase } from "@/lib/supabase/actions";
import { ui } from "@/lib/ui/styles";

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
 className={`${ui.btnDanger} px-3 py-2 text-xs`}
 >
 <TrashIcon className="h-3.5 w-3.5" />
 {deleting ? "Deleting…" : "Delete phase"}
 </button>
 {ConfirmDialogHost}
 </>
 );
}
