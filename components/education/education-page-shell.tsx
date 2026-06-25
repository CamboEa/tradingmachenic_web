export function EducationPageShell({
  children,
  wide = false,
}: {
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, color-mix(in oklab, var(--bridge) 35%, transparent) 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-gold/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-teal/5 blur-3xl"
      />

      <div
        className={`relative mx-auto py-8 sm:py-12 ${wide ? "w-full max-w-none px-4 sm:px-8 lg:px-12" : "max-w-6xl px-4 sm:px-6 lg:px-8"}`}
      >
        {children}
      </div>
    </div>
  );
}
