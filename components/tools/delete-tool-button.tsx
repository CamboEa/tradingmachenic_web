"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { useConfirm } from "@/components/shared/confirm-dialog";
import { SpinnerIcon, TrashIcon } from "@/components/ui/icons";
import { deleteTool } from "@/lib/supabase/actions";
import { ui } from "@/lib/ui/styles";

export function DeleteToolButton({ id, name }: { id: string; name: string }) {
 const [deleting, setDeleting] = useState(false);
 const { confirm, ConfirmDialogHost } = useConfirm();

 async function handleDeleteClick() {
 await confirm({
 title: "Delete this tool?",
 description: `"${name}" will be permanently removed from the marketplace. This cannot be undone.`,
 confirmLabel: "Delete tool",
 cancelLabel: "Keep tool",
 variant: "danger",
 onConfirm: async () => {
 setDeleting(true);
 const { error } = await deleteTool(id);
 if (error) {
 toast.error(error);
 throw new Error(error);
 }
 toast.success(`"${name}" deleted`);
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
 aria-label={`Delete ${name}`}
 title="Delete"
 >
 {deleting ? <SpinnerIcon /> : <TrashIcon />}
 </button>
 {ConfirmDialogHost}
 </>
 );
}
