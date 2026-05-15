import type { Metadata } from "next";

import { AdminSidebar } from "@/components/admin-sidebar";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin — Trading Machenic" },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_26rem),#f1f5f9]">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-auto">
        {/* Auth notice */}
        <div className="border-b border-amber-200/80 bg-amber-50/90 px-6 py-2 text-xs font-medium text-amber-800 backdrop-blur">
          Admin area — authentication is not connected yet. Restrict access
          before deploying to production.
        </div>
        <main className="flex-1 px-6 py-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
