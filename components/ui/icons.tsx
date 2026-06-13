/** Small shared SVG icons (Heroicons-style) for admin chrome and table actions. */

export function TrashIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden>
      <path
        fillRule="evenodd"
        d="M8.75 1a1 1 0 0 0-.95.68L7.4 3H4a1 1 0 0 0 0 2v9.5A2.5 2.5 0 0 0 6.5 17h7a2.5 2.5 0 0 0 2.5-2.5V5a1 1 0 1 0 0-2h-3.4l-.4-1.32A1 1 0 0 0 11.25 1h-2.5ZM8 7a.75.75 0 0 1 .75.75v5a.75.75 0 0 1-1.5 0v-5A.75.75 0 0 1 8 7Zm4 0a.75.75 0 0 1 .75.75v5a.75.75 0 0 1-1.5 0v-5A.75.75 0 0 1 12 7Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function SpinnerIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cnSpin(className)} aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" className="opacity-25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function cnSpin(className: string) {
  return className.includes("animate-spin") ? className : `${className} animate-spin`;
}
