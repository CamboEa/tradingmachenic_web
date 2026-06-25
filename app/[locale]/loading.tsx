export default function LocaleLoading() {
    return (
        <div className="flex flex-1 flex-col animate-pulse">
            {/* Ticker strip */}
            <div className="h-[47px] border-b border-bridge/40 bg-surface-soft/80" />

            {/* Header */}
            <div className="border-b border-white/60 bg-background/82 px-4 py-3.5 lg:px-8">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-bridge/40" />
                        <div className="space-y-2">
                            <div className="h-5 w-36 rounded bg-bridge/40" />
                            <div className="hidden h-3 w-28 rounded bg-surface-soft lg:block" />
                        </div>
                    </div>
                    <div className="hidden gap-3 sm:flex">
                        <div className="h-9 w-16 rounded-lg bg-surface-soft" />
                        <div className="h-9 w-16 rounded-lg bg-surface-soft" />
                        <div className="h-9 w-16 rounded-lg bg-surface-soft" />
                        <div className="h-9 w-16 rounded-lg bg-surface-soft" />
                    </div>
                    <div className="h-9 w-24 rounded-lg bg-surface-soft" />
                </div>
            </div>

            {/* Page body */}
            <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
                <div className="max-w-3xl space-y-4">
                    <div className="h-3 w-24 rounded bg-[#629696]/20" />
                    <div className="h-10 w-full max-w-xl rounded-xl bg-bridge/40" />
                    <div className="h-5 w-full max-w-2xl rounded-lg bg-surface-soft" />
                    <div className="h-5 w-4/5 max-w-xl rounded-lg bg-surface-soft" />
                </div>

                <div className="mt-14 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className="overflow-hidden rounded-[1.65rem] border border-bridge/30 bg-surface/88"
                        >
                            <div className="aspect-[16/10] bg-bridge/40" />
                            <div className="space-y-3 p-5">
                                <div className="h-5 w-3/4 rounded bg-bridge/40" />
                                <div className="h-4 w-full rounded bg-surface-soft" />
                                <div className="h-4 w-2/3 rounded bg-surface-soft" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
