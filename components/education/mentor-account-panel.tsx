"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { MentorAccountFields } from "@/components/education/mentor-account-fields";
import { Card } from "@/components/ui";
import { createMentorAccount, unlinkMentorAccount } from "@/lib/supabase/actions";
import type { Profile } from "@/lib/supabase/profiles";
import { ui } from "@/lib/ui/styles";

function formatAccountDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

type MentorAccountPanelProps = {
  mentorSlug: string;
  mentorName: string;
  linkedProfile: Profile | null;
};

export function MentorAccountPanel({
  mentorSlug,
  mentorName,
  linkedProfile,
}: MentorAccountPanelProps) {
  const router = useRouter();
  const [account, setAccount] = useState<Profile | null>(linkedProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);

  useEffect(() => {
    setAccount(linkedProfile);
  }, [linkedProfile]);

  async function handleCreate(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("mentor_slug", mentorSlug);

    setIsSaving(true);
    const result = await createMentorAccount(formData);
    setIsSaving(false);

    if (result.error) {
      if (result.profile) {
        setAccount(result.profile);
        router.refresh();
      }
      toast.error(result.error);
      return;
    }

    if (result.profile) {
      setAccount(result.profile);
    }
    toast.success("Mentor account created");
    router.refresh();
  }

  async function handleUnlink() {
    if (!account) return;
    if (!window.confirm(`Remove login access for ${account.email ?? "this user"}?`)) {
      return;
    }

    setIsUnlinking(true);
    const result = await unlinkMentorAccount(account.id, mentorSlug);
    setIsUnlinking(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    setAccount(null);
    toast.success("Mentor account unlinked");
    router.refresh();
  }

  return (
    <Card className="space-y-5">
      <div>
        <p className={ui.eyebrowAdmin}>Mentor login</p>
        <h2 className="mt-1 text-lg font-semibold text-foreground">Account access</h2>
        <p className="mt-1 text-sm text-ink-soft">
          {account
            ? `Login credentials for ${mentorName}.`
            : `Create a login for ${mentorName} so they can manage their profile, lessons, and tools.`}
        </p>
      </div>

      {account ? (
        <div className="rounded-lg border border-bridge/40 bg-surface-soft/60 px-4 py-4">
          <p className="text-sm font-medium text-foreground">Linked account</p>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Email</dt>
              <dd className="mt-0.5 text-ink-muted">{account.email ?? "—"}</dd>
            </div>
            {account.full_name ? (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  Display name
                </dt>
                <dd className="mt-0.5 text-ink-muted">{account.full_name}</dd>
              </div>
            ) : null}
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Role</dt>
              <dd className="mt-0.5 capitalize text-ink-muted">{account.role}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                Linked since
              </dt>
              <dd className="mt-0.5 text-ink-muted">{formatAccountDate(account.created_at)}</dd>
            </div>
          </dl>
          <button
            type="button"
            onClick={handleUnlink}
            disabled={isUnlinking}
            className={`${ui.btnSecondary} mt-5`}
          >
            {isUnlinking ? "Removing…" : "Remove login access"}
          </button>
        </div>
      ) : (
        <form onSubmit={handleCreate} className="space-y-4">
          <MentorAccountFields mentorName={mentorName} required />
          <button type="submit" disabled={isSaving} className={ui.btnPrimary}>
            {isSaving ? "Creating account…" : "Create mentor account"}
          </button>
        </form>
      )}
    </Card>
  );
}
