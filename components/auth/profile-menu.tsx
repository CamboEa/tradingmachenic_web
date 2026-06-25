"use client";

import type { User } from "@supabase/supabase-js";
import { useEffect, useRef, useState } from "react";

import { signOut } from "@/lib/supabase/actions";

function getInitials(user: User): string {
 const name =
 user.user_metadata?.full_name ||
 user.user_metadata?.name ||
 user.email ||
 "";
 const parts = name.trim().split(/\s+/);
 if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
 return name.slice(0, 2).toUpperCase();
}

export function ProfileMenu({
 user,
 signOutLabel,
}: {
 user: User;
 signOutLabel: string;
}) {
 const [open, setOpen] = useState(false);
 const ref = useRef<HTMLDivElement>(null);

 useEffect(() => {
 function handleClick(e: MouseEvent) {
 if (ref.current && !ref.current.contains(e.target as Node)) {
 setOpen(false);
 }
 }
 document.addEventListener("mousedown", handleClick);
 return () => document.removeEventListener("mousedown", handleClick);
 }, []);

 const initials = getInitials(user);
 const email = user.email ?? "";

 return (
 <div ref={ref} className="relative">
 <button
 onClick={() => setOpen((v) => !v)}
 aria-label="Account menu"
 aria-expanded={open}
 className="flex h-9 w-9 items-center justify-center rounded-full bg-teal text-xs font-bold text-white ring-2 ring-transparent transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-teal/50"
 >
 {initials}
 </button>

 {open && (
 <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-bridge/40 bg-background">
 <div className="border-b border-bridge/40 px-4 py-3">
 <p className="truncate text-xs font-semibold text-foreground">
 {email}
 </p>
 </div>
 <form
 action={async () => {
 setOpen(false);
 await signOut();
 }}
 >
 <button
 type="submit"
 className="flex w-full items-center gap-2 px-4 py-3 text-sm text-ink-muted transition hover:bg-surface-soft hover:text-foreground"
 >
 <svg
 xmlns="http://www.w3.org/2000/svg"
 viewBox="0 0 20 20"
 fill="currentColor"
 className="h-4 w-4 shrink-0"
 aria-hidden
 >
 <path
 fillRule="evenodd"
 d="M3 4.25A2.25 2.25 0 0 1 5.25 2h5.5A2.25 2.25 0 0 1 13 4.25v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 0-.75-.75h-5.5a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 0 0 .75-.75v-2a.75.75 0 0 1 1.5 0v2A2.25 2.25 0 0 1 10.75 18h-5.5A2.25 2.25 0 0 1 3 15.75V4.25Z"
 clipRule="evenodd"
 />
 <path
 fillRule="evenodd"
 d="M6 10a.75.75 0 0 1 .75-.75h9.546l-1.048-1.11a.75.75 0 1 1 1.091-1.03l2.5 2.648a.75.75 0 0 1 0 1.031l-2.5 2.649a.75.75 0 1 1-1.09-1.03l1.047-1.111H6.75A.75.75 0 0 1 6 10Z"
 clipRule="evenodd"
 />
 </svg>
 {signOutLabel}
 </button>
 </form>
 </div>
 )}
 </div>
 );
}
