"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { MentorAccountPanel } from "@/components/education/mentor-account-panel";
import { MentorForm } from "@/components/education/mentor-form";
import {
  parseMentorDetailTab,
  type MentorDetailSectionId,
} from "@/components/education/mentor-detail/mentor-detail-config";
import { MentorDetailTabs } from "@/components/education/mentor-detail/mentor-detail-tabs";
import { MentorLessonsSection } from "@/components/education/mentor-detail/mentor-lessons-section";
import type { Lesson } from "@/lib/education/course";
import { sortLessonsByDisplayOrder } from "@/lib/education/lessons-sort";
import type { LessonTopic } from "@/lib/supabase/lesson-topics";
import type { AdminMentor } from "@/lib/supabase/mentors";
import type { Profile } from "@/lib/supabase/profiles";

type MentorDetailSectionsProps = {
  mentor: AdminMentor;
  lessons: Lesson[];
  topics: LessonTopic[];
  isAdmin?: boolean;
  linkedProfile?: Profile | null;
  initialSection?: MentorDetailSectionId;
  initialTopicSlug?: string;
};

export function MentorDetailSections({
  mentor,
  lessons,
  topics,
  isAdmin = false,
  linkedProfile = null,
  initialSection = "mentor-profile",
  initialTopicSlug,
}: MentorDetailSectionsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mentorSlug = mentor.slug;

  const [activeSection, setActiveSection] = useState<MentorDetailSectionId>(initialSection);

  useEffect(() => {
    setActiveSection(parseMentorDetailTab(searchParams.get("tab")));
  }, [searchParams]);

  const { mentorLessons, mentorTopics } = useMemo(() => {
    const filteredLessons = sortLessonsByDisplayOrder(
      lessons.filter((lesson) => lesson.mentorSlug === mentorSlug),
    );

    return {
      mentorLessons: filteredLessons,
      mentorTopics: topics.filter((topic) => topic.mentorSlug === mentorSlug),
    };
  }, [lessons, mentorSlug, topics]);

  const syncLessonsUrl = useCallback(
    (topicSlug: string | null) => {
      const params = new URLSearchParams();
      params.set("tab", "lessons");
      if (topicSlug) params.set("topic", topicSlug);
      router.replace(`/admin/mentors/edit/${mentorSlug}?${params.toString()}`, {
        scroll: false,
      });
    },
    [mentorSlug, router],
  );

  const handleSectionChange = useCallback(
    (section: MentorDetailSectionId) => {
      setActiveSection(section);
      if (section === "mentor-lessons") {
        const topic = searchParams.get("topic");
        syncLessonsUrl(topic);
      } else if (section === "mentor-account") {
        router.replace(`/admin/mentors/edit/${mentorSlug}?tab=account`, { scroll: false });
      } else {
        router.replace(`/admin/mentors/edit/${mentorSlug}`, { scroll: false });
      }
    },
    [mentorSlug, router, searchParams, syncLessonsUrl],
  );

  return (
    <div className="space-y-6">
      <MentorDetailTabs
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        isAdmin={isAdmin}
      />

      {activeSection === "mentor-profile" ? (
        <section>
          <MentorForm mentor={mentor} isMentorSelf={!isAdmin} />
        </section>
      ) : null}

      {activeSection === "mentor-lessons" ? (
        <MentorLessonsSection
          mentorSlug={mentor.slug}
          mentorName={mentor.names.en}
          categories={mentor.categories}
          topics={mentorTopics}
          lessons={mentorLessons}
          initialTopicSlug={initialTopicSlug}
          onTopicChange={syncLessonsUrl}
        />
      ) : null}

      {activeSection === "mentor-account" && isAdmin ? (
        <section>
          <MentorAccountPanel
            mentorSlug={mentor.slug}
            mentorName={mentor.names.en}
            linkedProfile={linkedProfile}
          />
        </section>
      ) : null}
    </div>
  );
}
