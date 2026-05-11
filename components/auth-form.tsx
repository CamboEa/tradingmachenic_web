"use client";

import { useActionState } from "react";

import { signIn, signUp, type AuthState } from "@/lib/supabase/actions";

interface AuthFormProps {
  mode: "login" | "register";
  emailLabel: string;
  passwordLabel: string;
  submitLabel: string;
  locale: string;
  redirectTo?: string;
}

export function AuthForm({
  mode,
  emailLabel,
  passwordLabel,
  submitLabel,
  locale,
  redirectTo,
}: AuthFormProps) {
  const action = mode === "login" ? signIn : signUp;
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    action,
    undefined,
  );

  const idEmail = `${mode}-email`;
  const idPassword = `${mode}-password`;

  // signUp returns null on success (email confirmation sent)
  const showConfirmation = mode === "register" && state === null && !isPending;

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

  return (
    <form action={formAction} className="mt-8 space-y-5" noValidate>
      {/* Hidden fields */}
      <input type="hidden" name="locale" value={locale} />
      {redirectTo && (
        <input type="hidden" name="redirectTo" value={redirectTo} />
      )}

      {/* Error banner */}
      {state?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
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
          className="mt-2 w-full rounded-lg border border-[color-mix(in_oklab,var(--color-bridge)_65%,transparent)] bg-[var(--color-surface)] px-4 py-3 text-[var(--color-ink)] outline-none transition focus:ring-2 focus:ring-[var(--color-teal)] disabled:opacity-60"
        />
      </div>

      {/* Password */}
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
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          required
          disabled={isPending}
          className="mt-2 w-full rounded-lg border border-[color-mix(in_oklab,var(--color-bridge)_65%,transparent)] bg-[var(--color-surface)] px-4 py-3 text-[var(--color-ink)] outline-none transition focus:ring-2 focus:ring-[var(--color-teal)] disabled:opacity-60"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-[var(--color-teal)] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-105 disabled:opacity-60 sm:w-auto sm:min-w-[140px]"
      >
        {isPending ? "Please wait…" : submitLabel}
      </button>
    </form>
  );
}
