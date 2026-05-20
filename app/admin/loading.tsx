export default function AdminLoading() {
 return (
 <div className="animate-pulse space-y-8">
 <div className="space-y-2">
 <div className="h-8 w-48 rounded-lg bg-slate-200" />
 <div className="h-4 w-72 rounded bg-slate-100" />
 </div>

 <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
 {Array.from({ length: 4 }).map((_, i) => (
 <div
 key={i}
 className="rounded-2xl border border-white/80 border-l-4 border-l-slate-200 bg-white/88 p-5"
 >
 <div className="h-3 w-20 rounded bg-slate-100" />
 <div className="mt-3 h-8 w-16 rounded bg-slate-200" />
 </div>
 ))}
 </div>

 <div className="rounded-xl border border-slate-200 bg-white p-6">
 <div className="mb-6 h-5 w-40 rounded bg-slate-200" />
 <div className="space-y-4">
 {Array.from({ length: 5 }).map((_, i) => (
 <div key={i} className="flex items-center gap-4 rounded-lg border border-slate-100 p-4">
 <div className="h-7 w-7 shrink-0 rounded-full bg-slate-200" />
 <div className="flex-1 space-y-2">
 <div className="h-4 w-1/3 rounded bg-slate-200" />
 <div className="h-3 w-1/4 rounded bg-slate-100" />
 </div>
 <div className="h-8 w-20 rounded-md bg-slate-100" />
 </div>
 ))}
 </div>
 </div>
 </div>
 );
}
