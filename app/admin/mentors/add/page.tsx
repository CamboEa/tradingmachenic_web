import Link from "next/link";

import { MentorForm } from "@/components/education/mentor-form";

export const metadata = { title: "Add mentor" };

export default function AddMentorPage() {
  return (
    <div>
      <div className="mb-8 flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <Link
            href="/admin/mentors"
            className="inline-flex shrink-0 items-center justify-center rounded-lg border border-bridge/40 px-3.5 py-2 text-sm font-medium text-ink-muted transition hover:border-bridge/60 hover:bg-surface-soft"
          >
            ← Back
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-foreground">Add mentor</h1>
            <p className="mt-1 text-sm text-ink-soft">
              Create a mentor profile, then add lessons from the mentor list or Lessons section.
            </p>
          </div>
        </div>
      </div>

      <MentorForm />
    </div>
  );
}
