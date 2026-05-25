"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import { blogBodyForEditor } from "@/lib/blog-content";

type ToolbarAction = {
  label: string;
  title: string;
  isActive: () => boolean;
  run: () => void;
  disabled?: () => boolean;
};

function ToolbarButton({
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
        "min-w-[2rem] rounded-md px-2 py-1.5 text-xs font-semibold transition",
        active
          ? "bg-[#0ea5e9] text-white shadow-sm"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
        disabled ? "cursor-not-allowed opacity-40" : "",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function ToolbarDivider() {
  return <span className="mx-0.5 h-6 w-px bg-slate-200" aria-hidden />;
}

export function BlogRichTextEditor({
  value,
  onChange,
  placeholder = "Start writing your article…",
  minHeightClass = "min-h-[22rem]",
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeightClass?: string;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: blogBodyForEditor(value),
    editorProps: {
      attributes: {
        class: `blog-editor-prose outline-none ${minHeightClass} px-5 py-4 text-[15px] leading-[1.75] text-slate-700`,
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  });

  if (!editor) {
    return (
      <div
        className={`rounded-lg border border-slate-200 bg-white ${minHeightClass} animate-pulse`}
      />
    );
  }

  const actions: ToolbarAction[] = [
    {
      label: "B",
      title: "Bold",
      isActive: () => editor.isActive("bold"),
      run: () => editor.chain().focus().toggleBold().run(),
    },
    {
      label: "I",
      title: "Italic",
      isActive: () => editor.isActive("italic"),
      run: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      label: "H2",
      title: "Section heading",
      isActive: () => editor.isActive("heading", { level: 2 }),
      run: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      label: "H3",
      title: "Subheading",
      isActive: () => editor.isActive("heading", { level: 3 }),
      run: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      label: "• List",
      title: "Bullet list",
      isActive: () => editor.isActive("bulletList"),
      run: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      label: "1. List",
      title: "Numbered list",
      isActive: () => editor.isActive("orderedList"),
      run: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      label: "Quote",
      title: "Block quote",
      isActive: () => editor.isActive("blockquote"),
      run: () => editor.chain().focus().toggleBlockquote().run(),
    },
  ];

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div
        className="flex flex-wrap items-center gap-0.5 border-b border-slate-100 bg-slate-50/80 px-2 py-2"
        role="toolbar"
        aria-label="Formatting"
      >
        {actions.map((action, index) => (
          <span key={action.title} className="contents">
            {index === 2 || index === 4 ? <ToolbarDivider /> : null}
            <ToolbarButton
              label={action.label}
              title={action.title}
              active={action.isActive()}
              disabled={action.disabled?.()}
              onClick={action.run}
            />
          </span>
        ))}
        <ToolbarDivider />
        <ToolbarButton
          label="Undo"
          title="Undo"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        />
        <ToolbarButton
          label="Redo"
          title="Redo"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        />
      </div>
      <EditorContent editor={editor} className="blog-rich-text-editor" />
    </div>
  );
}
