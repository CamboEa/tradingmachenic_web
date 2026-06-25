"use client";

import { useState } from "react";
import { toast } from "react-toastify";

import { useConfirm } from "@/components/shared/confirm-dialog";
import { SpinnerIcon, TrashIcon } from "@/components/ui/icons";
import { deleteMentor } from "@/lib/supabase/actions";
import { ui } from "@/lib/ui/styles";

export function DeleteMentorButton({ slug, name }: { slug: string; name: string }) {
  const [deleting, setDeleting] = useState(false);
  const { confirm, ConfirmDialogHost } = useConfirm();

  async function handleDeleteClick() {
    await confirm({
      title: "Remove this mentor?",
      description: `"${name}" will be permanently deleted. Lessons linked to this mentor must be reassigned first.`,
      confirmLabel: "Remove mentor",
      cancelLabel: "Keep mentor",
      variant: "danger",
      onConfirm: async () => {
        setDeleting(true);
        const { error } = await deleteMentor(slug);
        if (error) {
          toast.error(error);
          throw new Error(error);
        }
        toast.success(`Removed "${name}"`);
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
