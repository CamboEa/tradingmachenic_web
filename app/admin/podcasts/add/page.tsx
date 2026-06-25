import Link from "next/link";

import { PodcastForm } from "@/components/podcast/podcast-form";

export const metadata = { title: "Add podcast episode" };

export default function AddPodcastPage() {
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
 <h1 className="text-2xl font-bold text-foreground">Add podcast episode</h1>
 <p className="mt-1 text-sm text-ink-soft">Link a YouTube video and set titles for both languages.</p>
 </div>
 </div>
 </div>

 <PodcastForm />
 </div>
 );
}
