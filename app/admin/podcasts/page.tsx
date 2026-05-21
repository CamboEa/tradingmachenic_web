import Link from "next/link";

import { DeletePodcastButton } from "@/components/podcast/delete-podcast-button";
import { extractYouTubeVideoId, youtubeThumbnailUrl } from "@/lib/youtube";
import { getAllPodcasts } from "@/lib/supabase/podcasts";

export const metadata = { title: "Podcasts" };

export default async function AdminPodcastsPage() {
 const episodes = await getAllPodcasts();

 return (
 <div>
 <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
 <div>
 <h1 className="text-2xl font-bold text-[#1e293b]">Podcasts</h1>
 <p className="mt-1 text-sm text-slate-500">
 Add YouTube episodes; published items appear on the public podcast page.
 </p>
 </div>
 <Link
 href="/admin/podcasts/add"
 className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#0ea5e9] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-600"
 >
 + Add episode
 </Link>
 </div>

 {episodes.length === 0 ? (
 <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
 <p className="text-sm font-medium text-slate-500">No episodes yet</p>
 <p className="mt-1.5 text-sm text-slate-400">
 Create an episode with a YouTube link so learners can watch from the site.
 </p>
 <Link
 href="/admin/podcasts/add"
 className="mt-6 inline-flex items-center justify-center rounded-lg bg-[#0ea5e9] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-600"
 >
 + Add episode
 </Link>
 </div>
 ) : (
 <div className="space-y-5">
 {episodes.map((ep) => {
 const vid = extractYouTubeVideoId(ep.youtube_url);
 const thumb = vid ? youtubeThumbnailUrl(vid) : null;
 return (
 <div
 key={ep.id}
 className="overflow-hidden rounded-xl border border-slate-200 bg-white"
 >
 <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-start sm:gap-5">
 <div className="flex min-w-0 flex-1 gap-4">
 {thumb ? (
 // eslint-disable-next-line @next/next/no-img-element
 <img
 src={thumb}
 alt=""
 className="aspect-video w-36 shrink-0 rounded-lg border border-slate-100 object-cover sm:w-44"
 />
 ) : (
 <div
 className="flex aspect-video w-36 shrink-0 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-2xl sm:w-44"
 aria-hidden
 >
 ▶
 </div>
 )}
 <div className="min-w-0 flex-1">
 <div className="flex flex-wrap items-center gap-2">
 <p className="text-base font-semibold text-[#1e293b]">{ep.title_en}</p>
 <span
 className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
 ep.status === "published"
 ? "bg-green-100 text-green-700"
 : "bg-slate-100 text-slate-600"
 }`}
 >
 {ep.status === "published" ? "Published" : "Draft"}
 </span>
 <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
 sort {ep.sort_order}
 </span>
 </div>
 <p className="mt-1 truncate font-mono text-xs text-slate-400" title={ep.youtube_url}>
 {ep.youtube_url}
 </p>
 {ep.description_en && (
 <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">
 {ep.description_en}
 </p>
 )}
 </div>
 </div>
 <div className="flex shrink-0 gap-2 border-t border-slate-100 pt-3 sm:border-t-0 sm:pt-0">
 <Link
 href={`/admin/podcasts/edit/${ep.id}`}
 className="rounded-md border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:border-[#0ea5e9] hover:text-[#0ea5e9]"
 >
 Edit
 </Link>
 <DeletePodcastButton id={ep.id} title={ep.title_en} />
 </div>
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>
 );
}
