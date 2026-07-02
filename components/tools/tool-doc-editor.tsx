"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EditorContent, NodeViewWrapper, ReactNodeViewRenderer, useEditor, type NodeViewProps } from "@tiptap/react";
// NodeViewProps used by ResizableImageNodeView
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import ImageExtension from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import { Extension, Node, mergeAttributes } from "@tiptap/core";
import { toast } from "react-toastify";

/* ── Resizable video embed node ──────────────────────────────────────── */

function ResizableVideoNodeView({ node, updateAttributes, selected }: NodeViewProps) {
  const startX    = useRef(0);
  const startW    = useRef(0);
  const wrapRef   = useRef<HTMLDivElement>(null);
  const [resizing, setResizing] = useState(false);

  function onHandleMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    startX.current = e.clientX;
    startW.current = wrapRef.current?.offsetWidth ?? (node.attrs.width as number | null) ?? 640;
    setResizing(true);

    function onMove(ev: MouseEvent) {
      const newW = Math.max(200, startW.current + (ev.clientX - startX.current));
      updateAttributes({ width: Math.round(newW) });
    }
    function onUp() {
      setResizing(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  const w     = node.attrs.width as number | null;
  const align = (node.attrs.align as string | null) ?? "left";

  const wrapperAlign =
    align === "center" ? "justify-center" :
    align === "right"  ? "justify-end"    :
                         "justify-start";

  return (
    <NodeViewWrapper className={`flex ${wrapperAlign} my-3`}>
      <div
        ref={wrapRef}
        className="group relative"
        style={{ width: w ? `${w}px` : "100%", maxWidth: "100%" }}
        contentEditable={false}
      >
        {/* 16:9 iframe container */}
        <div className="relative overflow-hidden rounded-xl border border-bridge/40 bg-surface-soft" style={{ paddingTop: "56.25%" }}>
          <iframe
            src={String(node.attrs.src ?? "")}
            className="absolute inset-0 h-full w-full border-0"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            title="Embedded video"
          />
          {/* Transparent overlay blocks iframe from stealing mouse events during resize */}
          {resizing && <div className="absolute inset-0 z-10 cursor-ew-resize" />}
        </div>

        {/* Selection border */}
        {selected && (
          <div className="pointer-events-none absolute inset-0 rounded-xl border-2 border-gold" />
        )}

        {/* Floating alignment toolbar */}
        {selected && (
          <div className="absolute -top-10 left-1/2 z-20 flex -translate-x-1/2 items-center gap-0.5 rounded-lg border border-bridge/40 bg-surface px-1.5 py-1 shadow-lg">
            {(["left", "center", "right"] as const).map((dir) => (
              <button
                key={dir}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); updateAttributes({ align: dir }); }}
                className={[
                  "cursor-pointer rounded px-2 py-1 text-xs font-semibold transition",
                  (node.attrs.align ?? "left") === dir ? "bg-teal text-white" : "text-ink-soft hover:bg-surface-soft hover:text-foreground",
                ].join(" ")}
              >
                {dir === "left" ? "≡L" : dir === "center" ? "≡C" : "≡R"}
              </button>
            ))}
            <span className="mx-1 h-4 w-px bg-bridge/40" />
            <span className="text-[10px] text-slate-400 pr-1">align</span>
          </div>
        )}

        {/* Corner dots */}
        {(["tl","tr","bl","br"] as const).map((c) => (
          <div
            key={c}
            className={[
              "absolute h-3 w-3 rounded-full border-2 border-gold bg-surface opacity-0 transition-opacity group-hover:opacity-100",
              selected ? "opacity-100!" : "",
              c === "tl" ? "-left-1.5 -top-1.5 cursor-nw-resize" : "",
              c === "tr" ? "-right-1.5 -top-1.5 cursor-ne-resize" : "",
              c === "bl" ? "-bottom-1.5 -left-1.5 cursor-sw-resize" : "",
              c === "br" ? "-bottom-1.5 -right-1.5 cursor-se-resize" : "",
            ].join(" ")}
            onMouseDown={c === "br" || c === "tr" ? onHandleMouseDown : undefined}
          />
        ))}

        {/* Right-edge drag handle */}
        <div
          onMouseDown={onHandleMouseDown}
          className="absolute right-0 top-1/2 h-12 w-2.5 -translate-y-1/2 translate-x-1/2 cursor-ew-resize rounded-full bg-teal/70 opacity-0 transition-opacity group-hover:opacity-100"
        />
      </div>
    </NodeViewWrapper>
  );
}

const VideoEmbed = Node.create({
  name: "videoEmbed",
  group: "block",
  atom: true,
  draggable: true,
  addAttributes() {
    return {
      src:   { default: "" },
      width: {
        default: null,
        parseHTML: (el) => el.getAttribute("data-width"),
        renderHTML: (attrs) => attrs.width ? { "data-width": attrs.width, style: `width:${attrs.width}px;max-width:100%` } : {},
      },
      align: {
        default: "left",
        parseHTML: (el) => el.getAttribute("data-align") ?? "left",
        renderHTML: (attrs) => ({ "data-align": attrs.align ?? "left" }),
      },
    };
  },
  parseHTML() {
    return [{ tag: "div[data-video-embed]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes({ "data-video-embed": "", class: "tool-video-embed" }),
      [
        "iframe",
        mergeAttributes({
          src: HTMLAttributes.src as string,
          frameborder: "0",
          allowfullscreen: "true",
          allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
        }),
      ],
    ];
  },
  addNodeView() {
    return ReactNodeViewRenderer(ResizableVideoNodeView);
  },
});

/* ── Khmer hint global attribute ─────────────────────────────────────── */
// Adds data-km-hint to paragraphs, headings, list items, and blockquotes.
// The CSS in globals.css shows it as a ::before placeholder when the node is empty.
const KhmerHint = Extension.create({
  name: "khmerHint",
  addGlobalAttributes() {
    return [
      {
        types: ["paragraph", "heading", "listItem", "blockquote"],
        attributes: {
          "data-km-hint": {
            default: null,
            parseHTML: (el) => el.getAttribute("data-km-hint") ?? null,
            renderHTML: (attrs) =>
              attrs["data-km-hint"] ? { "data-km-hint": attrs["data-km-hint"] } : {},
          },
        },
      },
    ];
  },
});

/* ── Resizable image node ────────────────────────────────────────────── */

function ResizableImageNodeView({ node, updateAttributes, selected }: NodeViewProps) {
  const startX = useRef(0);
  const startW = useRef(0);
  const imgRef = useRef<HTMLImageElement>(null);

  function onHandleMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    startX.current = e.clientX;
    startW.current = imgRef.current?.offsetWidth ?? (node.attrs.width as number | null) ?? 400;

    function onMove(ev: MouseEvent) {
      const newW = Math.max(80, startW.current + (ev.clientX - startX.current));
      updateAttributes({ width: Math.round(newW) });
    }
    function onUp() {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  const w     = node.attrs.width as number | null;
  const align = (node.attrs.align as string | null) ?? "left";

  const wrapperAlign =
    align === "center" ? "justify-center" :
    align === "right"  ? "justify-end"    :
                         "justify-start";

  return (
    <NodeViewWrapper className={`flex ${wrapperAlign} my-2`}>
      <div
        className="group relative inline-block"
        style={{ width: w ? `${w}px` : "auto", maxWidth: "100%" }}
      >
        {/* Tiptap requires a native image node so its NodeView can own the DOM element. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={node.attrs.src as string}
          alt={(node.attrs.alt as string) ?? ""}
          draggable={false}
          className="block w-full rounded-lg border border-bridge/40"
        />

        {/* Selection border */}
        {selected && (
          <div className="pointer-events-none absolute inset-0 rounded-lg border-2 border-gold" />
        )}

        {/* Floating alignment toolbar — appears on selection */}
        {selected && (
          <div className="absolute -top-10 left-1/2 z-20 flex -translate-x-1/2 items-center gap-0.5 rounded-lg border border-bridge/40 bg-surface px-1.5 py-1 shadow-lg">
            {(["left", "center", "right"] as const).map((dir) => (
              <button
                key={dir}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); updateAttributes({ align: dir }); }}
                className={[
                  "cursor-pointer rounded px-2 py-1 text-xs font-semibold transition",
                  align === dir ? "bg-teal text-white" : "text-ink-soft hover:bg-surface-soft hover:text-foreground",
                ].join(" ")}
              >
                {dir === "left" ? "≡L" : dir === "center" ? "≡C" : "≡R"}
              </button>
            ))}
            <span className="mx-1 h-4 w-px bg-bridge/40" />
            <span className="text-[10px] text-slate-400 pr-1">align</span>
          </div>
        )}

        {/* Corner handles */}
        {(["tl", "tr", "bl", "br"] as const).map((corner) => (
          <div
            key={corner}
            className={[
              "absolute h-3 w-3 rounded-full border-2 border-gold bg-surface opacity-0 transition-opacity group-hover:opacity-100",
              selected ? "opacity-100!" : "",
              corner === "tl" ? "-left-1.5 -top-1.5 cursor-nw-resize" : "",
              corner === "tr" ? "-right-1.5 -top-1.5 cursor-ne-resize" : "",
              corner === "bl" ? "-bottom-1.5 -left-1.5 cursor-sw-resize" : "",
              corner === "br" ? "-bottom-1.5 -right-1.5 cursor-se-resize" : "",
            ].join(" ")}
            onMouseDown={corner === "br" || corner === "tr" ? onHandleMouseDown : undefined}
          />
        ))}

        {/* Right-edge drag handle */}
        <div
          onMouseDown={onHandleMouseDown}
          className="absolute right-0 top-1/2 h-10 w-2.5 -translate-y-1/2 translate-x-1/2 cursor-ew-resize rounded-full bg-teal/70 opacity-0 transition-opacity group-hover:opacity-100"
        />
      </div>
    </NodeViewWrapper>
  );
}

const ResizableImage = ImageExtension.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (el) => el.getAttribute("width"),
        renderHTML: (attrs) => (attrs.width ? { width: attrs.width, style: `width:${attrs.width}px;max-width:100%` } : {}),
      },
      align: {
        default: "left",
        parseHTML: (el) => el.getAttribute("data-align") ?? "left",
        renderHTML: (attrs) => ({ "data-align": attrs.align ?? "left" }),
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageNodeView);
  },
});

/* ── Helpers ─────────────────────────────────────────────────────────── */

function toEmbedUrl(url: string): string {
  const yt = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/,
  );
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  return url;
}

async function uploadImageToR2(file: File, folder: string): Promise<string> {
  const res = await fetch("/api/r2/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bucketName: "trading-tool",
      filename: file.name,
      contentType: file.type || "image/png",
      sizeBytes: file.size,
      folder,
    }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? "Upload failed");
  }
  const { presignedUrl, publicUrl } = (await res.json()) as {
    presignedUrl: string;
    publicUrl: string;
  };
  const put = await fetch(presignedUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type || "image/png" },
  });
  if (!put.ok) throw new Error("Upload failed");
  return publicUrl;
}

/* ── Toolbar primitives ──────────────────────────────────────────────── */

function Btn({
  label,
  title,
  active,
  disabled,
  onClick,
}: {
  label: string;
  title: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={[
        "min-w-7 rounded px-1.5 py-1 text-[12px] font-semibold leading-none transition select-none",
        active
          ? "bg-teal text-white shadow-sm"
          : "text-ink-muted hover:bg-surface-soft hover:text-foreground",
        disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function Sep() {
  return <span className="mx-0.5 h-5 w-px shrink-0 bg-bridge/40" aria-hidden />;
}

/* ── Main component ──────────────────────────────────────────────────── */

export function ToolDocEditor({
  value,
  onChange,
  placeholder = "Start writing…",
  getKeyPrefix,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  getKeyPrefix?: () => string;
}) {
  const [showImageMenu, setShowImageMenu] = useState(false);
  const [showImageUrl, setShowImageUrl] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dropUploading, setDropUploading] = useState(0); // count of in-progress drop/paste uploads
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageMenuRef = useRef<HTMLDivElement>(null);

  // Stable ref so async callbacks always get the live editor, even after re-renders
  const editorRef = useRef<ReturnType<typeof useEditor>>(null);
  // Track mount state so we never call setState or editor methods after unmount
  const mountedRef = useRef(true);
  useEffect(() => () => { mountedRef.current = false; }, []);

  // Helper: safely insert an image after an async upload completes
  // Keep editorRef in sync so async callbacks always use the live editor
  const editor = useEditor({
    immediatelyRender: true,
    shouldRerenderOnTransaction: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        code: false,
        codeBlock: false,
        strike: {},
        link: false,      // StarterKit v3 bundles these — disable to avoid
        underline: false, // "Duplicate extension" warnings
      }),
      Placeholder.configure({ placeholder }),
      ResizableImage.configure({ inline: false, allowBase64: false }),
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "tool-doc-link" } }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      VideoEmbed,
      KhmerHint,
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: "tool-doc-prose outline-none min-h-[520px] px-5 py-4 text-[14px] leading-[1.85] text-ink-muted",
      },
    },
    onUpdate: ({ editor: ed }) => {
      try { onChange(ed.getHTML()); } catch { /* editor disposing */ }
    },
  });

  // Keep stable ref in sync with the live editor instance
  useEffect(() => { editorRef.current = editor; }, [editor]);

  // ── Native drop/paste listeners — more reliable than editorProps in Tiptap v3 ──
  useEffect(() => {
    const dom = editor?.view?.dom;
    if (!dom) return;

    async function uploadFiles(files: File[], label: (f: File) => string) {
      if (files.length === 0) return;
      const folder = (getKeyPrefix?.() ?? "tool-content") + "/images";
      if (mountedRef.current) setDropUploading(n => n + files.length);
      await Promise.all(files.map(async (file) => {
        try {
          const url = await uploadImageToR2(file, folder);
          safeInsertImage(url, label(file));
          if (mountedRef.current) toast.success("Image uploaded");
        } catch (err) {
          if (mountedRef.current) toast.error(err instanceof Error ? err.message : "Upload failed");
        } finally {
          if (mountedRef.current) setDropUploading(n => Math.max(0, n - 1));
        }
      }));
    }

    function onDrop(e: DragEvent) {
      const files = [...(e.dataTransfer?.files ?? [])].filter(f => f.type.startsWith("image/"));
      if (files.length === 0) return;
      e.preventDefault();
      e.stopPropagation();
      uploadFiles(files, f => f.name);
    }

    function onPaste(e: ClipboardEvent) {
      // 1. Image files from clipboard (e.g. screenshot via Ctrl+V)
      const fileItems = [...(e.clipboardData?.items ?? [])].filter(i => i.type.startsWith("image/"));
      if (fileItems.length > 0) {
        // getAsFile() MUST be called synchronously before event ends
        const files = fileItems.map(i => i.getAsFile()).filter(Boolean) as File[];
        if (files.length > 0) {
          e.preventDefault();
          e.stopPropagation();
          uploadFiles(files, () => "pasted image");
          return;
        }
      }

      // 2. Pasted text that looks like an image URL
      const text = (e.clipboardData?.getData("text/plain") ?? "").trim();
      if (/^https?:\/\/.+\.(png|jpe?g|gif|webp|svg|avif)(\?.*)?$/i.test(text)) {
        e.preventDefault();
        e.stopPropagation();
        safeInsertImage(text, "image");
      }
    }

    dom.addEventListener("drop",  onDrop  as EventListener);
    dom.addEventListener("paste", onPaste as EventListener);
    return () => {
      dom.removeEventListener("drop",  onDrop  as EventListener);
      dom.removeEventListener("paste", onPaste as EventListener);
    };
  }, [editor, getKeyPrefix]);

  // Safe image insert — uses ref so it works even if component re-rendered
  function safeInsertImage(src: string, alt: string) {
    const ed = editorRef.current;
    if (!ed || !mountedRef.current) return;
    try { ed.chain().focus().setImage({ src, alt }).run(); } catch { /* editor disposed */ }
  }

  /* Toolbar image upload (via file picker) */
  const handleFileSelected = useCallback(
    async (file: File) => {
      setUploading(true);
      setShowImageMenu(false);
      try {
        const folder = (getKeyPrefix?.() || "tool-content") + "/images";
        const url = await uploadImageToR2(file, folder);
        safeInsertImage(url, file.name);
        toast.success("Image uploaded");
      } catch (err) {
        if (mountedRef.current) toast.error(err instanceof Error ? err.message : "Upload failed");
      } finally {
        if (mountedRef.current) setUploading(false);
      }
    },
    [getKeyPrefix],
  );

  const handleImageUrl = useCallback(() => {
    if (!imageUrl.trim()) return;
    safeInsertImage(imageUrl.trim(), "image");
    setImageUrl("");
    setShowImageUrl(false);
    setShowImageMenu(false);
  }, [imageUrl]);

  /* Video embed */
  const handleVideoEmbed = useCallback(() => {
    if (!editor || !videoUrl.trim()) return;
    const embedSrc = toEmbedUrl(videoUrl.trim());
    editor
      .chain()
      .focus()
      .insertContent({ type: "videoEmbed", attrs: { src: embedSrc } })
      .run();
    setVideoUrl("");
    setShowVideoModal(false);
  }, [editor, videoUrl]);

  /* Link */
  const handleSetLink = useCallback(() => {
    if (!editor) return;
    if (!linkUrl.trim()) {
      editor?.chain().focus().unsetLink().run();
    } else {
      editor?.chain().focus().setLink({ href: linkUrl.trim() }).run();
    }
    setLinkUrl("");
    setShowLinkModal(false);
  }, [editor, linkUrl]);

  if (!editor) {
    return <div className="h-75 animate-pulse rounded-xl border border-bridge/40 bg-surface-soft" />;
  }

  const headingLevel =
    editor?.isActive("heading", { level: 1 })
      ? "1"
      : editor?.isActive("heading", { level: 2 })
        ? "2"
        : editor?.isActive("heading", { level: 3 })
          ? "3"
          : "p";

  return (
    <div className="overflow-hidden rounded-xl border border-bridge/40 bg-surface shadow-sm">
      {/* ── Toolbar ── */}
      <div
        role="toolbar"
        aria-label="Document formatting"
        className="flex flex-wrap items-center gap-0.5 border-b border-bridge/30 bg-surface-soft/80 px-2 py-2"
      >
        {/* Heading picker */}
        <select
          value={headingLevel}
          onChange={(e) => {
            const v = e.target.value;
            if (v === "p") editor?.chain().focus().setParagraph().run();
            else editor?.chain().focus().toggleHeading({ level: Number(v) as 1|2|3 }).run();
          }}
          className="cursor-pointer rounded border border-bridge/40 bg-surface px-2 py-1 text-[12px] font-semibold text-ink-muted outline-none focus:border-gold"
        >
          <option value="p">Normal</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
        </select>

        <Sep />

        {/* Text formatting */}
        <Btn label="B" title="Bold (⌘B)" active={editor?.isActive("bold")} onClick={() => editor?.chain().focus().toggleBold().run()} />
        <Btn label="I" title="Italic (⌘I)" active={editor?.isActive("italic")} onClick={() => editor?.chain().focus().toggleItalic().run()} />
        <Btn label="U" title="Underline (⌘U)" active={editor?.isActive("underline")} onClick={() => editor?.chain().focus().toggleUnderline().run()} />
        <Btn label="S" title="Strikethrough" active={editor?.isActive("strike")} onClick={() => editor?.chain().focus().toggleStrike().run()} />

        <Sep />

        {/* Alignment */}
        {/* Alignment — auto-detects text / image / video from current selection */}
        {(["left", "center", "right"] as const).map((dir) => {
          const label = dir === "left" ? "≡L" : dir === "center" ? "≡C" : "≡R";

          // Directly read the selected node from ProseMirror state (more reliable than isActive)
          type SelWithNode = { node?: { type: { name: string }; attrs: Record<string, unknown> } };
          const selNode  = (editor?.state.selection as SelWithNode).node;
          const nodeName = selNode?.type.name ?? null;
          const onImg    = nodeName === "image";
          const onVideo  = nodeName === "videoEmbed";
          const onMedia  = onImg || onVideo;

          const mediaAlign = (selNode?.attrs?.align as string | undefined) ?? "left";
          const isActive   = onMedia
            ? mediaAlign === dir
            : editor?.isActive({ textAlign: dir });

          return (
            <Btn
              key={dir}
              label={label}
              title={`Align ${dir}`}
              active={isActive}
              onClick={() => {
                if (onImg)        editor?.chain().focus().updateAttributes("image",      { align: dir }).run();
                else if (onVideo) editor?.chain().focus().updateAttributes("videoEmbed", { align: dir }).run();
                else              editor?.chain().focus().setTextAlign(dir).run();
              }}
            />
          );
        })}

        <Sep />

        {/* Lists */}
        <Btn label="• List" title="Bullet list" active={editor?.isActive("bulletList")} onClick={() => editor?.chain().focus().toggleBulletList().run()} />
        <Btn label="1. List" title="Numbered list" active={editor?.isActive("orderedList")} onClick={() => editor?.chain().focus().toggleOrderedList().run()} />

        <Sep />

        {/* Block elements */}
        <Btn label='" Quote' title="Block quote" active={editor?.isActive("blockquote")} onClick={() => editor?.chain().focus().toggleBlockquote().run()} />
        <Btn label="── Rule" title="Horizontal rule" active={false} onClick={() => editor?.chain().focus().setHorizontalRule().run()} />

        <Sep />

        {/* Link */}
        <Btn
          label="🔗 Link"
          title="Insert link"
          active={editor?.isActive("link")}
          onClick={() => {
            const prev = editor?.getAttributes("link").href as string ?? "";
            setLinkUrl(prev);
            setShowLinkModal(true);
          }}
        />

        <Sep />

        {/* Image dropdown */}
        <div className="relative" ref={imageMenuRef}>
          <Btn
            label={uploading ? "↑ Uploading…" : "🖼 Image ▾"}
            title="Insert image"
            active={showImageMenu}
            disabled={uploading}
            onClick={() => { setShowImageMenu((v) => !v); setShowImageUrl(false); }}
          />
          {showImageMenu && (
            <div className="absolute left-0 top-full z-30 mt-1 w-52 overflow-hidden rounded-xl border border-bridge/40 bg-surface shadow-lg shadow-black/30">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-3 text-left text-sm text-ink-muted hover:bg-surface-soft"
              >
                <span>📁</span> Upload from device
              </button>
              <button
                type="button"
                onClick={() => setShowImageUrl((v) => !v)}
                className="flex w-full cursor-pointer items-center gap-2.5 border-t border-bridge/30 px-4 py-3 text-left text-sm text-ink-muted hover:bg-surface-soft"
              >
                <span>🔗</span> Paste image URL
              </button>
              {showImageUrl && (
                <div className="border-t border-bridge/30 p-3">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-lg border border-bridge/40 px-3 py-2 text-xs outline-none focus:border-gold"
                    onKeyDown={(e) => e.key === "Enter" && handleImageUrl()}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleImageUrl}
                    className="mt-2 w-full cursor-pointer rounded-lg bg-teal py-1.5 text-xs font-semibold text-white hover:brightness-110"
                  >
                    Insert
                  </button>
                </div>
              )}
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelected(file);
              e.target.value = "";
            }}
          />
        </div>

        {/* Video embed */}
        <Btn
          label="▶ Video"
          title="Embed video"
          active={false}
          onClick={() => setShowVideoModal(true)}
        />

        <Sep />

        {/* Undo / Redo */}
        <Btn label="↩" title="Undo (⌘Z)" disabled={!editor?.can().undo()} onClick={() => editor?.chain().focus().undo().run()} />
        <Btn label="↪" title="Redo (⌘⇧Z)" disabled={!editor?.can().redo()} onClick={() => editor?.chain().focus().redo().run()} />
      </div>

      {/* ── Editor area ── */}
      {/* Editor area — with drop-upload loading overlay */}
      <div className="relative">
        <EditorContent editor={editor} className="tool-rich-editor" />
        {dropUploading > 0 && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 rounded-b-xl bg-surface/85 backdrop-blur-sm">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-bridge/40 border-t-[#22332E]" />
            <p className="text-sm font-semibold text-foreground">
              Uploading {dropUploading === 1 ? "image" : `${dropUploading} images`}…
            </p>
          </div>
        )}
      </div>

      {/* ── Link modal ── */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-2xl">
            <h3 className="text-base font-bold text-foreground">Insert link</h3>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://..."
              autoFocus
              className="mt-3 w-full rounded-xl border border-bridge/40 px-4 py-2.5 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-teal/20"
              onKeyDown={(e) => e.key === "Enter" && handleSetLink()}
            />
            <div className="mt-4 flex justify-end gap-2">
              {editor?.isActive("link") && (
                <button
                  type="button"
                  onClick={() => { editor?.chain().focus().unsetLink().run(); setShowLinkModal(false); }}
                  className="cursor-pointer rounded-lg border border-bridge/40 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/10"
                >
                  Remove
                </button>
              )}
              <button type="button" onClick={() => setShowLinkModal(false)} className="cursor-pointer rounded-lg border border-bridge/40 px-4 py-2 text-sm font-semibold text-ink-muted hover:bg-surface-soft">
                Cancel
              </button>
              <button type="button" onClick={handleSetLink} className="cursor-pointer rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-white hover:brightness-110">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Video modal ── */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-2xl">
            <h3 className="text-base font-bold text-foreground">Embed video</h3>
            <p className="mt-1 text-xs text-ink-soft">YouTube, Vimeo, or direct MP4 URL</p>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              autoFocus
              className="mt-3 w-full rounded-xl border border-bridge/40 px-4 py-2.5 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-teal/20"
              onKeyDown={(e) => e.key === "Enter" && handleVideoEmbed()}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => { setShowVideoModal(false); setVideoUrl(""); }} className="cursor-pointer rounded-lg border border-bridge/40 px-4 py-2 text-sm font-semibold text-ink-muted hover:bg-surface-soft">
                Cancel
              </button>
              <button type="button" onClick={handleVideoEmbed} disabled={!videoUrl.trim()} className="cursor-pointer rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-50">
                Embed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
