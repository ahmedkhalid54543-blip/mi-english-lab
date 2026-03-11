# Mi English Phase 3 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build weakness ranking, daily review queue, homepage review entry, trainer weekly report page, and supporting Supabase schema changes for Mi English v3.0 Phase 3.

**Architecture:** Add two standalone browser-safe utility modules for weakness analysis and review queue generation, expose them on `window` and CommonJS for Node-based verification, then wire lightweight UI entry points into the homepage and a new `trainer.html` report screen. Persist trainer reporting at the schema layer through aggregate-friendly cohort and weekly report tables rather than cross-user client aggregation.

**Tech Stack:** Static HTML/CSS/JS, browser globals, Node built-in test runner, Supabase Postgres schema

---

### Task 1: Weakness Analysis Rules

**Files:**
- Create: `js/weakness.js`
- Create: `tests/weakness.test.js`

**Step 1: Write the failing test**

Write tests covering:
- failed scenario attempts
- lesson progress with mistakes over 2
- rescue line usage over 3
- second pass still failed
- sorting by severity first, then latest event time

**Step 2: Run test to verify it fails**

Run: `node --test tests/weakness.test.js`
Expected: FAIL because `js/weakness.js` does not exist yet

**Step 3: Write minimal implementation**

Implement `identifyWeaknesses(input)` returning normalized weakness items with severity score, severity label, latest timestamp, reasons, and deterministic sort order.

**Step 4: Run test to verify it passes**

Run: `node --test tests/weakness.test.js`
Expected: PASS

### Task 2: Review Queue Rules

**Files:**
- Create: `js/review-queue.js`
- Create: `tests/review-queue.test.js`

**Step 1: Write the failing test**

Write tests covering:
- generation from weakness list
- due-today filtering
- priority ordering
- queue limits

**Step 2: Run test to verify it fails**

Run: `node --test tests/review-queue.test.js`
Expected: FAIL because `js/review-queue.js` does not exist yet

**Step 3: Write minimal implementation**

Implement `generateReviewQueue(input)` and `getTodayReviewItems(input)` using weakness severity and recency to set review priority and `reviewDate`.

**Step 4: Run test to verify it passes**

Run: `node --test tests/review-queue.test.js`
Expected: PASS

### Task 3: Homepage Review Entry

**Files:**
- Modify: `index.html`

**Step 1: Add review entry section**

Insert a “今日复习” block on the homepage with item count, top priority summary, and CTA links.

**Step 2: Wire data**

Load the new queue helpers and render queue summary from local scenario and lesson data.

**Step 3: Verify in static markup**

Run: `node --check index.html`
Expected: not applicable, verify via JS syntax checks and source inspection

### Task 4: Trainer Weekly Report

**Files:**
- Create: `trainer.html`
- Create: `js/trainer.js`

**Step 1: Build page shell**

Add cards for cohort size, active users, first-scene completion, scenario pass rate, top 3 weak scenarios, and CSV export.

**Step 2: Implement data loading**

Fetch latest weekly report rows from Supabase and render selected cohort metrics, with empty-state fallback.

**Step 3: Implement CSV export**

Convert visible report metrics and top weaknesses to downloadable CSV.

### Task 5: Schema Support

**Files:**
- Modify: `supabase/schema.sql`

**Step 1: Add cohort tables**

Append `cohorts`, `cohort_memberships`, and `weekly_reports`.

**Step 2: Add indexes and RLS**

Support trainer/admin reporting reads and member enrollment writes as minimally as the current client can consume.

### Task 6: Verification and Delivery

**Files:**
- Verify all changed files

**Step 1: Syntax verification**

Run: `node --check js/weakness.js js/review-queue.js js/trainer.js js/api.js js/storage.js`

**Step 2: Test verification**

Run: `node --test tests/weakness.test.js tests/review-queue.test.js`

**Step 3: Commit and push**

Run:
```bash
git add docs/plans/2026-03-11-mi-english-phase3.md tests/weakness.test.js tests/review-queue.test.js js/weakness.js js/review-queue.js js/trainer.js trainer.html index.html supabase/schema.sql
git commit -m "feat: add phase 3 review and trainer reporting"
git push
```

---

## Follow-up Notes (2026-03-11 PM)

- Homepage “next step recommendation” is currently deprioritized. Keep the homepage focused on `今日任务 + 常用入口`; do not spend more time on recommendation logic until scenario count is much higher.
- Flashcard mastery flow still needs another pass: cards marked `已掌握` should stay out of the active learn queue when the learner comes back into flashcards.
- Memory cards need a stronger `记忆卡` rewrite instead of `解释卡` wording.
  - Single-word cards: prioritize root / word-building only when it genuinely helps memory.
  - Phrase cards with one difficult word: center the card around that difficult word instead of flattening all words equally.
  - Phrase cards with no difficult word: do not force root analysis; use action-based or scene-based memory hooks.
  - Rewrite hooks toward humorous mnemonic lines, e.g. `ambulance -> 俺不能死`, rather than dry explanation text.
- Internal product discussion copy should not appear in learner-facing pages. Keep visible text learner-oriented and outcome-oriented.
