# ADR 0001: Architecture Boundaries And Shared Pagination

- Status: Accepted
- Date: 2026-03-28

## Context

The project started as a small Vue app and grew around a few central files:

- parser orchestration in `src/composables/useResumeParser.ts`
- parser heuristics in `src/utils/parseTextToResume.ts`
- preview/export wiring in `src/views/BuilderView.vue`
- large stores in `src/stores/*.ts`

This created three recurring problems:

1. UI, domain rules, and infrastructure code leaked into the same modules.
2. Preview and export were at risk of drifting apart in page layout behavior.
3. Refactors to parsing, rendering, or state management had a high blast radius.

## Decision

We move the codebase toward explicit slice boundaries:

- `app`
- `pages`
- `widgets`
- `features`
- `entities`
- `shared`

We also keep one shared pagination engine used by both preview and export.

## Consequences

### Accepted constraints

- UI components should stay presentation-oriented.
- Parser stages should be split into isolated modules with explicit contracts.
- Stores should be thin state containers, not orchestration layers.
- Preview model and export model should be separate consumers of the same pagination utility.

### Immediate ownership rules

- `entities` may depend only on `shared`
- `features` may depend on `entities` and `shared`
- `widgets` may depend on `features`, `entities`, and `shared`
- `pages` may depend on `widgets`, `features`, `entities`, and `shared`

### Shared layout rule

`measurePagedLayout` remains the single source of truth for page starts. Preview and export may build different view models around it, but they must not invent their own page-break engines.

## Follow-up work

- Split parser pipeline into staged modules.
- Move i18n messages closer to feature and entity ownership.
- Replace large monolithic stores with smaller domain-focused state plus use-cases.
- Add stage-level tests, contract tests, preview integration tests, and e2e flows.
