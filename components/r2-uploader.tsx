"use client";

import { useRef, useState } from "react";
import type { ReactNode } from "react";
import { toast } from "react-toastify";

type BucketName = "trading-lesson" | "trading-tool";

interface R2UploaderProps {
 bucketName: BucketName;
 accept: string;
 label: ReactNode;
 hint: string;
 initialUrl?: string;
 onUploaded: (publicUrl: string, key: string) => void;
}

type State =
 | { status: "idle" }
 | { status: "uploading"; progress: number; loaded: number; total: number; phase: "preparing" | "uploading" }
 | { status: "done"; publicUrl: string }
 | { status: "error"; message: string };

function formatBytes(bytes: number): string {
 if (bytes < 1024) return `${bytes} B`;
 if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
 return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function resolveContentType(file: File, bucketName: BucketName): string {
 if (file.type && file.type !== "application/octet-stream") return file.type;

 const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
 if (bucketName === "trading-lesson") {
 const video: Record<string, string> = {
 mp4: "video/mp4",
 webm: "video/webm",
 mov: "video/quicktime",
 m4v: "video/mp4",
 avi: "video/x-msvideo",
 mkv: "video/x-matroska",
 };
 return video[ext] ?? "video/mp4";
 }

 const tool: Record<string, string> = {
 zip: "application/zip",
 png: "image/png",
 jpg: "image/jpeg",
 jpeg: "image/jpeg",
 webp: "image/webp",
 gif: "image/gif",
 };
 return tool[ext] ?? "application/octet-stream";
}

function uploadWithProgress(
 file: File,
 presignedUrl: string,
 contentType: string,
 onProgress: (loaded: number, total: number, percent: number) => void,
): Promise<void> {
 return new Promise((resolve, reject) => {
 const xhr = new XMLHttpRequest();

 xhr.upload.addEventListener("progress", (event) => {
 if (!event.lengthComputable) return;
 const percent = Math.min(100, Math.round((event.loaded / event.total) * 100));
 onProgress(event.loaded, event.total, percent);
 });

 xhr.addEventListener("load", () => {
 if (xhr.status >= 200 && xhr.status < 300) {
 resolve();
 return;
 }
 reject(new Error(`Upload failed (${xhr.status})`));
 });

 xhr.addEventListener("error", () => reject(new Error("Network error during upload")));
 xhr.addEventListener("abort", () => reject(new Error("Upload cancelled")));

 xhr.open("PUT", presignedUrl);
 xhr.setRequestHeader("Content-Type", contentType);
 xhr.send(file);
 });
}

export function R2Uploader({
 bucketName,
 accept,
 label,
 hint,
 initialUrl,
 onUploaded,
}: R2UploaderProps) {
 const [state, setState] = useState<State>(
 initialUrl ? { status: "done", publicUrl: initialUrl } : { status: "idle" },
 );
 const inputRef = useRef<HTMLInputElement>(null);

 async function handleFile(file: File) {
 const contentType = resolveContentType(file, bucketName);

 setState({
 status: "uploading",
 progress: 0,
 loaded: 0,
 total: file.size,
 phase: "preparing",
 });

 try {
 const presignRes = await fetch("/api/r2/presign", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({
 bucketName,
 filename: file.name,
 contentType,
 sizeBytes: file.size,
 }),
 });

 if (!presignRes.ok) {
 const body = (await presignRes.json().catch(() => ({}))) as { error?: string };
 if (presignRes.status === 401) {
 throw new Error("You must be signed in to upload files");
 }
 if (presignRes.status === 403) {
 throw new Error("Only admins can upload files");
 }
 throw new Error(body.error ?? "Failed to prepare upload");
 }

 const { presignedUrl, publicUrl, key } = (await presignRes.json()) as {
 presignedUrl: string;
 publicUrl: string;
 key: string;
 };

 setState({
 status: "uploading",
 progress: 0,
 loaded: 0,
 total: file.size,
 phase: "uploading",
 });

 await uploadWithProgress(file, presignedUrl, contentType, (loaded, total, percent) => {
 setState({
 status: "uploading",
 progress: percent,
 loaded,
 total,
 phase: "uploading",
 });
 });

 setState({ status: "done", publicUrl });
 onUploaded(publicUrl, key);
 toast.success("File uploaded successfully!");
 } catch (err) {
 const message = err instanceof Error ? err.message : "Upload failed";
 setState({ status: "error", message });
 toast.error(message);
 }
 }

 function handleDrop(e: React.DragEvent) {
 e.preventDefault();
 const file = e.dataTransfer.files[0];
 if (file) handleFile(file);
 }

 function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
 const file = e.target.files?.[0];
 if (file) handleFile(file);
 e.target.value = "";
 }

 const isUploading = state.status === "uploading";

 return (
 <div>
 <label className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</label>

 <div
 onDrop={handleDrop}
 onDragOver={(e) => e.preventDefault()}
 onClick={() => !isUploading && inputRef.current?.click()}
 className={[
 "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-8 text-center transition",
 isUploading
 ? "cursor-not-allowed border-[#0ea5e9] bg-sky-50"
 : state.status === "done"
 ? "border-emerald-300 bg-emerald-50"
 : state.status === "error"
 ? "border-red-300 bg-red-50"
 : "border-slate-200 bg-slate-50 hover:border-[#0ea5e9] hover:bg-sky-50",
 ].join(" ")}
 >
 <input
 ref={inputRef}
 type="file"
 accept={accept}
 onChange={handleChange}
 className="sr-only"
 disabled={isUploading}
 />

 {state.status === "idle" && (
 <>
 <svg viewBox="0 0 20 20" fill="currentColor" className="mx-auto h-8 w-8 text-slate-300">
 <path
 fillRule="evenodd"
 d="M10 1a.75.75 0 0 1 .75.75v6.69l2.22-2.22a.75.75 0 0 1 1.06 1.06l-3.5 3.5a.75.75 0 0 1-1.06 0l-3.5-3.5a.75.75 0 0 1 1.06-1.06l2.22 2.22V1.75A.75.75 0 0 1 10 1ZM3 15.75a.75.75 0 0 1 .75-.75h12.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z"
 clipRule="evenodd"
 />
 </svg>
 <p className="mt-2 text-xs text-slate-500">
 Drop file here or <span className="font-semibold text-[#0ea5e9]">browse</span>
 </p>
 <p className="mt-1 text-[10px] text-slate-400">{hint}</p>
 </>
 )}

 {state.status === "uploading" && (
 <>
 <p className="text-sm font-semibold text-[#0ea5e9]">
 {state.phase === "preparing"
 ? "Preparing upload…"
 : `Uploading… ${state.progress}%`}
 </p>
 <p className="mt-1 text-xs text-slate-500">
 {state.phase === "uploading"
 ? `${formatBytes(state.loaded)} / ${formatBytes(state.total)}`
 : "Requesting secure upload URL"}
 </p>
 <div className="mt-3 h-2 w-full max-w-xs overflow-hidden rounded-full bg-sky-100">
 <div
 className="h-full rounded-full bg-[#0ea5e9] transition-[width] duration-150 ease-out"
 style={{
 width: state.phase === "preparing" ? "8%" : `${state.progress}%`,
 }}
 />
 </div>
 </>
 )}

 {state.status === "done" && (
 <>
 <svg viewBox="0 0 20 20" fill="currentColor" className="mx-auto h-8 w-8 text-emerald-500">
 <path
 fillRule="evenodd"
 d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
 clipRule="evenodd"
 />
 </svg>
 <p className="mt-2 text-xs font-semibold text-emerald-700">Uploaded</p>
 <p className="mt-1 max-w-xs truncate font-mono text-[10px] text-emerald-600">
 {state.publicUrl}
 </p>
 <button
 type="button"
 onClick={(e) => {
 e.stopPropagation();
 setState({ status: "idle" });
 }}
 className="mt-2 text-[10px] text-slate-400 underline hover:text-slate-600"
 >
 Replace
 </button>
 </>
 )}

 {state.status === "error" && (
 <>
 <svg viewBox="0 0 20 20" fill="currentColor" className="mx-auto h-8 w-8 text-red-400">
 <path
 fillRule="evenodd"
 d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
 clipRule="evenodd"
 />
 </svg>
 <p className="mt-2 text-xs font-semibold text-red-600">{state.message}</p>
 <button
 type="button"
 onClick={(e) => {
 e.stopPropagation();
 setState({ status: "idle" });
 }}
 className="mt-2 text-[10px] text-slate-400 underline hover:text-slate-600"
 >
 Try again
 </button>
 </>
 )}
 </div>
 </div>
 );
}
