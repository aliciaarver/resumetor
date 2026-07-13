# Resumetor

Resume builder on Vue 3 + TypeScript + Vite.

## Features

- import data from existing PDF resumes
- edit personal info, summary, work experience, education, and languages
- preview the document with page-aware layout
- export PDF with embedded metadata
- switch between Russian and English UI

## Scripts

- `npm run dev` starts the local Vite dev server
- `npm run build` runs type-checking and production build
- `npm run preview` serves the built app locally
- `npm test` runs the Vitest suite once
- `npm run test:watch` runs Vitest in watch mode

## Developer Docs

- [Developer Docs](docs/README.md)
- [ADR 0001](docs/adr/0001-architecture-boundaries-and-shared-pagination.md)
- [Parser Pipeline](docs/parser-pipeline.md)
- [Testing Strategy](docs/testing-strategy.md)
