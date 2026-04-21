const { execSync, exec } = require('child_process');
const { writeFileSync, readFileSync, existsSync } = require('fs');
const { tmpdir } = require('os');
const path = require('path');

const RULES_DIR = path.join(__dirname, '..', 'rules');
const COMPACT_DIR = path.join(RULES_DIR, 'compact');

function loadRules(files, { compact = true } = {}) {
  const dir = compact ? COMPACT_DIR : RULES_DIR;
  return files
    .map(f => {
      const p = path.join(dir, f);
      return existsSync(p) ? readFileSync(p, 'utf8') : '';
    })
    .filter(Boolean)
    .join('\n\n---\n\n');
}

let claudePath = 'claude';

try {
  claudePath = execSync('which claude', { encoding: 'utf8' }).trim();
} catch {
  console.warn('claude not found in PATH, falling back to "claude"');
}

function shQuote(s) {
  return `'${String(s).replace(/'/g, `'\\''`)}'`;
}

function openTerminalWithScript(cmd) {
  const scriptPath = path.join(tmpdir(), `ai-dashboard-${Date.now()}.sh`);
  writeFileSync(scriptPath, `#!/bin/bash\n${cmd}\n`, { mode: 0o755 });

  const appleScript = `tell application "Terminal"
  do script "bash '${scriptPath}'"
  activate
end tell`;

  exec(`osascript << 'EOF'\n${appleScript}\nEOF`, (err) => {
    if (err) console.error('AppleScript error:', err.message);
  });
}

function buildEnv({ youtrackToken, youtrackUrl, figmaToken, trelloKey, trelloToken, trelloBoardId } = {}) {
  const vars = [];
  const yt = youtrackToken || process.env.YOUTRACK_TOKEN;
  const ytUrl = youtrackUrl || process.env.YOUTRACK_URL;
  const figma = figmaToken || process.env.FIGMA_TOKEN;
  const tKey = trelloKey || process.env.TRELLO_KEY;
  const tToken = trelloToken || process.env.TRELLO_TOKEN;
  const tBoard = trelloBoardId || process.env.TRELLO_BOARD_ID;
  if (yt) vars.push(`YOUTRACK_TOKEN=${shQuote(yt)}`);
  if (ytUrl) vars.push(`YOUTRACK_URL=${shQuote(ytUrl)}`);
  if (figma) vars.push(`FIGMA_TOKEN=${shQuote(figma)}`);
  if (tKey) vars.push(`TRELLO_KEY=${shQuote(tKey)}`);
  if (tToken) vars.push(`TRELLO_TOKEN=${shQuote(tToken)}`);
  if (tBoard) vars.push(`TRELLO_BOARD_ID=${shQuote(tBoard)}`);
  return vars.join(' ');
}

const CACHE_SUBDIR = '.ai-cache';

function taskAnalysisPath(projectPath, taskId) {
  return path.join(projectPath, CACHE_SUBDIR, 'tasks', `${taskId}.md`);
}

function taskAnalysisDir(projectPath) {
  return path.join(projectPath, CACHE_SUBDIR, 'tasks');
}

function figmaCacheDir(projectPath) {
  return path.join(projectPath, CACHE_SUBDIR, 'figma');
}

function figmaCacheNote(projectPath) {
  const dir = figmaCacheDir(projectPath);
  return `Если в задаче есть ссылка на Figma: извлеки fileKey из URL и проверь ${dir}/{fileKey}.md — если файл существует и младше 24 часов, используй его вместо повторного запроса к Figma API. Иначе — изучи макет через Figma API (X-Figma-Token: $FIGMA_TOKEN) и сохрани разбор в ${dir}/{fileKey}.md (создай директорию если нужно).`;
}

function trackerReadNote(tracker, taskUrl) {
  if (tracker === 'trello') {
    return `Открой задачу по ссылке ${taskUrl} — это карточка Trello. Извлеки shortLink из URL (/c/{shortLink}). Данные бери через Trello REST API: GET https://api.trello.com/1/cards/{shortLink}?key=$TRELLO_KEY&token=$TRELLO_TOKEN&fields=name,desc,url для описания и GET https://api.trello.com/1/cards/{shortLink}/actions?key=$TRELLO_KEY&token=$TRELLO_TOKEN&filter=commentCard для комментариев. YouTrack API здесь не применим.`;
  }
  return `Открой задачу по ссылке ${taskUrl} — это тикет YouTrack. Данные бери через YouTrack REST API (Authorization: Bearer $YOUTRACK_TOKEN, база $YOUTRACK_URL): GET /api/issues/{id}?fields=summary,description,comments(text,author(login),created). Trello API здесь не применим.`;
}

function completionNote(tracker, taskId, taskUrl) {
  const notReadyGuard = `Если работа НЕ завершена (остались TODO, падают тесты, есть вопросы к пользователю) — НЕ коммить, НЕ пушь, НЕ переноси задачу. Просто сообщи что осталось.`;
  const gitSteps = (idPlaceholder) => `a) Проверь статус: \`git status --porcelain\`. Если нет изменений — значит коммитить нечего, сообщи об этом и пропусти пуш.
b) Добавь все изменения и сделай коммит по правилам commits.md: \`git add -A && git commit -m "<тип>(${idPlaceholder}): <краткое описание>"\`. Если задача требует несколько логически разных коммитов — делай их по очереди, каждый со своим сообщением. Никаких \`wip\`/\`fix\`/\`update\` — всегда осмысленное сообщение.
c) Запушь: \`git push -u origin HEAD\` (работает и когда upstream уже настроен, и когда ветки ещё нет в origin).
d) Если коммит или пуш упал — сообщи что именно сломалось (вывод git), карточку НЕ переноси.`;

  if (tracker === 'trello') {
    return `Работа реально завершена — делаешь коммит, пуш, и переносишь карточку в колонку «На тестировании».

Для коммита ID задачи — shortLink из URL карточки ${taskUrl}: кусок между \`/c/\` и следующим \`/\` (например, \`https://trello.com/c/abc123xy/...\` → \`abc123xy\`).

${gitSteps('<shortLink>')}
e) Получи колонки доски: \`curl -s "https://api.trello.com/1/boards/$TRELLO_BOARD_ID/lists?key=$TRELLO_KEY&token=$TRELLO_TOKEN"\`.
f) Найди колонку с именем «На тестировании» (регистр не важен, но текст должен совпадать). Возьми её id.
g) Перемести карточку: \`curl -s -X PUT "https://api.trello.com/1/cards/${taskId}?idList={testingListId}&key=$TRELLO_KEY&token=$TRELLO_TOKEN"\`.
h) Если колонки «На тестировании» нет — сообщи об этом, карточку НЕ трогай.

${notReadyGuard}`;
  }

  return `Работа реально завершена — делаешь коммит, пуш, и переводишь задачу в статус «На тестировании» в YouTrack.

${gitSteps(taskId)}
e) Получи список возможных значений State для этой задачи: \`curl -s -H "Authorization: Bearer $YOUTRACK_TOKEN" "$YOUTRACK_URL/api/issues/${taskId}?fields=customFields(name,value(name),projectCustomField(bundle(values(name))))"\`.
f) Найди значение «На тестировании» (регистр не важен, но текст должен совпадать).
g) Обнови State: \`curl -s -X POST -H "Authorization: Bearer $YOUTRACK_TOKEN" -H "Content-Type: application/json" "$YOUTRACK_URL/api/issues/${taskId}?fields=customFields(name,value(name))" -d '{"customFields":[{"name":"State","\\$type":"SingleEnumIssueCustomField","value":{"name":"На тестировании"}}]}'\`.
h) Если значения «На тестировании» нет в списке — сообщи об этом, статус НЕ меняй.

${notReadyGuard}`;
}

function getSpecialistFromCache(projectPath, taskId) {
  const p = taskAnalysisPath(projectPath, taskId);
  if (!existsSync(p)) return null;
  const content = readFileSync(p, 'utf8');
  const m = content.match(/^\s*(?:[-*]\s*)?Специалист\s*:\s*(frontend|backend|fullstack)\b/im);
  return m ? m[1].toLowerCase() : null;
}

function rulesForSpecialist(specialist) {
  if (specialist === 'frontend') return ['frontend.md', 'qa.md', 'commits.md'];
  if (specialist === 'backend') return ['backend.md', 'qa.md', 'commits.md'];
  return ['frontend.md', 'backend.md', 'qa.md', 'commits.md']; // fullstack / unknown
}

function readTask({ taskId, taskUrl, projectPath, extraPrompt, tracker, youtrackToken, youtrackUrl, figmaToken, trelloKey, trelloToken, trelloBoardId }) {
  const extra = extraPrompt ? `\n\nДоп. инструкции от разработчика: ${extraPrompt}` : '';
  const rules = loadRules(['pm.md']);
  const rulesBlock = rules ? `\n\nПравила PM (строго соблюдай):\n${rules}` : '';
  const analysisFile = taskAnalysisPath(projectPath, taskId);
  const prompt = `Ты проводишь анализ задачи, код не пишешь.

${trackerReadNote(tracker, taskUrl)}

Прочитай описание задачи и все комментарии. ${figmaCacheNote(projectPath)}

Затем коротко изложи:
1. Что нужно сделать по задаче.
2. Что говорят в комментариях (особенно тестировщик).
3. Если есть Figma — что в макете.
4. Что ты планируешь сделать.
5. К какой области относится задача: frontend | backend | fullstack.

В конце сохрани полный анализ в ${analysisFile} (создай директорию если нужно). В конце файла отдельной строкой добавь: \`Специалист: frontend | backend | fullstack\` (ровно одно значение, латиница нижнего регистра) — эту строку потом читает бэкенд дашборда.${extra}${rulesBlock}`;

  const env = buildEnv({ youtrackToken, youtrackUrl, figmaToken, trelloKey, trelloToken, trelloBoardId });
  const cmd = `cd ${shQuote(projectPath)} && ${env} ${shQuote(claudePath)} --model haiku ${shQuote(prompt)}`;
  openTerminalWithScript(cmd);
}

function writeCode({ taskId, taskUrl, projectPath, extraPrompt, tracker, youtrackToken, youtrackUrl, figmaToken, trelloKey, trelloToken, trelloBoardId }) {
  const extra = extraPrompt ? `\n\nДоп. инструкции от разработчика: ${extraPrompt}` : '';
  const specialist = getSpecialistFromCache(projectPath, taskId);
  const rules = loadRules(rulesForSpecialist(specialist));
  const rulesBlock = rules ? `\n\nПравила разработки (строго соблюдай):\n${rules}` : '';
  const specialistLine = specialist
    ? `Задача помечена как **${specialist}** — работай в соответствии с правилами этой роли.`
    : `Специалист не определён — работай как fullstack.`;
  const analysisFile = taskAnalysisPath(projectPath, taskId);

  const prompt = `Задача ${taskId}. Ветка — ${taskId}. ${specialistLine}

1. Переключись на ветку ${taskId}. Если её нет — создай от main/master.
2. Прочитай ${analysisFile} — там готовый анализ задачи. Если файла нет — ${trackerReadNote(tracker, taskUrl)}
3. ${figmaCacheNote(projectPath)}
4. Выполни задачу: код, вёрстка, правки — что требуется.
5. В конце — перечисли что сделал и какие файлы изменил.
6. ${completionNote(tracker, taskId, taskUrl)}${extra}${rulesBlock}`;

  const env = buildEnv({ youtrackToken, youtrackUrl, figmaToken, trelloKey, trelloToken, trelloBoardId });
  const cmd = `cd ${shQuote(projectPath)} && ${env} ${shQuote(claudePath)} ${shQuote(prompt)}`;
  openTerminalWithScript(cmd);
}

function analyzeProject({ projectPath, youtrackToken, youtrackUrl, figmaToken, trelloKey, trelloToken, trelloBoardId }) {
  const rules = loadRules(['tech-lead.md']);
  const rulesBlock = rules ? `\n\nПравила тех. лида (строго соблюдай):\n${rules}` : '';
  const historyDir = path.join(projectPath, '.tech-lead-history');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const historyFile = path.join(historyDir, `${timestamp}.md`);
  const docFile = path.join(projectPath, 'TECH-LEAD.md');
  const dismissedFile = path.join(projectPath, '.tech-lead-dismissed.json');

  const prompt = `Ты — технический лид. Trello не трогай (задачи создаёт разработчик из UI).

Артефакты:
- ${docFile} — живая техдока.
- ${historyDir}/*.md — неизменяемый журнал. Прошлые файлы не редактируй.
- ${historyFile} — новый отчёт за этот запуск.
- ${dismissedFile} — JSON отклонённых задач. Не предлагай их повторно.

## Шаг 0 — Short-circuit (обязательно первым делом, экономит токены)
1. Найди последний по имени файл в ${historyDir}.
2. Если его нет — иди к шагу 1.
3. Если он есть — проверь через git: \`git log -1 --format=%cI\` (время последнего коммита) vs timestamp отчёта из имени файла; и \`git status --porcelain\`.
4. Если последний коммит старше отчёта И \`git status\` чистый — состояние не изменилось. Создай ${historyFile} с ОДНОЙ строкой: \`Состояние не изменилось с <timestamp предыдущего отчёта>\` и ВЫЙДИ. Не читай код, не обновляй ${docFile}, не генерируй задачи.

## Шаг 1 — Контекст
Прочитай ${docFile} (если есть), CLAUDE.md, последние 1-2 файла из ${historyDir}, ${dismissedFile}.

## Шаг 2 — Анализ
- ${docFile} нет → проанализируй код с нуля, напиши ${docFile}: стек, архитектура, зависимости, соглашения, раздел «Тесты» (инструменты, когда обязательны).
- ${docFile} есть → сверь код с докой. Обнови ${docFile} точечно при расхождениях. Проверь, что раздел «Тесты» (или ссылка на TESTING.md) есть и актуален.

## Шаг 3 — Отчёт
Сохрани в ${historyFile}: резюме, что проверил, дельту относительно прошлого отчёта, секцию «Предлагаемые задачи» в формате:

### [Tech Debt] <короткое название>
- Что нарушено: ...
- Как исправить: ...
- Специалист: frontend | backend | fullstack
- Срочность: критическая | высокая | средняя | низкая

Парсер строгий, формат не менять. Задачи из ${dismissedFile} не включай.${rulesBlock}`;

  const env = buildEnv({ youtrackToken, youtrackUrl, figmaToken, trelloKey, trelloToken, trelloBoardId });
  const cmd = `cd ${shQuote(projectPath)} && ${env} ${shQuote(claudePath)} ${shQuote(prompt)}`;
  openTerminalWithScript(cmd);
}

function pmAnalyze({ projectPath, youtrackToken, youtrackUrl, figmaToken, trelloKey, trelloToken, trelloBoardId }) {
  const rules = loadRules(['pm.md']);
  const rulesBlock = rules ? `\n\nПравила PM (строго соблюдай):\n${rules}` : '';
  const historyDir = path.join(projectPath, '.pm-history');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const historyFile = path.join(historyDir, `${timestamp}.md`);
  const docFile = path.join(projectPath, 'PM.md');
  const dismissedFile = path.join(projectPath, '.pm-dismissed.json');

  const prompt = `Ты — продуктовый менеджер. Смотришь продукт глазами пользователя. Trello не трогай.

Артефакты:
- ${docFile} — живая продуктовая дока.
- ${historyDir}/*.md — неизменяемый журнал. Прошлые файлы не редактируй.
- ${historyFile} — новый отчёт за этот запуск.
- ${dismissedFile} — JSON отклонённых задач. Не предлагай их повторно.

## Шаг 0 — Short-circuit (обязательно первым)
Найди последний файл в ${historyDir}. Если он есть и в продукте ничего видимо не изменилось с его timestamp — создай ${historyFile} с ОДНОЙ строкой \`Состояние не изменилось с <prev_ts>\` и выйди.

## Шаг 1 — Контекст
Прочитай ${docFile} (если есть), CLAUDE.md, TECH-LEAD.md (без техдеталей), последние 1-2 файла ${historyDir}, ${dismissedFile}.

## Шаг 2 — Анализ
- ${docFile} нет → пройди по продукту глазами пользователя. Напиши ${docFile}: целевой пользователь, сценарии, ценность, ограничения.
- ${docFile} есть → сверь реальное поведение с докой. Обнови ${docFile} точечно при расхождениях.

## Шаг 3 — Отчёт
${historyFile}: резюме, что проверял, дельта, найденные UX-пробелы, секция «Предлагаемые задачи»:

### <глагол + результат для пользователя, без префиксов>
- Что нужно сделать: ...
- Зачем: ...
- Критерии готовности: ...
- Специалист: frontend | backend | fullstack
- Срочность: критическая | высокая | средняя | низкая

Парсер строгий. Задачи из ${dismissedFile} не включай.${rulesBlock}`;

  const env = buildEnv({ youtrackToken, youtrackUrl, figmaToken, trelloKey, trelloToken, trelloBoardId });
  const cmd = `cd ${shQuote(projectPath)} && ${env} ${shQuote(claudePath)} ${shQuote(prompt)}`;
  openTerminalWithScript(cmd);
}

module.exports = { readTask, writeCode, analyzeProject, pmAnalyze, taskAnalysisPath };
