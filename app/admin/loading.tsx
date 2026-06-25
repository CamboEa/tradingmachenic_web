export default function AdminLoading() {
 return (
 <div className="animate-pulse space-y-8">
 <div className="space-y-2">
 <div className="h-8 w-48 rounded-lg bg-bridge/40" />
 <div className="h-4 w-72 rounded bg-surface-soft" />
 </div>

 <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
 {Array.from({ length: 4 }).map((_, i) => (
 <div
 key={i}
 className="rounded-2xl border border-bridge/30 border-l-4 border-l-slate-200 bg-surface/88 p-5"
 >
 <div className="h-3 w-20 rounded bg-surface-soft" />
 <div className="mt-3 h-8 w-16 rounded bg-bridge/40" />
 </div>
 ))}
 </div>

 <div className="rounded-xl border border-bridge/40 bg-surface p-6">
 <div className="mb-6 h-5 w-40 rounded bg-bridge/40" />
 <div className="space-y-4">
 {Array.from({ length: 5 }).map((_, i) => (
 <div key={i} className="flex items-center gap-4 rounded-lg border border-bridge/30 p-4">
 <div className="h-7 w-7 shrink-0 rounded-full bg-bridge/40" />
 <div className="flex-1 space-y-2">
 <div className="h-4 w-1/3 rounded bg-bridge/40" />
 <div className="h-3 w-1/4 rounded bg-surface-soft" />
 </div>
 <div className="h-8 w-20 rounded-md bg-surface-soft" />
 </div>
 ))}
 </div>
 </div>
 </div>
 );
}
