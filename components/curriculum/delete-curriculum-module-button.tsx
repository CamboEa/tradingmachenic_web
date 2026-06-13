"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { useConfirm } from "@/components/shared/confirm-dialog";
import { SpinnerIcon, TrashIcon } from "@/components/ui/icons";
import { deleteCurriculumModule } from "@/lib/supabase/actions";
import { ui } from "@/lib/ui/styles";

export function DeleteCurriculumModuleButton({ id, title }: { id: string; title: string }) {
 const [deleting, setDeleting] = useState(false);
 const { confirm, ConfirmDialogHost } = useConfirm();

 async function handleDeleteClick() {
 await confirm({
 title: "Delete this module?",
 description: `"${title}" will be permanently removed from the curriculum.`,
 confirmLabel: "Delete module",
 cancelLabel: "Keep module",
 variant: "danger",
 onConfirm: async () => {
 setDeleting(true);
 const { error } = await deleteCurriculumModule(id);
 if (error) {
 toast.error(error);
 throw new Error(error);
 }
 toast.success(`Module "${title}" deleted`);
 window.location.reload();
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
 className={ui.iconBtnDanger}
 aria-label={`Delete ${title}`}
 title="Delete"
 >
 {deleting ? <SpinnerIcon /> : <TrashIcon />}
 </button>
 {ConfirmDialogHost}
 </>
 );
}
