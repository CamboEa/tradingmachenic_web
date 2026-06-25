import { notFound } from "next/navigation";

import { PodcastForm } from "@/components/podcast/podcast-form";
import { AdminFormHeader, Badge } from "@/components/ui";
import { getPodcastForEdit } from "@/lib/supabase/actions";

export const metadata = { title: "Edit podcast episode" };

export default async function EditPodcastPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const podcast = await getPodcastForEdit(id);
  if (!podcast) notFound();

  return (
    <div>
      <AdminFormHeader
        backHref="/admin/podcasts"
        title="Edit episode"
        description={podcast.title_en}
        meta={
          <Badge variant={podcast.status === "published" ? "published" : "draft"}>
            {podcast.status === "published" ? "Published" : "Draft"}
          </Badge>
        }
      />

      <PodcastForm podcast={podcast} />
    </div>
  );
}
