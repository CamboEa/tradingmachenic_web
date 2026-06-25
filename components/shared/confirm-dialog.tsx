"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type ConfirmDialogOptions = {
 title: string;
 description: string;
 confirmLabel?: string;
 cancelLabel?: string;
 /** danger = destructive delete (red confirm button) */
 variant?: "danger" | "default";
};

type ConfirmDialogProps = ConfirmDialogOptions & {
 open: boolean;
 loading?: boolean;
 onConfirm: () => void | Promise<void>;
 onCancel: () => void;
};

export function ConfirmDialog({
 open,
 loading = false,
 title,
 description,
 confirmLabel = "Confirm",
 cancelLabel = "Cancel",
 variant = "danger",
 onConfirm,
 onCancel,
}: ConfirmDialogProps) {
 const titleId = useId();
 const descId = useId();
 const cancelRef = useRef<HTMLButtonElement>(null);

 useEffect(() => {
 if (!open) return;
 const prev = document.body.style.overflow;
 document.body.style.overflow = "hidden";
 cancelRef.current?.focus();

 function onKey(e: KeyboardEvent) {
 if (e.key === "Escape" && !loading) onCancel();
 }
 document.addEventListener("keydown", onKey);
 return () => {
 document.body.style.overflow = prev;
 document.removeEventListener("keydown", onKey);
 };
 }, [open, loading, onCancel]);

 if (!open) return null;

 const confirmClass =
 variant === "danger"
 ? "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500/40"
 : "bg-teal text-white hover:brightness-110 focus-visible:ring-teal/40";

 return createPortal(
 <div
 className="fixed inset-0 z-[100] flex items-center justify-center p-4"
 role="presentation"
 >
 <button
 type="button"
 aria-label="Close dialog"
 className="absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity"
 onClick={loading ? undefined : onCancel}
 disabled={loading}
 />
 <div
 role="alertdialog"
 aria-modal="true"
 aria-labelledby={titleId}
 aria-describedby={descId}
 className="relative w-full max-w-md overflow-hidden rounded-2xl border border-bridge/40 bg-background"
 >
 <div className="border-b border-bridge/40 bg-surface px-6 py-5">
 <div className="flex gap-4">
 <span
 className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
 variant === "danger"
 ? "bg-red-500/15 text-red-400 ring-1 ring-red-500/30"
 : "bg-surface-soft text-foreground ring-1 ring-teal/20"
 }`}
 aria-hidden
 >
 {variant === "danger" ? (
 <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
 />
 </svg>
 ) : (
 <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
 <path
 strokeLinecap="round"
 strokeLinejoin="round"
 d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
 />
 </svg>
 )}
 </span>
 <div className="min-w-0 pt-0.5">
 <h2 id={titleId} className="text-lg font-bold tracking-tight text-foreground">
 {title}
 </h2>
 <p id={descId} className="mt-1.5 text-sm leading-relaxed text-ink-muted">
 {description}
 </p>
 </div>
 </div>
 </div>
 <div className="flex flex-col-reverse gap-2 px-6 py-4 sm:flex-row sm:justify-end">
 <button
 ref={cancelRef}
 type="button"
 onClick={onCancel}
 disabled={loading}
 className="rounded-lg border border-bridge/40 bg-surface px-4 py-2.5 text-sm font-semibold text-ink-muted transition hover:border-bridge/60 hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/30 disabled:opacity-50"
 >
 {cancelLabel}
 </button>
 <button
 type="button"
 onClick={onConfirm}
 disabled={loading}
 className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${confirmClass}`}
 >
 {loading ? "Please wait…" : confirmLabel}
 </button>
 </div>
 </div>
 </div>,
 document.body,
 );
}

export type ConfirmRequest = ConfirmDialogOptions & {
 /** Runs after user confirms; dialog stays open with loading until this finishes. */
 onConfirm?: () => void | Promise<void>;
};

/** Hook for confirm-before-action flows (no window.confirm / alert). */
export function useConfirm() {
 const [open, setOpen] = useState(false);
 const [loading, setLoading] = useState(false);
 const [options, setOptions] = useState<ConfirmDialogOptions | null>(null);
 const onConfirmRef = useRef<(() => void | Promise<void>) | undefined>(undefined);
 const resolveRef = useRef<((value: boolean) => void) | null>(null);

 const confirm = useCallback((opts: ConfirmRequest) => {
 const { onConfirm, ...dialogOpts } = opts;
 onConfirmRef.current = onConfirm;
 setOptions(dialogOpts);
 setOpen(true);
 setLoading(false);
 return new Promise<boolean>((resolve) => {
 resolveRef.current = resolve;
 });
 }, []);

 const finish = useCallback((result: boolean) => {
 if (loading) return;
 setOpen(false);
 const resolve = resolveRef.current;
 resolveRef.current = null;
 onConfirmRef.current = undefined;
 setOptions(null);
 resolve?.(result);
 }, [loading]);

 const handleCancel = useCallback(() => finish(false), [finish]);

 const handleConfirm = useCallback(async () => {
 const action = onConfirmRef.current;
 if (!action) {
 finish(true);
 return;
 }
 setLoading(true);
 try {
 await action();
 setLoading(false);
 finish(true);
 } catch {
 setLoading(false);
 // Keep dialog open on error so user can cancel or retry
 }
 }, [finish]);

 const ConfirmDialogHost =
 options && open ? (
 <ConfirmDialog
 open={open}
 loading={loading}
 title={options.title}
 description={options.description}
 confirmLabel={options.confirmLabel}
 cancelLabel={options.cancelLabel}
 variant={options.variant}
 onCancel={handleCancel}
 onConfirm={handleConfirm}
 />
 ) : null;

 return { confirm, ConfirmDialogHost };
}
