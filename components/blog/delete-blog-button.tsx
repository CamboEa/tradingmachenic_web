"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { useConfirm } from "@/components/shared/confirm-dialog";
import { SpinnerIcon, TrashIcon } from "@/components/ui/icons";
import { deleteBlogPost } from "@/lib/supabase/actions";
import { ui } from "@/lib/ui/styles";

export function DeleteBlogButton({
  id,
  slug,
  title,
}: {
  id: string;
  slug: string;
  title: string;
}) {
  const [deleting, setDeleting] = useState(false);
  const { confirm, ConfirmDialogHost } = useConfirm();

  async function handleDeleteClick() {
    await confirm({
      title: "Delete this article?",
      description: `"${title}" will be permanently removed from the blog.`,
      confirmLabel: "Delete article",
      cancelLabel: "Keep article",
      variant: "danger",
      onConfirm: async () => {
        setDeleting(true);
        const { error } = await deleteBlogPost(id, slug);
        if (error) {
          toast.error(error);
          throw new Error(error);
        }
        toast.success(`Deleted "${title}"`);
        window.location.href = "/admin/blog";
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
