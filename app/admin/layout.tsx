import type { Metadata } from "next";

import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminTopbar } from "@/components/layout/admin-topbar";

export const metadata: Metadata = {
 title: { default: "Admin", template: "%s | Admin — Algorithmic Alpha Trade" },
};

export default function AdminLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return (
 <div className="admin-shell flex h-screen overflow-hidden">
 <AdminSidebar />
 <div className="flex flex-1 flex-col overflow-auto">
 <AdminTopbar />
 <main className="admin-content flex-1 px-4 py-8 sm:px-6 lg:px-10">{children}</main>
 </div>
 </div>
 );
}
