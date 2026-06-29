# Codebase Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tidy the codebase within its existing layer-based architecture — delete dead route folders, move two UI files out of `lib/`, and group the loose `lib/` root files into domain folders (`education/`, `curriculum/`, `blog/`, `media/`).

**Architecture:** Pure structural refactor, no behavior change. `git mv` preserves history; all import specifiers are absolute `@/lib/...` (verified), so rewrites are anchored on the closing quote to avoid prefix collisions. The TypeScript compiler (`npx tsc --noEmit`) is the safety net — a missed import is a compile error. Work proceeds one domain group per commit so each step is independently revertable.

**Tech Stack:** Next.js 16 (App Router), TypeScript (strict), React 19, Supabase, Node test runner via `tsx`.

**Spec:** `docs/superpowers/specs/2026-06-29-codebase-restructure-design.md`
**Branch:** `refactor/restructure-codebase` (already created and checked out)

---

## Reference: Complete absolute-import rewrite map

Every consumer uses double-quoted `@/lib/...` specifiers. Rewrites match the path **plus its closing `"`** so that prefix pairs (`curriculum` vs `curriculum-seed-source`, `blog-content` vs `blog-content-sanitize`) never collide. `@/lib/mentors"` does not appear inside `@/lib/supabase/mentors"`, so that is safe too.

| Old specifier | New specifier | Task |
|---|---|---|
| `@/lib/education-category-page"` | `@/components/education/education-category-page"` | 3 |
| `@/lib/education-mentor-page"` | `@/components/education/education-mentor-page"` | 3 |
| `@/lib/education-categories"` | `@/lib/education/categories"` | 4 |
| `@/lib/education-category-meta"` | `@/lib/education/category-meta"` | 4 |
| `@/lib/education-category-theme"` | `@/lib/education/category-theme"` | 4 |
| `@/lib/mentors"` | `@/lib/education/mentors"` | 4 |
| `@/lib/course"` | `@/lib/education/course"` | 4 |
| `@/lib/lessons-sort"` | `@/lib/education/lessons-sort"` | 4 |
| `@/lib/lesson-topic-slug"` | `@/lib/education/lesson-topic-slug"` | 4 |
| `@/lib/admin-lessons-nav"` | `@/lib/education/admin-lessons-nav"` | 4 |
| `@/lib/thun-tula-playlist-order"` | `@/lib/education/thun-tula-playlist-order"` | 4 |
| `@/lib/curriculum"` | `@/lib/curriculum/curriculum"` | 5 |
| `@/lib/curriculum-seed-source"` | `@/lib/curriculum/seed-source"` | 5 |
| `@/lib/blog-content"` | `@/lib/blog/content"` | 6 |
| `@/lib/blog-content-sanitize"` | `@/lib/blog/content-sanitize"` | 6 |
| `@/lib/video"` | `@/lib/media/video"` | 7 |
| `@/lib/youtube"` | `@/lib/media/youtube"` | 7 |

Relative / non-`@/lib` references handled inside their tasks:
- `lib/course.ts`: `from "./education-categories"` → `from "./categories"` (Task 4)
- `scripts/gen-curriculum-sql.ts`: `from "../lib/curriculum-seed-source"` → `from "../lib/curriculum/seed-source"` (Task 5)
- `package.json` `test:youtube`: `lib/youtube.test.ts` → `lib/media/youtube.test.ts` (Task 7)
- `lib/curriculum-seed-source.ts`: `from "./curriculum"` — **stays valid** (both files land in `lib/curriculum/`), no change
- `lib/youtube.test.ts`: `from "./youtube"` — **stays valid** (both files land in `lib/media/`), no change

**macOS note:** BSD `sed` requires `sed -i ''` (empty backup arg). All `sed` commands below use `#` as delimiter to avoid escaping `/`.

---

### Task 1: Establish green baseline

**Files:** none (read-only verification)

- [ ] **Step 1: Confirm clean tree on the refactor branch**

Run: `git status && git branch --show-current`
Expected: `nothing to commit, working tree clean` and branch `refactor/restructure-codebase`.

- [ ] **Step 2: Type-check baseline**

Run: `npx tsc --noEmit`
Expected: completes with no errors (exit 0, no output).

- [ ] **Step 3: Run existing unit tests baseline**

Run: `npm run test:slug && npm run test:youtube`
Expected: both test files pass.

- [ ] **Step 4: Lint baseline**

Run: `npm run lint`
Expected: no errors (warnings, if any, are pre-existing — note them but do not fix in this refactor).

No commit (read-only).

---

### Task 2: Delete dead route directories (Spec Section 1)

**Files:**
- Delete: `app/[locale]/(main)/education/crypto/` (and nested `[mentorSlug]/`)
- Delete: `app/[locale]/(main)/education/forex/` (and nested `[mentorSlug]/`)
- Delete: `app/[locale]/(main)/education/stock/` (and nested `[mentorSlug]/`)
- Delete: `app/[locale]/(main)/education/siac/` (and nested `[mentorSlug]/`)
- Delete: `app/[locale]/(main)/education/[category]/` (and nested `[mentorSlug]/`)
- Delete: `app/[locale]/(main)/education/.qodo/`
- Delete: `app/[locale]/(main)/gate/`

- [ ] **Step 1: Verify every target directory is empty (no files)**

Run:
```bash
find "app/[locale]/(main)/education/crypto" "app/[locale]/(main)/education/forex" \
     "app/[locale]/(main)/education/stock" "app/[locale]/(main)/education/siac" \
     "app/[locale]/(main)/education/[category]" "app/[locale]/(main)/education/.qodo" \
     "app/[locale]/(main)/gate" -type f 2>/dev/null
```
Expected: **no output** (zero files). If any file is listed, STOP and report — do not delete.

- [ ] **Step 2: Remove the empty directories**

Run:
```bash
rm -rf "app/[locale]/(main)/education/crypto" \
       "app/[locale]/(main)/education/forex" \
       "app/[locale]/(main)/education/stock" \
       "app/[locale]/(main)/education/siac" \
       "app/[locale]/(main)/education/[category]" \
       "app/[locale]/(main)/education/.qodo" \
       "app/[locale]/(main)/gate"
```
Expected: no output, exit 0.

- [ ] **Step 3: Confirm only intended education routes remain**

Run: `find "app/[locale]/(main)/education" -type d`
Expected: only `education`, `education/[slug]`, `education/[slug]/[mentorSlug]`, `education/[slug]/[mentorSlug]/[topicSlug]`.

- [ ] **Step 4: Type-check (nothing should break — these were empty)**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove dead education route folders and stray dirs"
```

---

### Task 3: Move UI page-renderers out of lib/ (Spec Section 2)

**Files:**
- Move: `lib/education-category-page.tsx` → `components/education/education-category-page.tsx`
- Move: `lib/education-mentor-page.tsx` → `components/education/education-mentor-page.tsx`
- Modify (import only): `app/[locale]/(main)/education/[slug]/page.tsx`
- Modify (import only): `app/[locale]/(main)/education/[slug]/[mentorSlug]/page.tsx`
- Modify (import only): `app/[locale]/(main)/education/[slug]/[mentorSlug]/[topicSlug]/page.tsx`

- [ ] **Step 1: Move both files with git (preserves history)**

```bash
git mv "lib/education-category-page.tsx" "components/education/education-category-page.tsx"
git mv "lib/education-mentor-page.tsx" "components/education/education-mentor-page.tsx"
```
Expected: no output, exit 0.

- [ ] **Step 2: Rewrite the consumer imports**

```bash
grep -rl '@/lib/education-category-page"' app components lib | \
  xargs sed -i '' 's#@/lib/education-category-page"#@/components/education/education-category-page"#g'
grep -rl '@/lib/education-mentor-page"' app components lib | \
  xargs sed -i '' 's#@/lib/education-mentor-page"#@/components/education/education-mentor-page"#g'
```
Expected: no output, exit 0.

- [ ] **Step 3: Confirm no lingering references to the old paths**

Run: `grep -rn '@/lib/education-category-page\|@/lib/education-mentor-page' app components lib`
Expected: **no output**.

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors. (The two moved files keep their absolute `@/lib/...` and `@/components/...` imports, which remain valid from the new location.)

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: move education page renderers from lib/ to components/education"
```

---

### Task 4: Group lib/education/ (Spec Section 3)

**Files:**
- Move+rename: `lib/education-categories.ts` → `lib/education/categories.ts`
- Move+rename: `lib/education-category-meta.ts` → `lib/education/category-meta.ts`
- Move+rename: `lib/education-category-theme.ts` → `lib/education/category-theme.ts`
- Move: `lib/mentors.ts` → `lib/education/mentors.ts`
- Move: `lib/course.ts` → `lib/education/course.ts`
- Move: `lib/lessons-sort.ts` → `lib/education/lessons-sort.ts`
- Move: `lib/lesson-topic-slug.ts` → `lib/education/lesson-topic-slug.ts`
- Move: `lib/admin-lessons-nav.ts` → `lib/education/admin-lessons-nav.ts`
- Move: `lib/thun-tula-playlist-order.ts` → `lib/education/thun-tula-playlist-order.ts`
- Modify (relative import): `lib/education/course.ts` (after move)

- [ ] **Step 1: Create the folder and move the files**

```bash
mkdir -p lib/education
git mv "lib/education-categories.ts"        "lib/education/categories.ts"
git mv "lib/education-category-meta.ts"      "lib/education/category-meta.ts"
git mv "lib/education-category-theme.ts"     "lib/education/category-theme.ts"
git mv "lib/mentors.ts"                      "lib/education/mentors.ts"
git mv "lib/course.ts"                       "lib/education/course.ts"
git mv "lib/lessons-sort.ts"                 "lib/education/lessons-sort.ts"
git mv "lib/lesson-topic-slug.ts"            "lib/education/lesson-topic-slug.ts"
git mv "lib/admin-lessons-nav.ts"            "lib/education/admin-lessons-nav.ts"
git mv "lib/thun-tula-playlist-order.ts"     "lib/education/thun-tula-playlist-order.ts"
```
Expected: no output, exit 0.

- [ ] **Step 2: Rewrite all absolute imports for this group**

```bash
for pair in \
  "education-categories:education/categories" \
  "education-category-meta:education/category-meta" \
  "education-category-theme:education/category-theme" \
  "mentors:education/mentors" \
  "course:education/course" \
  "lessons-sort:education/lessons-sort" \
  "lesson-topic-slug:education/lesson-topic-slug" \
  "admin-lessons-nav:education/admin-lessons-nav" \
  "thun-tula-playlist-order:education/thun-tula-playlist-order"; do
  old="${pair%%:*}"; new="${pair##*:}"
  files=$(grep -rl "@/lib/${old}\"" app components lib 2>/dev/null)
  if [ -n "$files" ]; then
    echo "$files" | xargs sed -i '' "s#@/lib/${old}\"#@/lib/${new}\"#g"
  fi
done
```
Expected: no output, exit 0.

- [ ] **Step 3: Fix the one relative import inside the moved course.ts**

`lib/education/course.ts` line 2 still reads `from "./education-categories"`, but that sibling is now `categories.ts`. Update it:
```bash
sed -i '' 's#from "./education-categories"#from "./categories"#' lib/education/course.ts
```
Expected: no output, exit 0.

- [ ] **Step 4: Confirm no lingering old specifiers**

Run:
```bash
grep -rn '@/lib/education-categories\|@/lib/education-category-meta\|@/lib/education-category-theme\|@/lib/mentors"\|@/lib/course"\|@/lib/lessons-sort\|@/lib/lesson-topic-slug\|@/lib/admin-lessons-nav\|@/lib/thun-tula-playlist-order\|"./education-categories"' app components lib
```
Expected: **no output**.

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor: group education logic under lib/education/"
```

---

### Task 5: Group lib/curriculum/ (Spec Section 3)

**Files:**
- Move: `lib/curriculum.ts` → `lib/curriculum/curriculum.ts`
- Move+rename: `lib/curriculum-seed-source.ts` → `lib/curriculum/seed-source.ts`
- Modify (relative import): `scripts/gen-curriculum-sql.ts`

- [ ] **Step 1: Create the folder and move the files**

```bash
mkdir -p lib/curriculum
git mv "lib/curriculum.ts"             "lib/curriculum/curriculum.ts"
git mv "lib/curriculum-seed-source.ts" "lib/curriculum/seed-source.ts"
```
Expected: no output, exit 0. (`lib/curriculum/seed-source.ts` keeps `from "./curriculum"` — its sibling is now `lib/curriculum/curriculum.ts`, so it stays valid.)

- [ ] **Step 2: Rewrite absolute imports (seed-source first to avoid the `curriculum` prefix collision; quote-anchoring already prevents it, but order is belt-and-suspenders)**

```bash
grep -rl '@/lib/curriculum-seed-source"' app components lib | \
  xargs sed -i '' 's#@/lib/curriculum-seed-source"#@/lib/curriculum/seed-source"#g'
grep -rl '@/lib/curriculum"' app components lib | \
  xargs sed -i '' 's#@/lib/curriculum"#@/lib/curriculum/curriculum"#g'
```
Expected: no output, exit 0.

- [ ] **Step 3: Fix the script's relative import**

```bash
sed -i '' 's#from "../lib/curriculum-seed-source"#from "../lib/curriculum/seed-source"#' scripts/gen-curriculum-sql.ts
```
Expected: no output, exit 0.

- [ ] **Step 4: Confirm no lingering old specifiers**

Run: `grep -rn '@/lib/curriculum"\|@/lib/curriculum-seed-source\|../lib/curriculum-seed-source' app components lib scripts`
Expected: **no output**.

- [ ] **Step 5: Type-check + regenerate-script smoke check**

Run: `npx tsc --noEmit`
Expected: no errors.
Run: `npm run gen:curriculum-sql`
Expected: completes without a module-resolution error (it writes the SQL migration file). If it errors for an unrelated env reason, confirm the error is **not** about `curriculum/seed-source` resolution.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor: group curriculum logic under lib/curriculum/"
```

---

### Task 6: Group lib/blog/ (Spec Section 3)

**Files:**
- Move+rename: `lib/blog-content.ts` → `lib/blog/content.ts`
- Move+rename: `lib/blog-content-sanitize.ts` → `lib/blog/content-sanitize.ts`

- [ ] **Step 1: Create the folder and move the files**

```bash
mkdir -p lib/blog
git mv "lib/blog-content.ts"          "lib/blog/content.ts"
git mv "lib/blog-content-sanitize.ts" "lib/blog/content-sanitize.ts"
```
Expected: no output, exit 0.

- [ ] **Step 2: Rewrite absolute imports (sanitize first to avoid the `blog-content` prefix collision)**

```bash
grep -rl '@/lib/blog-content-sanitize"' app components lib | \
  xargs sed -i '' 's#@/lib/blog-content-sanitize"#@/lib/blog/content-sanitize"#g'
grep -rl '@/lib/blog-content"' app components lib | \
  xargs sed -i '' 's#@/lib/blog-content"#@/lib/blog/content"#g'
```
Expected: no output, exit 0.

- [ ] **Step 3: Confirm no lingering old specifiers**

Run: `grep -rn '@/lib/blog-content' app components lib`
Expected: **no output**.

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: group blog content logic under lib/blog/"
```

---

### Task 7: Group lib/media/ and fix the test script (Spec Section 3)

**Files:**
- Move: `lib/video.ts` → `lib/media/video.ts`
- Move: `lib/youtube.ts` → `lib/media/youtube.ts`
- Move: `lib/youtube.test.ts` → `lib/media/youtube.test.ts`
- Modify: `package.json` (`test:youtube` script path)

- [ ] **Step 1: Create the folder and move the files**

```bash
mkdir -p lib/media
git mv "lib/video.ts"        "lib/media/video.ts"
git mv "lib/youtube.ts"      "lib/media/youtube.ts"
git mv "lib/youtube.test.ts" "lib/media/youtube.test.ts"
```
Expected: no output, exit 0. (`lib/media/youtube.test.ts` keeps `from "./youtube"`, and `lib/media/video.ts` keeps `from "@/lib/youtube"` until the next step rewrites it.)

- [ ] **Step 2: Rewrite absolute imports**

```bash
grep -rl '@/lib/video"' app components lib | \
  xargs sed -i '' 's#@/lib/video"#@/lib/media/video"#g'
grep -rl '@/lib/youtube"' app components lib | \
  xargs sed -i '' 's#@/lib/youtube"#@/lib/media/youtube"#g'
```
Expected: no output, exit 0.

- [ ] **Step 3: Update the package.json test script path**

In `package.json`, change the `test:youtube` script from:
```json
"test:youtube": "tsx --test lib/youtube.test.ts",
```
to:
```json
"test:youtube": "tsx --test lib/media/youtube.test.ts",
```
Apply with:
```bash
sed -i '' 's#tsx --test lib/youtube.test.ts#tsx --test lib/media/youtube.test.ts#' package.json
```
Expected: no output, exit 0.

- [ ] **Step 4: Confirm no lingering old specifiers**

Run: `grep -rn '@/lib/video"\|@/lib/youtube"\|lib/youtube.test.ts' app components lib package.json`
Expected: **no output**.

- [ ] **Step 5: Type-check and run the moved test**

Run: `npx tsc --noEmit`
Expected: no errors.
Run: `npm run test:youtube`
Expected: the YouTube tests pass from their new path.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor: group media logic under lib/media/ and update test script"
```

---

### Task 8: Final full verification

**Files:**
- Modify: `docs/superpowers/specs/2026-06-29-codebase-restructure-design.md` (status line)

- [ ] **Step 1: Confirm lib/ root holds only the 5 primitives + existing folders**

Run: `ls -1 lib`
Expected exactly: `brand.ts`, `cache-tags.ts`, `i18n.ts`, `slug.test.ts`, `slug.ts`, and the directories `blog`, `curriculum`, `education`, `media`, `r2`, `security`, `supabase`, `tools`, `ui`. No other loose files.

- [ ] **Step 2: Full type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Run both unit test suites**

Run: `npm run test:slug && npm run test:youtube`
Expected: both pass.

- [ ] **Step 4: Lint**

Run: `npm run lint`
Expected: no new errors versus the Task 1 baseline.

- [ ] **Step 5: Production build (final proof)**

Run: `npm run build`
Expected: build succeeds. This compiles every route and is the strongest end-to-end check that no import broke.

- [ ] **Step 6: Catch-all stale-reference sweep**

Run:
```bash
grep -rn '@/lib/education-categor\|@/lib/education-mentor-page\|@/lib/education-category-page\|@/lib/mentors"\|@/lib/course"\|@/lib/lessons-sort\|@/lib/lesson-topic-slug\|@/lib/admin-lessons-nav\|@/lib/thun-tula\|@/lib/curriculum"\|@/lib/curriculum-seed-source\|@/lib/blog-content\|@/lib/video"\|@/lib/youtube"' app components lib scripts middleware.ts package.json
```
Expected: **no output** (every old specifier is gone).

- [ ] **Step 7: Mark the spec done and commit**

Update the spec's status line from `Status: Approved (pending spec review)` to `Status: Implemented`:
```bash
sed -i '' 's#\*\*Status:\*\* Approved (pending spec review)#**Status:** Implemented#' docs/superpowers/specs/2026-06-29-codebase-restructure-design.md
git add -A
git commit -m "docs: mark codebase restructure spec as implemented"
```

---

## Self-Review notes (author check, completed)

- **Spec coverage:** Section 1 → Task 2; Section 2 → Task 3; Section 3 (education/curriculum/blog/media) → Tasks 4/5/6/7; Section 4 (git mv, per-group tsc, incremental commits, package.json fix) → embedded in every task + Task 8.
- **Cross-cutting primitives** (`i18n`, `brand`, `cache-tags`, `slug`) verified to stay at root (Task 8 Step 1).
- **Prefix collisions** (`curriculum`/`curriculum-seed-source`, `blog-content`/`blog-content-sanitize`) handled by quote-anchored patterns + ordered replacement.
- **Relative imports** (`course.ts`, `curriculum-seed-source.ts`, `youtube.test.ts`, `scripts/gen-curriculum-sql.ts`) each explicitly addressed.
- **No placeholders:** every step has concrete commands and expected output.
