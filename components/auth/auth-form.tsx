"use client";

import { useActionState, useEffect, useId, useState } from "react";
import { toast } from "react-toastify";

import { TurnstileWidget } from "@/components/auth/turnstile-widget";
import { signIn, signUp, type AuthState } from "@/lib/supabase/actions";
import { isTurnstileConfigured } from "@/lib/security/turnstile-public";

interface AuthFormProps {
 mode: "login" | "register";
 nameLabel?: string;
 emailLabel: string;
 passwordLabel: string;
 confirmPasswordLabel?: string;
 passwordMismatch?: string;
 showPasswordLabel: string;
 hidePasswordLabel: string;
 submitLabel: string;
 locale: string;
 redirectTo?: string;
}

const inputClass =
 "w-full rounded-xl border border-[color-mix(in_oklab,var(--color-bridge)_65%,transparent)] bg-white/90 px-4 py-3 text-[var(--color-ink)] outline-none transition focus:border-[var(--color-teal)] focus:ring-2 focus:ring-[color-mix(in_oklab,var(--color-teal)_22%,transparent)] disabled:opacity-60";

function EyeIcon({ off }: { off: boolean }) {
 return (
 <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-5 w-5">
 {off ? (
 <>
 <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 2.5l15 15" />
 <path strokeLinecap="round" strokeLinejoin="round" d="M8.2 8.3a2.5 2.5 0 0 0 3.5 3.5M6.1 6.2C4.2 7.3 2.8 9 2 10c1.6 2.7 4.5 5 8 5 1.4 0 2.7-.36 3.9-.98M16 13.2c1-.86 1.8-1.95 2.4-3.2-1.6-2.7-4.5-5-8.4-5-.5 0-1 .04-1.4.12" />
 </>
 ) : (
 <>
 <path strokeLinecap="round" strokeLinejoin="round" d="M2 10c1.6-2.7 4.5-5 8-5s6.4 2.3 8 5c-1.6 2.7-4.5 5-8 5s-6.4-2.3-8-5Z" />
 <circle cx="10" cy="10" r="2.5" />
 </>
 )}
 </svg>
 );
}

interface PasswordFieldProps {
 id: string;
 name: string;
 label: string;
 value: string;
 onChange: (value: string) => void;
 autoComplete: string;
 disabled: boolean;
 visible: boolean;
 onToggle: () => void;
 showLabel: string;
 hideLabel: string;
 invalid?: boolean;
 describedBy?: string;
}

function PasswordField({
 id,
 name,
 label,
 value,
 onChange,
 autoComplete,
 disabled,
 visible,
 onToggle,
 showLabel,
 hideLabel,
 invalid,
 describedBy,
}: PasswordFieldProps) {
 return (
 <div>
 <label htmlFor={id} className="block text-sm font-medium text-[var(--color-ink)]">
 {label}
 </label>
 <div className="relative mt-2">
 <input
 id={id}
 name={name}
 type={visible ? "text" : "password"}
 autoComplete={autoComplete}
 required
 disabled={disabled}
 value={value}
 onChange={(e) => onChange(e.target.value)}
 aria-invalid={invalid || undefined}
 aria-describedby={describedBy}
 className={`${inputClass} pr-12 ${invalid ? "border-red-400 focus:border-red-400 focus:ring-red-200" : ""}`}
 />
 <button
 type="button"
 onClick={onToggle}
 disabled={disabled}
 aria-label={visible ? hideLabel : showLabel}
 aria-pressed={visible}
 title={visible ? hideLabel : showLabel}
 className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[var(--color-ink-muted)] transition hover:text-[var(--color-ink)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_oklab,var(--color-teal)_30%,transparent)] disabled:opacity-50"
 >
 <EyeIcon off={visible} />
 </button>
 </div>
 </div>
 );
}

export function AuthForm({
 mode,
 nameLabel,
 emailLabel,
 passwordLabel,
 confirmPasswordLabel,
 passwordMismatch,
 showPasswordLabel,
 hidePasswordLabel,
 submitLabel,
 locale,
 redirectTo,
}: AuthFormProps) {
 const action = mode === "login" ? signIn : signUp;
 const [state, formAction, isPending] = useActionState<AuthState, FormData>(
 action,
 undefined,
 );

 const [password, setPassword] = useState("");
 const [confirmPassword, setConfirmPassword] = useState("");
 const [showPassword, setShowPassword] = useState(false);
 const [showConfirm, setShowConfirm] = useState(false);
 const [turnstileToken, setTurnstileToken] = useState("");
 const turnstileRequired = isTurnstileConfigured();

 const baseId = useId();
 const idName = `${baseId}-name`;
 const idEmail = `${baseId}-email`;
 const idPassword = `${baseId}-password`;
 const idConfirm = `${baseId}-confirm`;
 const idMismatch = `${baseId}-mismatch`;

 const isRegister = mode === "register";
 const mismatch =
 isRegister && confirmPassword.length > 0 && password !== confirmPassword;

 // signUp returns null on success (email confirmation sent)
 const showConfirmation = isRegister && state === null && !isPending;

 // Show toast on sign in/up
 useEffect(() => {
 if (isPending) return;

 if (state?.error) {
 toast.error(state.error);
 } else if (isRegister && state === null && !isPending) {
 toast.success("Check your email to confirm your account!");
 }
 }, [state, isPending, isRegister]);

 if (showConfirmation) {
 return (
 <div className="mt-8 rounded-xl border border-[color-mix(in_oklab,var(--color-teal)_35%,var(--color-bridge))] bg-[color-mix(in_oklab,var(--color-teal)_06%,var(--color-surface))] px-5 py-6">
 <p className="font-semibold text-[var(--color-ink)]">
 Check your email
 </p>
 <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-muted)]">
 We sent a confirmation link to your email address. Click it to
 activate your account.
 </p>
 </div>
 );
 }

 function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
 if (isRegister && password !== confirmPassword) {
 e.preventDefault();
 toast.error(passwordMismatch ?? "Passwords do not match.");
 return;
 }
 if (turnstileRequired && !turnstileToken) {
 e.preventDefault();
 toast.error("Please complete the security check.");
 }
 }

 return (
 <form
 action={formAction}
 onSubmit={handleSubmit}
 className="mt-8 space-y-5"
 noValidate
 >
 {/* Hidden fields */}
 <input type="hidden" name="locale" value={locale} />
 {redirectTo && (
 <input type="hidden" name="redirectTo" value={redirectTo} />
 )}

 {/* Full name (register only) */}
 {isRegister && (
 <div>
 <label
 htmlFor={idName}
 className="block text-sm font-medium text-[var(--color-ink)]"
 >
 {nameLabel}
 </label>
 <input
 id={idName}
 name="full_name"
 type="text"
 autoComplete="name"
 required
 disabled={isPending}
 className={`${inputClass} mt-2`}
 />
 </div>
 )}

 {/* Email */}
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
 required
 disabled={isPending}
 className={`${inputClass} mt-2`}
 />
 </div>

 {/* Password */}
 <PasswordField
 id={idPassword}
 name="password"
 label={passwordLabel}
 value={password}
 onChange={setPassword}
 autoComplete={isRegister ? "new-password" : "current-password"}
 disabled={isPending}
 visible={showPassword}
 onToggle={() => setShowPassword((v) => !v)}
 showLabel={showPasswordLabel}
 hideLabel={hidePasswordLabel}
 />

 {/* Confirm password (register only) */}
 {isRegister && (
 <div>
 <PasswordField
 id={idConfirm}
 name="confirm_password"
 label={confirmPasswordLabel ?? "Confirm password"}
 value={confirmPassword}
 onChange={setConfirmPassword}
 autoComplete="new-password"
 disabled={isPending}
 visible={showConfirm}
 onToggle={() => setShowConfirm((v) => !v)}
 showLabel={showPasswordLabel}
 hideLabel={hidePasswordLabel}
 invalid={mismatch}
 describedBy={mismatch ? idMismatch : undefined}
 />
 {mismatch && (
 <p id={idMismatch} className="mt-1.5 text-sm font-medium text-red-600">
 {passwordMismatch ?? "Passwords do not match."}
 </p>
 )}
 </div>
 )}

 <TurnstileWidget onTokenChange={setTurnstileToken} />
 {turnstileRequired && (
 <input type="hidden" name="cf-turnstile-response" value={turnstileToken} />
 )}

 <button
 type="submit"
 disabled={isPending || mismatch || (turnstileRequired && !turnstileToken)}
 className="w-full rounded-xl bg-[var(--color-teal)] px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:brightness-105 disabled:translate-y-0 disabled:opacity-60 sm:w-auto sm:min-w-[140px]"
 >
 {isPending ? "Please wait…" : submitLabel}
 </button>
 </form>
 );
}
