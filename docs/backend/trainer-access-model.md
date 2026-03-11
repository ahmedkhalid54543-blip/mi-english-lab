# Trainer Access Model

## Goal

Make `trainer.html` a trainer-only surface.

The learner side must not expose the trainer entry in UI, and direct access to trainer data must still be blocked by RLS even if someone opens the page URL manually.

## Source Of Truth

Trainer access is defined by `public.cohorts.trainer_user_id`.

If a user owns at least one cohort through `trainer_user_id = auth.uid()`, that user is treated as a trainer for the trainer page.

This avoids introducing a second trainer role flag that can drift from the cohort assignment.

## Access Rules

### Learner

- Cannot see the trainer entry on the homepage.
- Cannot read `cohorts` unless they are the assigned trainer.
- Cannot read `weekly_reports`.
- Can only read their own rows in `cohort_memberships`.

### Trainer

- Can see the trainer entry on the homepage after auth resolves.
- Can access `trainer.html`.
- Can read only the cohorts where `trainer_user_id = auth.uid()`.
- Can read only memberships that belong to the cohorts they own.
- Can read only weekly reports that belong to the cohorts they own.

## RLS Changes

`supabase/schema.sql` tightens the three trainer-related tables:

1. `cohorts`
   - Drop the wide `authenticated` read policy.
   - Allow `select` only when `trainer_user_id = auth.uid()`.
2. `cohort_memberships`
   - Allow learners to read their own membership rows.
   - Allow trainers to read membership rows inside their own cohorts.
   - Remove learner self-enrollment write policies.
3. `weekly_reports`
   - Drop the wide `authenticated` read policy.
   - Allow `select` only if the report's `cohort_id` belongs to a cohort owned by the current trainer.

## Frontend Guard

`js/trainer-guard.js` is the single frontend access check.

It returns one of two shapes:

```js
{ ok: true, role: 'trainer', cohortIds: ['...'], cohorts: [...] }
```

or:

```js
{ ok: false, reason: 'forbidden' }
```

The same module is used in two places:

1. Homepage
   - Hide `[data-trainer-entry]` by default.
   - Reveal it only when the resolved access result is trainer.
2. `trainer.html`
   - Block report loading until access is verified.
   - Show a clear unauthorized message instead of an empty report shell.

## Unauthorized Behavior

When access fails, the trainer page does not render the cohort selector, metrics grid, or report panel.

Instead it shows one of these states:

- Not logged in
- No trainer cohort assigned
- Supabase config missing
- Guard query failed because schema or bindings are incomplete

## Data Backfill Requirement

This model depends on `cohorts.trainer_user_id` being populated for every trainer-owned cohort.

If old data only marks trainer identity through `cohort_memberships.membership_role = 'trainer'`, those rows must be backfilled into `cohorts.trainer_user_id` before rollout.

## Old Vs New

- Old: any authenticated user could read all `cohorts` and all `weekly_reports`.
- New: trainer reads are scoped to assigned cohorts only, and learners see no trainer entry in the homepage UI.
