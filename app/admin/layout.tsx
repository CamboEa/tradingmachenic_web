import type { Metadata } from "next";

import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminMobileNav } from "@/components/layout/admin-mobile-nav";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
 title: { default: "Admin", template: `%s | Admin — ${BRAND_NAME}` },
};

export default function AdminLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return (
 <div className="admin-shell flex h-screen overflow-hidden bg-white">
 <AdminSidebar />
 <div className="flex flex-1 flex-col overflow-x-auto overflow-y-scroll">
 <AdminMobileNav />
 <main className="admin-content flex-1 px-4 pb-8 pt-20 sm:px-6 lg:px-10 lg:pt-8">{children}</main>
 </div>
 </div>
 );
}
