# Weekly Report Edge Function Plan

## Decision

Use an automatic scheduled Edge Function as the default write path.

Manual rerun is allowed as an override for backfill or recovery, but weekly report generation should not depend on a trainer opening `trainer.html`.

## Why

The trainer page should stay read-only.

If report generation lives in the browser, learners could discover the aggregation shape, and trainers would get different results depending on who opened the page and when. A server-side scheduled write keeps the report snapshot stable and auditable.

## Trigger Model

Recommended schedule:

- Run once per week after the reporting window closes.
- Example cadence: every Monday 06:00 in the project timezone.

Recommended override:

- Allow a manual HTTP invocation guarded by service credentials for backfill and replay.

## Runtime Identity

The Edge Function uses the service role key.

That lets it:

- Read all required user progress tables
- Aggregate by cohort
- Upsert into `public.weekly_reports`

The trainer client never writes `weekly_reports` directly.

## Input Tables

- `cohorts`
- `cohort_memberships`
- `scenario_attempts`
- `lesson_progress`
- `vocab_progress`

`lesson_progress` and `vocab_progress` are optional enrichment inputs.

The minimum viable report can be computed from `cohort_memberships` and `scenario_attempts`.

## Output Contract

For each active cohort and each report week, upsert one row into `public.weekly_reports`:

```json
{
  "cohort_id": "uuid",
  "report_week": "2026-03-09",
  "total_members": 24,
  "active_members": 18,
  "first_scene_completion_rate": 75.0,
  "scenario_pass_rate": 62.5,
  "top_weaknesses": [
    {
      "scene_id": "scene-01",
      "scene_title": "Store Greeting",
      "reason": "retry-heavy with low pass rate",
      "severity_score": 82
    }
  ],
  "payload": {
    "generated_by": "weekly-report-edge-function",
    "window_start": "2026-03-02T00:00:00Z",
    "window_end": "2026-03-08T23:59:59Z"
  }
}
```

## Aggregation Steps

1. Read all active cohorts with their memberships.
2. Build the member list for each cohort.
3. Read scenario attempts within the report window for those members.
4. Compute:
   - `total_members`
   - `active_members`: members with at least one attempt in the window
   - `first_scene_completion_rate`: share of members who completed the first required scene
   - `scenario_pass_rate`: passed attempts / total attempts
5. Rank weakness scenes by low pass rate, retry count, and low coverage.
6. Upsert one report row per `(cohort_id, report_week)`.

## Failure And Replay

If one cohort fails, log that cohort and continue the rest.

Replay strategy:

- Support rerun for a specific `report_week`
- Support rerun for a specific `cohort_id`
- Use upsert so reruns overwrite the same weekly snapshot deterministically

## Operational Notes

- Roll out the RLS changes before exposing trainer access.
- Backfill `cohorts.trainer_user_id` before the first scheduled run.
- Seed at least one test cohort and one trainer account before UAT.

## Ownership

- Automatic path: scheduled Edge Function
- Manual path: admin or ops invocation with service credentials

This means the weekly report write path is automatic by default, with manual replay as an operational fallback.
