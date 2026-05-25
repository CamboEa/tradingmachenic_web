import { DeletePodcastButton } from "@/components/podcast/delete-podcast-button";
import {
  AdminPageHeader,
  Badge,
  ButtonLink,
  Card,
  EmptyState,
} from "@/components/ui";
import { extractYouTubeVideoId, youtubeThumbnailUrl } from "@/lib/youtube";
import { getAllPodcasts } from "@/lib/supabase/podcasts";
import { cn } from "@/lib/ui/cn";

export const metadata = { title: "Podcasts" };

function NoImagePlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex aspect-video w-36 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border border-slate-100 bg-slate-50 sm:w-44",
        className,
      )}
      aria-hidden
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="h-7 w-7 text-slate-300"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z"
        />
      </svg>
      <span className="text-xs text-slate-400">No image</span>
    </div>
  );
}

export default async function AdminPodcastsPage() {
  const episodes = await getAllPodcasts();

  return (
    <div>
      <AdminPageHeader
        title="Podcasts"
        description="Add YouTube episodes; published items appear on the public podcast page."
        action={<ButtonLink href="/admin/podcasts/add">+ Add episode</ButtonLink>}
      />

      {episodes.length === 0 ? (
        <EmptyState
          title="No episodes yet"
          description="Create an episode with a YouTube link so learners can watch from the site."
          action={{ href: "/admin/podcasts/add", label: "+ Add episode" }}
        />
      ) : (
        <div className="space-y-5">
          {episodes.map((ep) => {
            const vid = extractYouTubeVideoId(ep.youtube_url);
            const thumb = vid ? youtubeThumbnailUrl(vid) : null;
            return (
              <Card key={ep.id} padding={false} className="overflow-hidden">
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
                      <NoImagePlaceholder />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-semibold text-slate-brand">{ep.title_en}</p>
                        <Badge variant={ep.status === "published" ? "published" : "draft"}>
                          {ep.status === "published" ? "Published" : "Draft"}
                        </Badge>
                        <Badge variant="neutral">sort {ep.sort_order}</Badge>
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
                    <ButtonLink
                      href={`/admin/podcasts/edit/${ep.id}`}
                      variant="secondary"
                      className="px-3 py-2 text-xs"
                    >
                      Edit
                    </ButtonLink>
                    <DeletePodcastButton id={ep.id} title={ep.title_en} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
