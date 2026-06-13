import { PodcastsTable } from "@/components/podcast/podcasts-table";
import { AdminPageHeader, ButtonLink, EmptyState } from "@/components/ui";
import { getAllPodcasts } from "@/lib/supabase/podcasts";

export const metadata = { title: "Podcasts" };

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
        <PodcastsTable episodes={episodes} />
      )}
    </div>
  );
}
