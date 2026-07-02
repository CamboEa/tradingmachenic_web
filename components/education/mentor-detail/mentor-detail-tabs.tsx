import {
  mentorDetailSections,
  type MentorDetailSectionId,
} from "@/components/education/mentor-detail/mentor-detail-config";

type MentorDetailTabsProps = {
  activeSection: MentorDetailSectionId;
  onSectionChange: (section: MentorDetailSectionId) => void;
};

export function MentorDetailTabs({
  activeSection,
  onSectionChange,
}: MentorDetailTabsProps) {
  return (
    <nav
      aria-label="Mentor detail sections"
      className="sticky top-4 z-10 rounded-2xl border border-bridge/30 p-2"
    >
      <div className="flex items-center gap-2 overflow-x-auto">
        {mentorDetailSections.map((section) => {
          const active = activeSection === section.id;

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onSectionChange(section.id)}
              aria-current={active ? "page" : undefined}
              className={
                active
                  ? "inline-flex shrink-0 items-center rounded-xl bg-teal px-4 py-2 text-sm font-semibold text-white shadow-sm transition"
                  : "inline-flex shrink-0 items-center rounded-xl px-4 py-2 text-sm font-semibold text-ink-muted transition hover:bg-surface-soft hover:text-teal"
              }
            >
              {section.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
