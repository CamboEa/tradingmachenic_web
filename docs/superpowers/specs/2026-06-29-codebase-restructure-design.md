# Codebase Restructure — Design

**Date:** 2026-06-29
**Branch:** `refactor/restructure-codebase`
**Status:** Implemented

## Goal

Tidy and reorganize the codebase for clarity and maintainability **within the
existing layer-based architecture** (`app/` for routes, `components/` for UI,
`lib/` for logic). No `features/` directory, no `src/` root, no architectural
rewrite. The work is: delete dead code, move misplaced UI out of `lib/`, and
group the loose `lib/` root files into domain folders.

## Non-Goals

- Do **not** introduce a `features/`, `modules/`, or `src/` directory.
- Do **not** move `app/admin/` under `[locale]`. Admin is intentionally
  non-localized; `middleware.ts:144` handles admin auth/redirects separately.
- Do **not** reorganize `components/` — it is already cleanly organized by
  feature (`auth/`, `blog/`, `education/`, `ui/`, `shared/`, …). The only change
  is two files arriving from `lib/` (Section 2).
- Do **not** reorganize the existing `lib/` subfolders (`supabase/`,
  `security/`, `r2/`, `ui/`, `tools/`). `lib/supabase/` remains the data-access
  layer organized by data source.
- No broad renaming or case-convention changes: files are already consistent
  kebab-case. The only renames are the targeted prefix-drops in Section 3 (e.g.
  `education-categories.ts` → `education/categories.ts`).

## Current State (observations)

- **Dead/empty route directories** under `app/[locale]/(main)/education/`:
  `crypto/`, `forex/`, `stock/`, `siac/`, `[category]/` (each with an empty
  `[mentorSlug]/`), plus a stray `.qodo/`. Education categories are now served
  dynamically through `education/[slug]/`. Also an empty `(main)/gate/` (the
  real gate lives at `(gate)/gate/`).
- **UI code in the data layer:** `lib/education-category-page.tsx` and
  `lib/education-mentor-page.tsx` return JSX (they are page components) but live
  in `lib/`.
- **21 loose files at the `lib/` root** mixed alongside clean subfolders,
  making the domain logic hard to navigate.

## Design

### Section 1 — Delete dead code & cruft (zero functional impact)

Delete these empty directories (verify each has no files first):

- `app/[locale]/(main)/education/crypto/` (+ `[mentorSlug]/`)
- `app/[locale]/(main)/education/forex/` (+ `[mentorSlug]/`)
- `app/[locale]/(main)/education/stock/` (+ `[mentorSlug]/`)
- `app/[locale]/(main)/education/siac/` (+ `[mentorSlug]/`)
- `app/[locale]/(main)/education/[category]/` (+ `[mentorSlug]/`)
- `app/[locale]/(main)/education/.qodo/`
- `app/[locale]/(main)/gate/`

### Section 2 — Move UI out of `lib/`

| From | To |
|------|----|
| `lib/education-category-page.tsx` | `components/education/education-category-page.tsx` |
| `lib/education-mentor-page.tsx` | `components/education/education-mentor-page.tsx` |

Exports affected: `renderCategoryPage`, `renderEducationMentorPage`,
`renderEducationMentorTopicPage`. Consumed by 3 route files under
`app/[locale]/(main)/education/`:

- `education/[slug]/page.tsx`
- `education/[slug]/[mentorSlug]/page.tsx`
- `education/[slug]/[mentorSlug]/[topicSlug]/page.tsx`

Update those 3 imports from `@/lib/...` to `@/components/education/...`. If
these files import server-only data helpers, they remain server components in
their new location — the move is still correct.

### Section 3 — Group `lib/` by domain

Drop redundant prefixes when moving into a domain folder (the folder conveys the
domain).

```
lib/
├── education/          ← new
│   ├── categories.ts            (was education-categories.ts)
│   ├── category-meta.ts         (was education-category-meta.ts)
│   ├── category-theme.ts        (was education-category-theme.ts)
│   ├── mentors.ts
│   ├── course.ts
│   ├── lessons-sort.ts
│   ├── lesson-topic-slug.ts
│   ├── admin-lessons-nav.ts
│   └── thun-tula-playlist-order.ts
├── curriculum/         ← new
│   ├── curriculum.ts
│   └── seed-source.ts           (was curriculum-seed-source.ts)
├── blog/               ← new
│   ├── content.ts               (was blog-content.ts)
│   └── content-sanitize.ts      (was blog-content-sanitize.ts)
├── media/              ← new
│   ├── video.ts
│   ├── youtube.ts
│   └── youtube.test.ts
│
│   # cross-cutting primitives stay at root:
├── i18n.ts
├── brand.ts
├── cache-tags.ts
├── slug.ts
├── slug.test.ts
│
│   # existing folders, untouched:
├── supabase/   security/   r2/   ui/   tools/
```

Every `@/lib/...` import referencing a moved file is rewritten. The
`package.json` `test:youtube` script path is updated to
`lib/media/youtube.test.ts`. The `test:slug` script is unchanged (`slug.test.ts`
stays at root).

### Section 4 — Execution safety & verification

- Use `git mv` for moves so history/renames are preserved.
- Update imports by searching every `@/lib/...` reference to a moved file and
  rewriting it — including non-obvious consumers: `middleware.ts`, route files,
  `scripts/`, and `package.json`.
- Verify after each domain group (not all at once):
  1. `npx tsc --noEmit` — a broken/missed import is a compile error, so a clean
     run proves no reference was missed (primary safety net).
  2. `npm run lint`
  3. `npm run build`
- Commit incrementally — one commit per section, and one per `lib/` domain group
  — so any step is independently revertable and reviewable.

## Verification / Success Criteria

- `npx tsc --noEmit` passes with zero errors.
- `npm run lint` passes.
- `npm run build` succeeds.
- `npm run test:youtube` and `npm run test:slug` pass.
- No file remains in `lib/` root except the 5 cross-cutting primitives and the
  existing subfolders.
- No empty/dead directories remain under `app/`.
- App routes behave identically (no route added or removed beyond dead-folder
  deletion).

## Risks & Mitigations

- **Missed import after a move** → caught by `npx tsc --noEmit`; verify per group.
- **Dynamic/string-built import paths** (not statically analyzable) → grep for
  the old base filenames across the repo, not just `@/lib/...` specifiers.
- **Large diff hard to review** → incremental commits per section/group.
