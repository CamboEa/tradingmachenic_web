"use client";

import { toast } from "react-toastify";

export function AuthPlaceholderForm({
 mode,
 emailLabel,
 passwordLabel,
 submitLabel,
}: {
 mode: "login" | "register";
 emailLabel: string;
 passwordLabel: string;
 submitLabel: string;
}) {
 const idEmail = mode === "login" ? "login-email" : "register-email";
 const idPassword = mode === "login" ? "login-password" : "register-password";

 const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
 e.preventDefault();
 toast.info("Authentication coming soon!");
 };

 return (
 <form
 className="mt-8 space-y-5"
 onSubmit={handleSubmit}
 noValidate
 >
 <div>
 <label
 htmlFor={idEmail}
 className="block text-sm font-medium text-[var(--color-ink)]"
 >
 {emailLabel}
 </label>
 <input
 id={idEmail}
 name="email"
 type="email"
 autoComplete="email"
 className="mt-2 w-full rounded-lg border border-[color-mix(in_oklab,var(--color-bridge)_65%,transparent)] bg-[var(--color-surface)] px-4 py-3 text-[var(--color-ink)] outline-none focus:ring-2 focus:ring-[var(--color-teal)]"
 />
 </div>
 <div>
 <label
 htmlFor={idPassword}
 className="block text-sm font-medium text-[var(--color-ink)]"
 >
 {passwordLabel}
 </label>
 <input
 id={idPassword}
 name="password"
 type="password"
 autoComplete={
 mode === "login" ? "current-password" : "new-password"
 }
 className="mt-2 w-full rounded-lg border border-[color-mix(in_oklab,var(--color-bridge)_65%,transparent)] bg-[var(--color-surface)] px-4 py-3 text-[var(--color-ink)] outline-none focus:ring-2 focus:ring-[var(--color-teal)]"
 />
 </div>
 <button
 type="submit"
 className="w-full rounded-lg bg-[var(--color-teal)] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-105 sm:w-auto sm:min-w-[140px]"
 >
 {submitLabel}
 </button>
 </form>
 );
}
