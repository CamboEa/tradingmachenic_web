"use client";

import { useState } from "react";
import { toast } from "react-toastify";

import { deletePodcast } from "@/lib/supabase/actions";

export function DeletePodcastButton({ id, title }: { id: string; title: string }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const { error } = await deletePodcast(id);
    if (error) {
      toast.error(error);
      setDeleting(false);
      setConfirming(false);
    } else {
      toast.success(`Removed "${title}"`);
      window.location.reload();
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-slate-500">Sure?</span>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-md bg-red-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
        >
          {deleting ? "…" : "Yes"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="rounded-md border border-slate-200 px-3 py-2 text-xs font-medium text-slate-400 transition-colors hover:border-red-300 hover:text-red-500"
    >
      Delete
    </button>
  );
}
