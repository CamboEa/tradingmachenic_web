export default function LocaleLoading() {
 return (
 <div className="flex flex-1 flex-col animate-pulse">
 {/* Ticker strip */}
 <div className="h-[47px] border-b border-slate-200/90 bg-slate-100/80" />

 {/* Header */}
 <div className="border-b border-white/60 bg-[#f8fafc]/82 px-4 py-3.5 lg:px-8">
 <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
 <div className="flex items-center gap-3">
 <div className="h-10 w-10 rounded-lg bg-slate-200" />
 <div className="space-y-2">
 <div className="h-5 w-36 rounded bg-slate-200" />
 <div className="hidden h-3 w-28 rounded bg-slate-100 lg:block" />
 </div>
 </div>
 <div className="hidden gap-3 sm:flex">
 <div className="h-9 w-16 rounded-lg bg-slate-100" />
 <div className="h-9 w-16 rounded-lg bg-slate-100" />
 <div className="h-9 w-16 rounded-lg bg-slate-100" />
 <div className="h-9 w-16 rounded-lg bg-slate-100" />
 </div>
 <div className="h-9 w-24 rounded-lg bg-slate-100" />
 </div>
 </div>

 {/* Page body */}
 <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
 <div className="max-w-3xl space-y-4">
 <div className="h-3 w-24 rounded bg-[#d4af37]/20" />
 <div className="h-10 w-full max-w-xl rounded-xl bg-slate-200" />
 <div className="h-5 w-full max-w-2xl rounded-lg bg-slate-100" />
 <div className="h-5 w-4/5 max-w-xl rounded-lg bg-slate-100" />
 </div>

 <div className="mt-14 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
 {Array.from({ length: 6 }).map((_, i) => (
 <div
 key={i}
 className="overflow-hidden rounded-[1.65rem] border border-white/80 bg-white/88"
 >
 <div className="aspect-[16/10] bg-slate-200" />
 <div className="space-y-3 p-5">
 <div className="h-5 w-3/4 rounded bg-slate-200" />
 <div className="h-4 w-full rounded bg-slate-100" />
 <div className="h-4 w-2/3 rounded bg-slate-100" />
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 );
}
