# Testing Strategy

## Goal

Testing should protect the product at three levels:

1. parser correctness
2. preview/export correctness
3. end-to-end user flows

## Test layers

### Unit tests

Required for:

- normalization
- section classification
- entity extraction
- confidence scoring
- fallback logic
- pagination utility

Unit tests should use small fixtures and avoid browser-only dependencies where possible.

### Contract tests

Required for parser stage boundaries.

They verify that:

- each stage returns the agreed shape
- downstream stages can consume the output safely
- refactors do not silently break cross-stage assumptions

### Integration tests

Required for:

- preview rendering
- shared pagination behavior
- preview/export relationship
- template switching

These tests should verify that preview markers, page counts, and template switching work without relying on visual inspection only.

### End-to-end tests

Required for:

- upload PDF
- partial parse
- held-back sections
- export PDF

E2E tests should verify the main user journey, not every parser branch.

## Fixtures and corpus

The parser needs a real-world fixture corpus.

Recommended layout:

```text
tests/fixtures/resume-corpus/
  manifest.json
  pdfs/
  expected/
```

The corpus should cover:

- `single-column`
- `two-column`
- `dense-corporate`
- `job-board-export`
- RU, EN, and mixed-language resumes
- short and multi-page examples

## Performance checks

Preview and export already have basic budget utilities. Tests should eventually assert that:

- pagination remains shared between preview and export
- extremely large resumes trigger budget warnings instead of silent degradation

## Suggested execution order

1. unit tests for parser stages
2. contract tests for pipeline boundaries
3. integration tests for preview and templates
4. e2e tests for upload/review/export

## Change policy

When changing parser heuristics, templates, or pagination:

- update or add fixtures
- run build
- run affected unit/contract/integration tests
- check whether confidence and fallback behavior changed intentionally
