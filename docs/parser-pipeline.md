# Parser Pipeline

## Goal

The parser should ingest a wide range of standard resume PDFs without silently polluting the form with low-quality data.

The pipeline is intentionally staged so each part can be tuned and tested independently.

## Stages

### 1. PDF extraction

Responsibility:

- open the PDF
- read raw text items
- read annotations and metadata

Input:

- `File` or `ArrayBuffer`

Output:

- `ExtractedPdfDocument`

This stage must not classify sections or build resume entities.

### 2. Normalization

Responsibility:

- reconstruct reading order
- merge lines and paragraphs
- repair broken words, URLs, emails, and dates
- preserve layout hints needed by downstream stages

Input:

- `ExtractedPdfDocument`

Output:

- `NormalizedDocument`

### 3. Profile detection

Responsibility:

- choose a parser profile for the document

Supported profiles:

- `single-column`
- `two-column`
- `dense-corporate`
- `job-board-export`

Input:

- `NormalizedDocument`

Output:

- `ParserProfileDetectionResult`

### 4. Section classification

Responsibility:

- bucket normalized content into candidate sections

Sections:

- `personal`
- `about`
- `workExperience`
- `education`
- `skills`
- `languages`
- `projects`

Input:

- `NormalizedDocument`
- `ParserProfile`

Output:

- `ClassifiedDocument`

### 5. Entity extraction

Responsibility:

- extract domain candidates from classified sections

Input:

- `ClassifiedDocument`
- `ParserProfile`

Output:

- `ExtractedResumeDraft`

This stage maps data into the domain shape but does not decide whether it is safe to auto-apply.

### 6. Confidence scoring

Responsibility:

- score each extracted block
- explain how reliable the extraction is

Confidence levels:

- `high`
- `medium`
- `low`
- `missing`

Input:

- `ExtractedResumeDraft`
- `ClassifiedDocument`
- `ParserProfile`

Output:

- `ParseReview`

### 7. Fallback decision

Responsibility:

- decide what gets auto-imported
- hold back risky blocks
- preserve raw text for manual review

Input:

- `ExtractedResumeDraft`
- `ParseReview`

Output:

- `SafeParseResult`

## Contracts

Each stage must expose a narrow contract:

- explicit input type
- explicit output type
- no hidden cross-stage mutation
- no UI concerns

The orchestration layer should only wire stages together. It should not re-implement stage internals.

## Current architecture direction

Target module layout:

```text
src/features/upload-resume/lib/
  pdf-extraction/
  normalization/
  profile-detection/
  section-classification/
  entity-extraction/

src/entities/resume/model/
  confidence/

src/features/upload-resume/model/
  parse-resume-from-pdf.use-case.ts
  apply-confidence-fallback.use-case.ts
```

## Quality rules

- low-confidence blocks must not be silently written into the form
- raw text must remain available for manual review
- parser profile must influence classification and extraction behavior
- preview and export should stay downstream from parsed domain data, not parser internals
