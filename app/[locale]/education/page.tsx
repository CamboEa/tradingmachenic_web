import { notFound } from "next/navigation";

import { EducationLessonGrid } from "@/components/education-lesson-grid";
import { getAllLessons } from "@/lib/supabase/lessons";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

export default async function EducationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const [dict, lessons] = await Promise.all([
    getDictionary(locale),
    getAllLessons(),
  ]);

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden bg-[#1e293b] px-4 py-16 sm:px-6 lg:px-8">
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(212,175,55,0.18),transparent_24rem),radial-gradient(circle_at_86%_10%,rgba(14,165,233,0.2),transparent_26rem)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#d4af37]">
            {dict.nav.education}
          </p>
          <h1 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {dict.course.title}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
            {dict.course.intro}
          </p>
        </div>
      </section>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <EducationLessonGrid lessons={lessons} locale={locale} dict={dict} />
      </main>
    </div>
  );
}
