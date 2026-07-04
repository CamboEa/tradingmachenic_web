import { redirect } from "next/navigation";

export default async function MentorAccountDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/admin/mentors/edit/${encodeURIComponent(slug)}?tab=account`);
}
