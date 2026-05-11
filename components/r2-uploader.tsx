"use client";

import { useRef, useState } from "react";

type UploadFolder = "videos" | "tools";

interface R2UploaderProps {
  folder: UploadFolder;
  accept: string;
  label: string;
  hint: string;
  onUploaded: (publicUrl: string, key: string) => void;
}

type State =
  | { status: "idle" }
  | { status: "uploading"; progress: number }
  | { status: "done"; publicUrl: string }
  | { status: "error"; message: string };

export function R2Uploader({
  folder,
  accept,
  label,
  hint,
  onUploaded,
}: R2UploaderProps) {
  const [state, setState] = useState<State>({ status: "idle" });
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setState({ status: "uploading", progress: 0 });

    try {
      // 1. Get presigned URL from our API
      const res = await fetch("/api/r2/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folder,
          filename: file.name,
          contentType: file.type || "application/octet-stream",
          sizeBytes: file.size,
        }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error ?? "Failed to get upload URL");
      }

      const { presignedUrl, publicUrl, key } = await res.json();

      // 2. Upload directly to R2 with XHR so we can track progress
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", presignedUrl);
        xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setState({
              status: "uploading",
              progress: Math.round((e.loaded / e.total) * 100),
            });
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`R2 upload failed: ${xhr.status}`));
        };

        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.send(file);
      });

      setState({ status: "done", publicUrl });
      onUploaded(publicUrl, key);
    } catch (err) {
      setState({
        status: "error",
        message: err instanceof Error ? err.message : "Upload failed",
      });
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
  }

  const isUploading = state.status === "uploading";

  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-600">
        {label}
      </label>

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
              <path fillRule="evenodd" d="M10 1a.75.75 0 0 1 .75.75v6.69l2.22-2.22a.75.75 0 0 1 1.06 1.06l-3.5 3.5a.75.75 0 0 1-1.06 0l-3.5-3.5a.75.75 0 0 1 1.06-1.06l2.22 2.22V1.75A.75.75 0 0 1 10 1ZM3 15.75a.75.75 0 0 1 .75-.75h12.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
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
              Uploading… {state.progress}%
            </p>
            <div className="mt-3 h-1.5 w-48 overflow-hidden rounded-full bg-sky-100">
              <div
                className="h-full rounded-full bg-[#0ea5e9] transition-all"
                style={{ width: `${state.progress}%` }}
              />
            </div>
          </>
        )}

        {state.status === "done" && (
          <>
            <svg viewBox="0 0 20 20" fill="currentColor" className="mx-auto h-8 w-8 text-emerald-500">
              <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
            </svg>
            <p className="mt-2 text-xs font-semibold text-emerald-700">Uploaded</p>
            <p className="mt-1 max-w-xs truncate font-mono text-[10px] text-emerald-600">
              {state.publicUrl}
            </p>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setState({ status: "idle" }); }}
              className="mt-2 text-[10px] text-slate-400 underline hover:text-slate-600"
            >
              Replace
            </button>
          </>
        )}

        {state.status === "error" && (
          <>
            <svg viewBox="0 0 20 20" fill="currentColor" className="mx-auto h-8 w-8 text-red-400">
              <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
            </svg>
            <p className="mt-2 text-xs font-semibold text-red-600">{state.message}</p>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setState({ status: "idle" }); }}
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
