"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { useConfirm } from "@/components/shared/confirm-dialog";
import { deletePodcast } from "@/lib/supabase/actions";

export function DeletePodcastButton({ id, title }: { id: string; title: string }) {
 const [deleting, setDeleting] = useState(false);
 const { confirm, ConfirmDialogHost } = useConfirm();

 async function handleDeleteClick() {
 await confirm({
 title: "Remove this episode?",
 description: `"${title}" will be permanently deleted from the podcast library.`,
 confirmLabel: "Remove episode",
 cancelLabel: "Keep episode",
 variant: "danger",
 onConfirm: async () => {
 setDeleting(true);
 const { error } = await deletePodcast(id);
 if (error) {
 toast.error(error);
 throw new Error(error);
 }
 toast.success(`Removed "${title}"`);
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
 {deleting ? "Removing…" : "Delete"}
 </button>
 {ConfirmDialogHost}
 </>
 );
}
