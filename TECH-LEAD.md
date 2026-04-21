# Resumetor — Tech Lead Documentation

Живая техническая документация: стек, архитектура, соглашения, ключевые модули. Анализы и задачи сюда не кладём — они живут в `.tech-lead-history/*.md` и в Trello.

## 1. Что это

SPA-конструктор резюме. Полностью клиентский: импорт данных из PDF, редактирование формы, превью с пагинацией, экспорт PDF с метаданными. Бекенда нет, вся работа в браузере.

Точка входа: `index.html` → `src/main.ts` → `App.vue` → `src/router/` → `views/BuilderView.vue`.

## 2. Стек

| Слой                  | Выбор                                                                                                                                               |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Язык                  | TypeScript 5.9 (strict, `noUnusedLocals`, `noUnusedParameters`, `noUncheckedSideEffectImports`, `erasableSyntaxOnly`, `noFallthroughCasesInSwitch`) |
| Фреймворк             | Vue 3.5 (Composition API, `<script setup lang="ts">`)                                                                                               |
| Сборщик               | Vite 8 + `@vitejs/plugin-vue`                                                                                                                       |
| Стейт                 | Pinia 3 (setup-style сторы)                                                                                                                         |
| Роутер                | vue-router 4 (одна страница `/`)                                                                                                                    |
| Утилиты               | `@vueuse/core` 14 (`useLocalStorage`, `useResizeObserver`)                                                                                          |
| PDF ввод              | `pdfjs-dist` 5 (ленивый `import()`, исключён из `optimizeDeps`)                                                                                     |
| PDF вывод             | `html2canvas` 1.4 + `jspdf` 4 (растровый экспорт)                                                                                                   |
| Стили                 | SCSS, глобально подмешиваются `variables` и `mixins` через `vite.config.ts`                                                                         |
| Алиасы                | `@/*` → `src/*`                                                                                                                                     |
| Type-check при сборке | `vue-tsc -b` перед `vite build`                                                                                                                     |

Подключено: ESLint 9 (flat config, `eslint-plugin-vue`, `typescript-eslint`, `eslint-plugin-import`), Prettier 3, pre-commit через `simple-git-hooks` + `lint-staged`, GitHub Actions CI (install → lint + format:check → typecheck → build).

Не подключено: stylelint, Vitest, Playwright.

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
  useResumeParser.ts            ← оркестрация парсинга PDF
  usePdfExport.ts               ← html2canvas + jsPDF
  useResumePreviewModel.ts
entities/resume/
  model/  types, factories, normalize, confidence
  lib/    selectors
  index.ts (barrel)
stores/    resume, locale, pdfMeta
types/     resume (реэкспорт), i18n
utils/     parseTextToResume, pdfTextNormalizer, pagination, parseDiff,
           parserFeatureFlags, socialLinks, dateHelpers, performanceBudget,
           pdfMetaDefaults, resumeTemplates, demoResume
assets/styles/  variables.scss, mixins.scss (глобально доступны)
```

Целевая FSD-раскладка описана в `docs/adr/0001-architecture-boundaries-and-shared-pagination.md` (`app / pages / widgets / features / entities / shared`). Из неё выполнен только слой `entities/resume/*`. Миграция `utils/` и `views/` в `features/*` и `widgets/*` — в долге.

### Поток данных

```
File (PDF)
  └─ ResumeUploader → useResumeParser.parseFile
       ├─ extractPdfData (pdfjs-dist, lazy)
       │     normalizePdfPageText(items, width)
       │     extractHeaderPersonalInfo (аннотации + верхняя 25% страницы)
       │     extractPdfMetadata (Title/Author/Subject/Keywords)
       ├─ parseTextToResumeDetailed  ← секции + сущности + метрики
       ├─ buildPersonalMetrics / toConfidenceLevel / buildConfidenceNote
       ├─ applyConfidenceFallback   ← блоки с confidence=low не импортируются
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

### `utils/parseTextToResume.ts`

Эвристический парсер текста, извлечённого из PDF. Определяет профиль источника и раскладывает текст по секциям резюме.

- **Реальные профили в коде:** `ParserProfile = 'hh_ru' | 'en_cv' | 'generic'` (см. `detectParserProfile`).
- **Что декларирует `docs/parser-pipeline.md`:** `single-column` / `two-column` / `dense-corporate` / `job-board-export`. Это рассинхрон доки и кода — один из источников правды устарел, решение тех-лида.
- Входной контракт — список нормализованных строк; выход — `ResumeData` + метрики confidence по блокам.

Файл монолитный. `docs/parser-pipeline.md` описывает разбивку на 7 стадий с отдельными контрактами — миграция запланирована, но пока не выполнена.

### `utils/pdfTextNormalizer.ts`

Восстанавливает порядок чтения и чинит склейки/разрывы слов из потока `pdfjs-dist`. Это вход парсера.

### `utils/pagination.ts`

`measurePagedLayout(root)` обходит элементы `[data-page-block]` внутри корневого узла и решает, переносить ли блок на следующую страницу. Реализован минимальный widow-control (связка heading + следующий блок). `keep-together` для многострочных записей (например, длинных вакансий) — **не реализован**, известное ограничение.

### `composables/useResumeParser.ts`

Оркестрирует парсинг: читает PDF через `pdfjs-dist`, тянет аннотации и метаданные, вызывает парсер, формирует confidence-note. На пути pdfjs-аннотаций используется `any` для объектов `pdf` / `annotation` — сознательное временное решение.

### `composables/usePdfExport.ts`

Клонирует узел превью в оффскрин-контейнер, растеризует через `html2canvas` (scale 2) и нарезает канвас в jsPDF по `pageStarts` из `measurePagedLayout`. Экспорт **растровый** (не текстовый): поисковый слой и ATS-читаемость обеспечиваются только встроенными метаданными (Title/Author/Subject/Keywords).

### `utils/socialLinks.ts`

Нормализация и отображение социальных ссылок. Набор типов: `Email | LinkedIn | Telegram | GitHub | Link`. `buildSocialLinkHref` выбирает схему (`mailto:` для Email, `https://` по умолчанию). Пропускает значение с любой уже префиксованной схемой — см. известные отклонения.

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
- `utils/parseTextToResume.ts` — монолит, не разбит по стадиям из `docs/parser-pipeline.md`.
- `stores/locale.ts` содержит полный словарь Ru/En и доменные мэпперы — противоречит «тонкому стору» из ADR-0001.
- `BuilderView.vue` совмещает page/widget/feature (ADR-0001 требует разделения).
- Тестов нет (отсутствует Vitest, фикстур-корпус из `docs/testing-strategy.md`).
- `buildSocialLinkHref` пропускает любую схему вида `^[a-z]+:` — open-redirect/XSS-вектор через `<a :href>` в превью.
- `ModernResumePreview.vue` существует, но нигде не используется.
- Ссылки в `README.md` и `docs/README.md` — абсолютные локальные пути с глифом `⛤`, не рабочие ни в гит-хостинге, ни на текущей машине (каталог теперь `xopa/`).

## 8. Артефакты

- ADR-0001 — `docs/adr/0001-architecture-boundaries-and-shared-pagination.md` (архитектурные границы и общий движок пагинации).
- `docs/parser-pipeline.md` — целевые стадии парсера и их контракты.
- `docs/testing-strategy.md` — целевая пирамида тестов и fixture-corpus.
- `.tech-lead-history/*.md` — неизменяемый журнал анализов тех-лида (самый свежий = последний по имени).
