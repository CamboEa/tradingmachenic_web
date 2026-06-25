"use client";

import { useState } from "react";
import { toast } from "react-toastify";

import { useConfirm } from "@/components/shared/confirm-dialog";
import { SpinnerIcon, TrashIcon } from "@/components/ui/icons";
import { deleteLessonTopic } from "@/lib/supabase/actions";
import { ui } from "@/lib/ui/styles";

export function DeleteLessonTopicButton({ id, name }: { id: string; name: string }) {
  const [deleting, setDeleting] = useState(false);
  const { confirm, ConfirmDialogHost } = useConfirm();

  async function handleDeleteClick() {
    await confirm({
      title: "Delete this topic?",
      description: `"${name}" will be permanently removed. Lessons must be reassigned first.`,
      confirmLabel: "Delete topic",
      cancelLabel: "Keep topic",
      variant: "danger",
      onConfirm: async () => {
        setDeleting(true);
        const { error } = await deleteLessonTopic(id);
        if (error) {
          toast.error(error);
          throw new Error(error);
        }
        toast.success(`Deleted "${name}"`);
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
