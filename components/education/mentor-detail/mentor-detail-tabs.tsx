import {
  mentorDetailSectionsForUser,
  type MentorDetailSectionId,
} from "@/components/education/mentor-detail/mentor-detail-config";

type MentorDetailTabsProps = {
  activeSection: MentorDetailSectionId;
  onSectionChange: (section: MentorDetailSectionId) => void;
  isAdmin?: boolean;
};

export function MentorDetailTabs({
  activeSection,
  onSectionChange,
  isAdmin = false,
}: MentorDetailTabsProps) {
  const sections = mentorDetailSectionsForUser(isAdmin);

  return (
    <nav
      aria-label="Mentor detail sections"
      className="sticky top-4 z-10 rounded-lg border border-bridge bg-surface p-2 shadow-sm"
    >
      <div className="flex items-center gap-2 overflow-x-auto">
        {sections.map((section) => {
          const active = activeSection === section.id;

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onSectionChange(section.id)}
              aria-current={active ? "page" : undefined}
              className={
                active
                  ? "inline-flex shrink-0 items-center rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-teal/20 transition"
                  : "inline-flex shrink-0 items-center rounded-lg px-4 py-2 text-sm font-semibold text-ink-muted transition hover:bg-surface-soft hover:text-teal"
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
