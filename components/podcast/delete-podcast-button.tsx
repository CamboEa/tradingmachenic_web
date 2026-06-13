"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { useConfirm } from "@/components/shared/confirm-dialog";
import { SpinnerIcon, TrashIcon } from "@/components/ui/icons";
import { deletePodcast } from "@/lib/supabase/actions";
import { ui } from "@/lib/ui/styles";

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
