# Resumetor — Tech Lead Documentation

Живая техническая документация: стек, архитектура, соглашения, ключевые модули. Анализы и задачи сюда не кладём — они живут в `.tech-lead-history/*.md` и в Trello.

## 1. Что это

SPA-конструктор резюме. Полностью клиентский: импорт данных из PDF, редактирование формы, превью с пагинацией, экспорт PDF с метаданными. Бекенда нет, вся работа в браузере.

Точка входа: `index.html` → `src/main.ts` → `App.vue` → `src/router/` → `views/BuilderView.vue`.

## 2. Стек

| Слой | Выбор |
| --- | --- |
| Язык | TypeScript 5.9 (strict, `noUnusedLocals`, `noUnusedParameters`, `noUncheckedSideEffectImports`, `erasableSyntaxOnly`, `noFallthroughCasesInSwitch`) |
| Фреймворк | Vue 3.5 (Composition API, `<script setup lang="ts">`) |
| Сборщик | Vite 8 + `@vitejs/plugin-vue` |
| Стейт | Pinia 3 (setup-style сторы) |
| Роутер | vue-router 4 (одна страница `/`) |
| Утилиты | `@vueuse/core` 14 (`useLocalStorage`, `useResizeObserver`) |
| PDF ввод | `pdfjs-dist` 5 (ленивый `import()`, исключён из `optimizeDeps`) |
| PDF вывод | `html2canvas` 1.4 + `jspdf` 4 (растровый экспорт) |
| Стили | SCSS, глобально подмешиваются `variables` и `mixins` через `vite.config.ts` |
| Алиасы | `@/*` → `src/*` |
| Type-check при сборке | `vue-tsc -b` перед `vite build` |

Не подключено: ESLint, Prettier, stylelint, Vitest, Playwright, precommit-хуки, CI.

## 3. Архитектура

### Реальная раскладка `src/`

```
App.vue, main.ts, router/
views/BuilderView.vue           ← единственная страница
components/
  form/       PersonalInfo, AboutMe, WorkExperience(+Block), Education,
              Skills, Languages, Projects
  preview/    ResumePreview (активный), ModernResumePreview (не подключён)
  upload/     ResumeUploader, ParseReviewPanel
  pdf/        PdfMetadataPanel
  ui/         AppButton, AppInput, AppTextarea, AppMonthField
composables/
  useResumeParser.ts            ← тонкая обёртка над use-case
  usePdfExport.ts               ← html2canvas + jsPDF
  useResumePreviewModel.ts
features/upload-resume/
  lib/
    pdf-extraction/          ← Stage 1: File → ExtractedPdfDocument
    normalization/           ← Stage 2: → NormalizedDocument (+stripFooterLines)
    profile-detection/       ← Stage 3: → ParserProfileDetectionResult
    section-classification/  ← Stage 4: → ClassifiedDocument
    entity-extraction/       ← Stage 5: → ExtractedResumeDraft
    confidence-scoring/      ← Stage 6: → ParseReview
    shared/                  ← regexes, aliases, language-maps, dates, heuristics, text-utils
  model/
    parse-resume-from-pdf.use-case.ts       ← оркестратор 7 стадий
    apply-confidence-fallback.use-case.ts   ← Stage 7: fallback decision
entities/resume/
  model/  types, factories, normalize, confidence (ParseBlockMetrics + ResumeBlockKey)
  lib/    selectors
  index.ts (barrel)
stores/    resume, locale, pdfMeta
types/     resume (реэкспорт), i18n
utils/     pdfTextNormalizer, pagination, parseDiff,
           parserFeatureFlags, socialLinks, dateHelpers, performanceBudget,
           pdfMetaDefaults, resumeTemplates, demoResume
assets/styles/  variables.scss, mixins.scss (глобально доступны)
```

Целевая FSD-раскладка описана в `docs/adr/0001-architecture-boundaries-and-shared-pagination.md` (`app / pages / widgets / features / entities / shared`). Реализованы слои `entities/resume/*` и `features/upload-resume/*` (7 стадий парсера + use-case). Миграция `views/` в `widgets/*` и прочие `utils/` — в долге.

### Поток данных

```
File (PDF)
  └─ ResumeUploader → useResumeParser.parseFile → parseResumeFromPdf (use-case)
       ├─ pdf-extraction        → ExtractedPdfDocument (pageTexts + annotationLinks + metadata)
       ├─ normalization         → NormalizedDocument (rawText + lines, stripFooterLines)
       ├─ profile-detection     → ParserProfileDetectionResult ('hh_ru' | 'en_cv' | 'generic')
       ├─ section-classification → ClassifiedDocument (sectionBuckets + explicitSectionBuckets)
       ├─ entity-extraction     → ExtractedResumeDraft (Partial<ResumeData>)
       ├─ (merge annotation links)
       ├─ confidence-scoring    → ParseReview (blocks + hasWarnings)
       ├─ apply-confidence-fallback  ← блоки с confidence=low не импортируются
       └─ buildParsedPdfMeta
         ↓
         ResumeStore.hydrateFromParsed  +  PdfMetaStore.hydrateFromParsed
         ↓
         ResumePreview (single source of truth — DOM с data-page-block)
         ↓
         measurePagedLayout(el)   ← общий движок пагинации
         ↓
         usePdfExport.exportPdf → html2canvas(clone) → jsPDF.addImage по страницам
```

### Ключевой инвариант пагинации (ADR-0001)

`utils/pagination.ts: measurePagedLayout` — **единственный источник** разбиения на страницы. Превью и экспорт оба его потребляют; повторная реализация в экспортёре запрещена. Движок чисто DOM-измерительный и опирается на атрибуты `data-page-block` / `data-page-block-kind` в разметке превью.

### Сторы

- `stores/resume.ts` — тонкий контейнер: `ref<ResumeData>` + CRUD-методы коллекций (`addWorkExperience`, `removeSkill` и т.д.); гидратация через `buildHydratedResumeData`.
- `stores/pdfMeta.ts` — state + watcher `syncFromResume` с защёлкой `synced`. Поле авто-заполняется только если оно пустое или совпадает с предыдущим авто-значением.
- `stores/locale.ts` — Ru/En i18n, `locale` / `t` / `setLocale`, side-эффект на `document.documentElement.lang`. Сейчас хранит полный словарь и доменные мэппинги (см. известные отклонения ниже).

## 4. Ключевые модули

### `features/upload-resume/`

Парсер резюме разнесён по 7 стадиям pipeline (см. `docs/parser-pipeline.md`). Каждая стадия — отдельный модуль с явным входным/выходным контрактом; стадии соединяет use-case `model/parse-resume-from-pdf.use-case.ts`, а `model/apply-confidence-fallback.use-case.ts` отвечает за Stage 7 (fallback decision).

- **Реальные профили в коде:** `ParserProfile = 'hh_ru' | 'en_cv' | 'generic'` (`lib/profile-detection`).
- **Что декларирует `docs/parser-pipeline.md`:** `single-column` / `two-column` / `dense-corporate` / `job-board-export`. Это рассинхрон доки и кода — один из источников правды устарел, решение тех-лида.
- Shared-helpers (regexes, aliases, dates, heuristics, text-utils, language-maps) лежат в `lib/shared/` и потребляются стадиями явными именованными импортами.

### `utils/pdfTextNormalizer.ts`

Восстанавливает порядок чтения и чинит склейки/разрывы слов из потока `pdfjs-dist`. Это вход парсера.

### `utils/pagination.ts`

`measurePagedLayout(root)` обходит элементы `[data-page-block]` внутри корневого узла и решает, переносить ли блок на следующую страницу. Реализован минимальный widow-control (связка heading + следующий блок). `keep-together` для многострочных записей (например, длинных вакансий) — **не реализован**, известное ограничение.

### `composables/useResumeParser.ts`

Тонкая обёртка над `features/upload-resume/model/parse-resume-from-pdf.use-case.ts` для Vue-стороны: держит ref-ы `parsing`/`error`, достаёт локаль и локализатор из стора и переводит исключения в сообщения. На пути pdfjs-аннотаций в `lib/pdf-extraction` используется `any` для объектов `pdf` / `annotation` — сознательное временное решение.

### `composables/usePdfExport.ts`

Клонирует узел превью в оффскрин-контейнер, растеризует через `html2canvas` (scale 2) и нарезает канвас в jsPDF по `pageStarts` из `measurePagedLayout`. Экспорт **растровый** (не текстовый): поисковый слой и ATS-читаемость обеспечиваются только встроенными метаданными (Title/Author/Subject/Keywords).

### `utils/socialLinks.ts`

Нормализация и отображение социальных ссылок. Набор типов: `Email | LinkedIn | Telegram | GitHub | Link`. `buildSocialLinkHref` выбирает схему (`mailto:` для Email, `https://` по умолчанию) и пропускает только allow-list безопасных протоколов (`http:`, `https:`, `mailto:`, `tel:`); всё остальное (`javascript:`, `data:`, `vbscript:`, `file:` и т.п.) сбрасывается в пустую строку, включая обфускации с управляющими символами в схеме.

### `components/preview/`

- `ResumePreview.vue` — активный шаблон (`classic`), подключён в `utils/resumeTemplates.ts`.
- `ModernResumePreview.vue` — **не зарегистрирован** в `RESUME_TEMPLATES`, UI-переключателя шаблонов в `BuilderView.vue` нет. Переводы `templateModern` лежат в `stores/locale.ts`. Формально мёртвый код / незавершённая фича.

## 5. Соглашения

- **Импорты:** через алиас `@/...`, относительные пути `../` не используем в новом коде.
- **Vue:** только Composition API + `<script setup lang="ts">`. Options API в проекте нет.
- **TS:** strict, без `any` в бизнес-логике (исключение — pdfjs-интероп, отмечен выше). Типы домена тянем из `entities/resume`.
- **Сторы:** Pinia setup-style (`defineStore('x', () => { … })`). Тонкие state-контейнеры, без оркестрации сторонних IO.
- **Стили:** SCSS, `variables` и `mixins` доступны глобально — не импортировать их вручную.
- **Пагинация:** любые изменения разметки превью должны сохранять разметку `data-page-block` / `data-page-block-kind`, иначе сломается экспорт.
- **i18n:** ключи через `t('…')` из `stores/locale`; два словаря Ru/En; язык документа синхронизируется сайд-эффектом стора.
- **PDF-импорт:** `pdfjs-dist` грузим только через `import('pdfjs-dist')` внутри `useResumeParser`, чтобы не утащить worker в main-bundle. `optimizeDeps.exclude` в `vite.config.ts` это подстраховывает.
- **Ветка docs:** источник правды по архитектуре — `docs/adr/0001-*.md`; по парсеру — `docs/parser-pipeline.md`; по тестам — `docs/testing-strategy.md`.

## 6. Окружение

- `node_modules` ставится `npm install` (есть `package-lock.json`).
- Скрипты: `npm run dev` (Vite dev), `npm run build` (`vue-tsc -b && vite build`), `npm run preview`.
- Переменные окружения Trello (для фазы генерации задач тех-лидом, не для самого приложения): `TRELLO_KEY`, `TRELLO_TOKEN`, `TRELLO_BOARD_ID`.

## 7. Известные отклонения от доки и долга

Этот раздел — короткий маркерный список; детали и задачи живут в `.tech-lead-history/*.md` и в трекере.

- Профили парсера в коде (`hh_ru` / `en_cv` / `generic`) не совпадают с `docs/parser-pipeline.md`.
- `stores/locale.ts` содержит полный словарь Ru/En и доменные мэпперы — противоречит «тонкому стору» из ADR-0001.
- `BuilderView.vue` совмещает page/widget/feature (ADR-0001 требует разделения).
- Тестов нет (отсутствует Vitest, фикстур-корпус из `docs/testing-strategy.md`).
- Нет ESLint / Prettier / CI / precommit-хуков.
- `ModernResumePreview.vue` существует, но нигде не используется.
- Ссылки в `README.md` и `docs/README.md` — абсолютные локальные пути с глифом `⛤`, не рабочие ни в гит-хостинге, ни на текущей машине (каталог теперь `xopa/`).

## 8. Артефакты

- ADR-0001 — `docs/adr/0001-architecture-boundaries-and-shared-pagination.md` (архитектурные границы и общий движок пагинации).
- `docs/parser-pipeline.md` — целевые стадии парсера и их контракты.
- `docs/testing-strategy.md` — целевая пирамида тестов и fixture-corpus.
- `.tech-lead-history/*.md` — неизменяемый журнал анализов тех-лида (самый свежий = последний по имени).
