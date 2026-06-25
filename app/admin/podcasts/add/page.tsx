import { PodcastForm } from "@/components/podcast/podcast-form";
import { AdminFormHeader } from "@/components/ui";

export const metadata = { title: "Add podcast episode" };

export default function AddPodcastPage() {
  return (
    <div>
      <AdminFormHeader
        backHref="/admin/podcasts"
        title="Add episode"
        description="Publish a new podcast episode to the public library."
      />

      <PodcastForm />
    </div>
  );
}
