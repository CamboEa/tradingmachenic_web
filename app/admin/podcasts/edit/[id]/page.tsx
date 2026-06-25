import Link from "next/link";
import { notFound } from "next/navigation";

import { PodcastForm } from "@/components/podcast/podcast-form";
import { getPodcastForEdit } from "@/lib/supabase/actions";

export const metadata = { title: "Edit podcast episode" };

export default async function EditPodcastPage({ params }: { params: Promise<{ id: string }> }) {
 const { id } = await params;
 const podcast = await getPodcastForEdit(id);
 if (!podcast) notFound();

 return (
 <div>
 <div className="mb-8 flex flex-col gap-4">
 <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
 <Link
 href="/admin/podcasts"
 className="inline-flex shrink-0 items-center justify-center rounded-lg border border-bridge/40 px-3.5 py-2 text-sm font-medium text-ink-muted transition hover:border-bridge/60 hover:bg-surface-soft"
 >
 ← Back
 </Link>
 <div className="min-w-0 flex-1">
 <h1 className="text-2xl font-bold text-foreground">Edit episode</h1>
 <p className="mt-1 truncate text-sm text-ink-soft" title={podcast.title_en}>
 {podcast.title_en}
 </p>
 <div className="mt-2 flex flex-wrap items-center gap-2">
 <span
 className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
 podcast.status === "published"
 ? "bg-green-100 text-green-700"
 : "bg-surface-soft text-ink-muted"
 }`}
 >
 {podcast.status === "published" ? "Published" : "Draft"}
 </span>
 </div>
 </div>
 </div>
 </div>

 <PodcastForm podcast={podcast} />
 </div>
 );
}
