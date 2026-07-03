export type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

export type NavSection = {
  heading: string;
  items: NavItem[];
};

export const NAV: NavSection[] = [
  {
    heading: "Overview",
    items: [
      {
        href: "/admin",
        label: "Dashboard",
        icon: (
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4.5 w-4.5">
            <path d="M10.707 2.293a1 1 0 0 0-1.414 0l-7 7a1 1 0 0 0 1.414 1.414L4 10.414V17a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-3a1 1 0 0 1 2 0v3a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-6.586l.293.293a1 1 0 0 0 1.414-1.414l-7-7Z" />
          </svg>
        ),
      },
    ],
  },
  {
    heading: "Content",
    items: [
      {
        href: "/admin/mentors",
        label: "Mentors",
        icon: (
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4.5 w-4.5">
            <path d="M10 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 8a2 2 0 1 1 4 0 2 2 0 0 1-4 0ZM2 16.5v-.75A4.5 4.5 0 0 1 6.5 11.25h7A4.5 4.5 0 0 1 18 15.75v.75a.75.75 0 0 1-.75.75h-14.5A.75.75 0 0 1 2 16.5Z" />
          </svg>
        ),
      },
      {
        href: "/admin/lessons",
        label: "Lessons",
        icon: (
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4.5 w-4.5">
            <path d="M10.394 2.08a1 1 0 0 0-.788 0l-7 3a1 1 0 0 0 0 1.84L5.25 8.051a.999.999 0 0 1 .356-.257l4-1.714a1 1 0 1 1 .788 1.838L7.667 9.088l1.94.831a1 1 0 0 0 .787 0l7-3a1 1 0 0 0 0-1.838l-7-3Z" />
            <path d="M3.31 9.397 5 10.12v4.102a8.969 8.969 0 0 0-1.05-.174 1 1 0 0 1-.89-.89 11.115 11.115 0 0 1 .25-3.762ZM9.3 16.573A9.026 9.026 0 0 0 7 14.935v-3.957l1.818.78a3 3 0 0 0 2.364 0l5.508-2.361a11.026 11.026 0 0 1 .25 3.762 1 1 0 0 1-.89.89 8.968 8.968 0 0 0-5.35 2.524 1 1 0 0 1-1.4 0ZM6 18a1 1 0 0 0 1-1v-2.065a8.935 8.935 0 0 0-2-.712V17a1 1 0 0 0 1 1Z" />
          </svg>
        ),
      },
      {
        href: "/admin/tools",
        label: "Tools",
        icon: (
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4.5 w-4.5">
            <path
              fillRule="evenodd"
              d="M14.5 10a4.5 4.5 0 0 0 4.284-5.882c-.105-.324-.51-.391-.752-.15L15.34 6.66a.454.454 0 0 1-.493.11 3.01 3.01 0 0 1-1.618-1.616.455.455 0 0 1 .11-.494l2.694-2.692c.24-.241.174-.647-.15-.752a4.5 4.5 0 0 0-5.873 4.575c.055.873-.128 1.808-.8 2.368l-7.23 6.024a2.724 2.724 0 1 0 3.837 3.837l6.024-7.23c.56-.672 1.495-.855 2.368-.8.096.007.193.01.291.01ZM5 16a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"
              clipRule="evenodd"
            />
          </svg>
        ),
      },
      {
        href: "/admin/blog",
        label: "Blog",
        icon: (
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4.5 w-4.5">
            <path fillRule="evenodd" d="M2 4.25A.75.75 0 0 1 2.75 3.5h14.5a.75.75 0 0 1 .75.75v11.5a.75.75 0 0 1-.75.75H2.75a.75.75 0 0 1-.75-.75V4.25Zm3.5 1.5a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5H6Zm-.75 3.75a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5H6a.75.75 0 0 1-.75-.75Zm-.75 2.25a.75.75 0 0 1 .75-.75h8.5a.75.75 0 0 1 0 1.5H6a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
          </svg>
        ),
      },
      {
        href: "/admin/podcasts",
        label: "Podcasts",
        icon: (
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4.5 w-4.5">
            <path d="M7 4a3 3 0 0 1 6 0v6a3 3 0 1 1-6 0V4Z" />
            <path d="M5.5 9.643a.75.75 0 0 0-1.5 0V10c0 3.06 2.29 5.585 5.25 5.954V17.5h-1.5a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5h-1.5v-1.546A6.001 6.001 0 0 0 16 10v-.357a.75.75 0 0 0-1.5 0V10a4.5 4.5 0 0 1-9 0v-.357Z" />
          </svg>
        ),
      },
    ],
  },
  {
    heading: "Curriculum",
    items: [
      {
        href: "/admin/program",
        label: "Program",
        icon: (
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4.5 w-4.5">
            <path d="M9 4.804A7.968 7.968 0 0 0 5.465 4h-.878a.75.75 0 0 0-.75.75v9.5c0 .414.336.75.75.75h.878a7.968 7.968 0 0 0 3.535-.804V4.804ZM11 4.804V14.196A7.968 7.968 0 0 1 14.535 15h.878a.75.75 0 0 0 .75-.75v-9.5A.75.75 0 0 0 15.413 4h-.878A7.968 7.968 0 0 0 11 4.804Z" />
          </svg>
        ),
      },
    ],
  },
  {
    heading: "Community",
    items: [
      {
        href: "/admin/students",
        label: "Users",
        icon: (
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4.5 w-4.5">
            <path d="M7 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM14.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM1.615 16.428a1.224 1.224 0 0 1-.569-1.175 6.002 6.002 0 0 1 11.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 0 1 7 17a9.953 9.953 0 0 1-5.385-1.572ZM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 0 0-1.588-3.755 4.502 4.502 0 0 1 5.874 2.636.818.818 0 0 1-.36.98A7.465 7.465 0 0 1 14.5 16Z" />
          </svg>
        ),
      },
    ],
  },
];

export const ADMIN_LINKS: NavItem[] = NAV.flatMap((section) => section.items);

export function isNavActive(href: string, pathname: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname.startsWith(href);
}

/** Resolve the nearest top-level admin section for a route. */
export function currentAdminNavItem(pathname: string): NavItem | undefined {
  return [...ADMIN_LINKS]
    .filter((l) => isNavActive(l.href, pathname))
    .sort((a, b) => b.href.length - a.href.length)[0];
}

/** Resolve the human label for the current admin route. */
export function currentAdminLabel(pathname: string) {
  return currentAdminNavItem(pathname)?.label ?? "Admin";
}
