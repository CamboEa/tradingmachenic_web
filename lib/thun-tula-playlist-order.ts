/** Playlist lesson order for Thun Tula — matches YouTube @ThunTula-FT playlists. */
export const THUN_TULA_LESSON_SLUG_ORDER = [
  "thun-tula-ft-csnr-intro",
  "thun-tula-ft-csnr-entry-model",
  "thun-tula-ft-one-crt-model",
  "thun-tula-ft-2022-ict-mentorship",
  "thun-tula-ft-pd-array-ict-2022",
  "thun-tula-ft-2023-ict-mentorship",
  "thun-tula-ft-2023-lecture-series",
  "thun-tula-ft-ict-student-psychology",
  "thun-tula-ft-forex-rebate-account",
] as const;

export function thunTulaLessonOrderIndex(slug: string): number {
  const index = THUN_TULA_LESSON_SLUG_ORDER.indexOf(
    slug as (typeof THUN_TULA_LESSON_SLUG_ORDER)[number],
  );
  return index === -1 ? 999 : index;
}
