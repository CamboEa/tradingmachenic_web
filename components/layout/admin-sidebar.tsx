"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SiteLogo } from "@/components/shared/site-logo";

const NAV = [
 {
 href: "/admin",
 label: "Dashboard",
 icon: (
 <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
 <path d="M2 10a8 8 0 1 1 16 0A8 8 0 0 1 2 10Zm8-4a1 1 0 0 0-1 1v3H6a1 1 0 1 0 0 2h3a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1Z" />
 </svg>
 ),
 },
 {
 href: "/admin/program",
 label: "Program Management",
 icon: (
 <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
 <path d="M9 4.804A7.968 7.968 0 0 0 5.465 4h-.878a.75.75 0 0 0-.75.75v9.5c0 .414.336.75.75.75h.878a7.968 7.968 0 0 0 3.535-.804V4.804ZM11 4.804V14.196A7.968 7.968 0 0 1 14.535 15h.878a.75.75 0 0 0 .75-.75v-9.5A.75.75 0 0 0 15.413 4h-.878A7.968 7.968 0 0 0 11 4.804Z" />
 </svg>
 ),
 },
 {
 href: "/admin/lessons",
 label: "Lessons",
 icon: (
 <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
 <path
 fillRule="evenodd"
 d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75ZM2 10a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10Zm0 5.25a.75.75 0 0 1 .75-.75H10a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z"
 clipRule="evenodd"
 />
 </svg>
 ),
 },
 {
 href: "/admin/tools",
 label: "Tools",
 icon: (
 <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
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
 <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
 <path fillRule="evenodd" d="M2 4.25A.75.75 0 0 1 2.75 3.5h14.5a.75.75 0 0 1 .75.75v11.5a.75.75 0 0 1-.75.75H2.75a.75.75 0 0 1-.75-.75V4.25Zm3.5 1.5a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5H6Zm-.75 3.75a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5H6a.75.75 0 0 1-.75-.75Zm-.75 2.25a.75.75 0 0 1 .75-.75h8.5a.75.75 0 0 1 0 1.5H6a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
 </svg>
 ),
 },
 {
 href: "/admin/podcasts",
 label: "Podcasts",
 icon: (
 <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
 <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h9A1.5 1.5 0 0 1 16 5.5v9a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 4 14.5v-9ZM8.25 7.75a.75.75 0 0 0-1.28-.53l-2 2a.75.75 0 0 0 0 1.06l2 2a.75.75 0 1 0 1.06-1.06L7.06 10l1.03-1.03a.75.75 0 0 0 0-1.22ZM10.75 12h2.5a.75.75 0 0 0 0-1.5h-2.5a.75.75 0 0 0 0 1.5Z" />
 </svg>
 ),
 },
 {
 href: "/admin/students",
 label: "Students",
 icon: (
 <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
 <path d="M7 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM14.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM1.615 16.428a1.224 1.224 0 0 1-.569-1.175 6.002 6.002 0 0 1 11.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 0 1 7 17a9.953 9.953 0 0 1-5.385-1.572ZM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 0 0-1.588-3.755 4.502 4.502 0 0 1 5.874 2.636.818.818 0 0 1-.36.98A7.465 7.465 0 0 1 14.5 16Z" />
 </svg>
 ),
 },
];

export function AdminSidebar() {
 const pathname = usePathname();

 function isActive(href: string) {
 if (href === "/admin") return pathname === "/admin";
 return pathname.startsWith(href);
 }

 return (
 <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-white/10 bg-[#1e293b] text-slate-300">
 {/* Logo */}
 <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
 <SiteLogo size="md" className="rounded-lg ring-1 ring-white/10" />
 <div>
 <p className="text-sm font-semibold text-white">Algorithmic Alpha Trade</p>
 <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Admin Panel</p>
 </div>
 </div>

 {/* Nav */}
 <nav className="flex-1 overflow-y-auto px-3 py-4">
 <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
 Main
 </p>
 <ul className="space-y-0.5">
 {NAV.map((item) => (
 <li key={item.href}>
 <Link
 href={item.href}
 className={[
 "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
 isActive(item.href)
 ? "bg-[#0ea5e9]/15 text-sky-200 ring-1 ring-[#0ea5e9]/20"
 : "text-slate-400 hover:bg-white/5 hover:text-white",
 ].join(" ")}
 >
 {item.icon}
 {item.label}
 </Link>
 </li>
 ))}
 </ul>
 </nav>

 {/* Footer */}
 <div className="border-t border-white/10 px-5 py-4">
 <Link
 href="/"
 className="flex items-center gap-2 rounded-xl px-2 py-2 text-xs font-semibold text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-300"
 >
 <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
 <path d="M7.78 12.53a.75.75 0 0 1-1.06 0L2.47 8.28a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 1.06L4.81 7h7.44a.75.75 0 0 1 0 1.5H4.81l2.97 2.97a.75.75 0 0 1 0 1.06Z" />
 </svg>
 Back to site
 </Link>
 </div>
 </aside>
 );
}
