import type { Metadata } from "next";

import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminMobileNav } from "@/components/layout/admin-mobile-nav";
import { adminPanelLabel, buildAdminNav } from "@/components/layout/admin-nav";
import { BRAND_NAME } from "@/lib/brand";
import { getStaffAccess } from "@/lib/auth/staff-access";

export const metadata: Metadata = {
  title: { default: "Admin", template: `%s | Admin — ${BRAND_NAME}` },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const access = await getStaffAccess();
  const nav = buildAdminNav(access);
  const panelLabel = adminPanelLabel(access);

  return (
    <div className="admin-shell flex h-screen overflow-hidden bg-white">
      <AdminSidebar nav={nav} panelLabel={panelLabel} />
      <div className="flex flex-1 flex-col overflow-x-auto overflow-y-scroll">
        <AdminMobileNav nav={nav} panelLabel={panelLabel} />
        <main className="admin-content flex-1 px-4 pb-8 pt-20 sm:px-6 lg:px-10 lg:pt-8">{children}</main>
      </div>
    </div>
  );
}
