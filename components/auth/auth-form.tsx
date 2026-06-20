"use client";

import { useActionState, useEffect, useId, useState } from "react";
import { toast } from "react-toastify";

import { TurnstileWidget } from "@/components/auth/turnstile-widget";
import { signIn, signInWithGoogle, signUp, type AuthState } from "@/lib/supabase/actions";
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
  "w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 pl-11 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal focus:bg-white focus:ring-2 focus:ring-teal/20 disabled:opacity-60";

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

function UserIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-7 9a7 7 0 1 1 14 0H3Z" />
    </svg>
  );
}

function EnvelopeIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 6.5A1.5 1.5 0 0 1 4 5h12a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 16 16H4a1.5 1.5 0 0 1-1.5-1.5v-8Zm0 0 7.5 5 7.5-5" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-5 w-5">
      <rect x="4" y="9" width="12" height="9" rx="2" strokeLinecap="round" strokeLinejoin="round" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 9V6a3 3 0 0 1 6 0v3" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
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
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative mt-1.5">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
          <LockIcon />
        </span>
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
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/30 disabled:opacity-50 cursor-pointer"
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

  const showConfirmation = isRegister && state === null && !isPending;

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
      <div className="mt-8 rounded-xl border border-teal/30 bg-teal/5 px-5 py-6">
        <p className="font-semibold text-slate-800">Check your email</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
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
    <div className="mt-7 space-y-5">
      {/* Google sign-in — server action form so no browser Supabase client needed */}
      <form action={signInWithGoogle}>
        <button
          type="submit"
          disabled={isPending}
          className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition duration-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/30 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <GoogleIcon />
          Continue with Google
        </button>
      </form>

      {/* Divider */}
      <div className="relative flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs font-medium text-slate-400">Or continue with email</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      {/* Email/password form */}
      <form
        action={formAction}
        onSubmit={handleSubmit}
        className="space-y-4"
        noValidate
      >
        <input type="hidden" name="locale" value={locale} />
        {redirectTo && (
          <input type="hidden" name="redirectTo" value={redirectTo} />
        )}

        {/* Full name (register only) */}
        {isRegister && (
          <div>
            <label htmlFor={idName} className="block text-sm font-medium text-slate-700">
              {nameLabel}
            </label>
            <div className="relative mt-1.5">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <UserIcon />
              </span>
              <input
                id={idName}
                name="full_name"
                type="text"
                autoComplete="name"
                required
                disabled={isPending}
                placeholder="Your full name"
                className={inputClass}
              />
            </div>
          </div>
        )}

        {/* Email */}
        <div>
          <label htmlFor={idEmail} className="block text-sm font-medium text-slate-700">
            {emailLabel}
          </label>
          <div className="relative mt-1.5">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <EnvelopeIcon />
            </span>
            <input
              id={idEmail}
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={isPending}
              placeholder="you@example.com"
              className={inputClass}
            />
          </div>
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
          className="mt-1 w-full cursor-pointer rounded-xl bg-teal px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-teal/20 transition duration-200 hover:brightness-110 hover:shadow-md active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Please wait…" : submitLabel}
        </button>
      </form>
    </div>
  );
}
