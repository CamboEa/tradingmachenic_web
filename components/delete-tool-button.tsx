"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { useConfirm } from "@/components/confirm-dialog";
import { deleteTool } from "@/lib/supabase/actions";

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
 className="rounded-md border border-slate-200 px-3 py-2 text-xs font-medium text-slate-400 transition-colors hover:border-red-300 hover:text-red-500 disabled:opacity-50"
 >
 {deleting ? "Deleting…" : "Delete"}
 </button>
 {ConfirmDialogHost}
 </>
 );
}
