const { execSync, exec } = require('child_process');
const { writeFileSync, readFileSync, existsSync, mkdirSync } = require('fs');
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

function openTerminalWithScript(cmd, { autoCloseOnSuccess = false } = {}) {
  const scriptPath = path.join(tmpdir(), `ai-dashboard-${Date.now()}.sh`);

  // На анализе пользователь не должен следить за десятью открытыми окнами:
  // если команда завершилась успешно — закрываем окно Terminal через AppleScript,
  // находя его по tty селект-таба. На ошибке окно остаётся, чтобы можно было разобраться.
  // Heredoc без кавычек вокруг разделителя — bash подставит $TTY_DEV в AppleScript.
  const closeBlock = autoCloseOnSuccess
    ? `\nRC=$?\nTTY_DEV=$(tty)\nif [ $RC -eq 0 ]; then\n  /usr/bin/osascript <<APPLESCRIPT_EOF >/dev/null 2>&1\ntell application "Terminal"\n  repeat with w in windows\n    try\n      if tty of selected tab of w is "$TTY_DEV" then\n        close w saving no\n        exit repeat\n      end if\n    end try\n  end repeat\nend tell\nAPPLESCRIPT_EOF\nfi\nexit $RC\n`
    : '\n';

  writeFileSync(scriptPath, `#!/bin/bash\n${cmd}${closeBlock}`, { mode: 0o755 });

  // Не вызываем activate — Terminal не выходит на передний план.
  // Сразу свернули окно: оно есть в Dock на случай ошибки, но в глаза не лезет.
  const appleScript = `tell application "Terminal"
  do script "bash '${scriptPath}'"
  delay 0.05
  try
    set miniaturized of front window to true
  end try
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

function figmaCacheNote(projectPath, figmaUrl) {
  const dir = figmaCacheDir(projectPath);
  if (figmaUrl) {
    return `Изучи макет по ссылке: ${figmaUrl} (она задана разработчиком явно — это приоритетный источник, ссылки в задаче можно игнорировать). Извлеки fileKey из URL и проверь ${dir}/{fileKey}.md — если файл существует и младше 24 часов, используй его вместо повторного запроса к Figma API. Иначе — фетчни через Figma API (X-Figma-Token: $FIGMA_TOKEN) и сохрани разбор в ${dir}/{fileKey}.md (создай директорию если нужно).`;
  }
  return `Если в задаче есть ссылка на Figma: извлеки fileKey из URL и проверь ${dir}/{fileKey}.md — если файл существует и младше 24 часов, используй его вместо повторного запроса к Figma API. Иначе — изучи макет через Figma API (X-Figma-Token: $FIGMA_TOKEN) и сохрани разбор в ${dir}/{fileKey}.md (создай директорию если нужно).`;
}

function trackerReadNote(tracker, taskUrl) {
  if (tracker === 'trello') {
    return `Открой задачу по ссылке ${taskUrl} — это карточка Trello. Извлеки shortLink из URL (/c/{shortLink}). Данные бери через Trello REST API: GET https://api.trello.com/1/cards/{shortLink}?key=$TRELLO_KEY&token=$TRELLO_TOKEN&fields=name,desc,url для описания и GET https://api.trello.com/1/cards/{shortLink}/actions?key=$TRELLO_KEY&token=$TRELLO_TOKEN&filter=commentCard для комментариев. YouTrack API здесь не применим.`;
  }
  return `Открой задачу по ссылке ${taskUrl} — это тикет YouTrack. Данные бери через YouTrack REST API (Authorization: Bearer $YOUTRACK_TOKEN, база $YOUTRACK_URL): GET /api/issues/{id}?fields=summary,description,comments(text,author(login),created). Trello API здесь не применим.`;
}

function completionNote(tracker, taskId, taskUrl, { autoCommit, autoMoveTask }) {
  const notReadyGuard = `Если работа НЕ завершена (остались TODO, падают тесты, есть вопросы к пользователю) — НЕ коммить, НЕ пушь, НЕ переноси задачу. Просто сообщи что осталось.`;

  // Полностью ручной режим — самый частый кейс на работе.
  if (!autoCommit && !autoMoveTask) {
    return `Работа сделана. **НЕ** делай \`git add\`/\`git commit\`/\`git push\` и **НЕ** переноси задачу в трекере — это сделает разработчик сам после ревью.

В конце дай короткий отчёт:
- Что было сделано (1-3 предложения).
- Какие файлы изменены (полные пути от корня worktree).
- Что разработчику стоит проверить перед коммитом (нюансы, побочные эффекты, что протестировать).

Изменения лежат в текущей рабочей копии (git worktree). Разработчик сам сделает \`git add\`/\`git commit\`/\`git push\` и сам перенесёт задачу в трекере.

${notReadyGuard}`;
  }

  const commitSteps = `Коммит и пуш:
a) Проверь статус: \`git status --porcelain\`. Если нет изменений — значит коммитить нечего, сообщи об этом и пропусти пуш.
b) Добавь все изменения и сделай коммит по правилам commits.md: \`git add -A && git commit -m "<тип>(${tracker === 'trello' ? '<shortLink>' : taskId}): <краткое описание>"\`. Если задача требует несколько логически разных коммитов — делай их по очереди, каждый со своим сообщением. Никаких \`wip\`/\`fix\`/\`update\` — всегда осмысленное сообщение.
c) Запушь: \`git push -u origin HEAD\`.
d) Если коммит или пуш упал — сообщи что именно сломалось (вывод git), задачу НЕ переноси.`;

  const trelloMoveSteps = `Перенос карточки в «На тестировании»:
- Получи колонки доски: \`curl -s "https://api.trello.com/1/boards/$TRELLO_BOARD_ID/lists?key=$TRELLO_KEY&token=$TRELLO_TOKEN"\`.
- Найди колонку с именем «На тестировании» (регистр не важен, текст должен совпадать). Возьми её id.
- Перемести карточку: \`curl -s -X PUT "https://api.trello.com/1/cards/${taskId}?idList={testingListId}&key=$TRELLO_KEY&token=$TRELLO_TOKEN"\`.
- Если колонки «На тестировании» нет — сообщи, карточку НЕ трогай.`;

  const ytMoveSteps = `Перевод задачи в статус «На тестировании»:
- Получи список значений State: \`curl -s -H "Authorization: Bearer $YOUTRACK_TOKEN" "$YOUTRACK_URL/api/issues/${taskId}?fields=customFields(name,value(name),projectCustomField(bundle(values(name))))"\`.
- Найди значение «На тестировании» (регистр не важен).
- Обнови State: \`curl -s -X POST -H "Authorization: Bearer $YOUTRACK_TOKEN" -H "Content-Type: application/json" "$YOUTRACK_URL/api/issues/${taskId}?fields=customFields(name,value(name))" -d '{"customFields":[{"name":"State","\\$type":"SingleEnumIssueCustomField","value":{"name":"На тестировании"}}]}'\`.
- Если значения «На тестировании» нет — сообщи, статус НЕ меняй.`;

  const moveSteps = tracker === 'trello' ? trelloMoveSteps : ytMoveSteps;

  let intro;
  const sections = [];
  if (autoCommit && autoMoveTask) {
    intro = `Работа реально завершена — делаешь коммит, пуш и переносишь задачу в «На тестировании».`;
    if (tracker === 'trello') {
      intro += `\n\nДля коммита ID задачи — shortLink из URL карточки ${taskUrl}: кусок между \`/c/\` и следующим \`/\`.`;
    }
    sections.push(commitSteps, moveSteps);
  } else if (autoCommit) {
    intro = `Работа реально завершена — делаешь коммит и пуш. Задачу в трекере НЕ переноси, разработчик сделает это сам.`;
    if (tracker === 'trello') {
      intro += `\n\nДля коммита ID задачи — shortLink из URL карточки ${taskUrl}: кусок между \`/c/\` и следующим \`/\`.`;
    }
    sections.push(commitSteps);
  } else {
    // !autoCommit && autoMoveTask
    intro = `Работа реально завершена. Коммит и пуш НЕ делай — это сделает разработчик. После того как опишешь что сделано — перенеси задачу в «На тестировании».`;
    sections.push(moveSteps);
  }

  return `${intro}

${sections.join('\n\n')}

${notReadyGuard}`;
}

// Каждая задача получает свой git worktree — несколько Claude могут работать параллельно,
// не перебивая рабочую копию друг друга. .git общий, дублируются только файлы рабочего дерева.
function worktreePath(projectPath, taskId) {
  const parent = path.dirname(projectPath);
  const base = path.basename(projectPath);
  return path.join(parent, `${base}-ai-worktrees`, taskId);
}

function resolveDefaultBranch(projectPath) {
  try {
    const head = execSync('git symbolic-ref refs/remotes/origin/HEAD', {
      cwd: projectPath,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return head.replace(/^refs\/remotes\/origin\//, '');
  } catch {
    for (const candidate of ['main', 'master']) {
      try {
        execSync(`git show-ref --verify --quiet refs/heads/${candidate}`, {
          cwd: projectPath,
          stdio: 'ignore',
        });
        return candidate;
      } catch {}
    }
    return 'main';
  }
}

function branchExists(projectPath, name) {
  try {
    execSync(`git show-ref --verify --quiet refs/heads/${name}`, {
      cwd: projectPath,
      stdio: 'ignore',
    });
    return true;
  } catch {
    return false;
  }
}

function ensureWorktree(projectPath, taskId) {
  const wt = worktreePath(projectPath, taskId);
  if (existsSync(wt)) return wt;

  // Чистим мёртвые записи прошлых worktree (если папки нет, но git о них помнит)
  try {
    execSync('git worktree prune', { cwd: projectPath, stdio: 'ignore' });
  } catch {}

  mkdirSync(path.dirname(wt), { recursive: true });

  const defaultBranch = resolveDefaultBranch(projectPath);
  const cmd = branchExists(projectPath, taskId)
    ? `git worktree add ${shQuote(wt)} ${shQuote(taskId)}`
    : `git worktree add -b ${shQuote(taskId)} ${shQuote(wt)} ${shQuote(defaultBranch)}`;
  execSync(cmd, { cwd: projectPath, stdio: 'pipe' });
  return wt;
}

function readAnalysis(projectPath, taskId) {
  const p = taskAnalysisPath(projectPath, taskId);
  if (!existsSync(p)) return null;
  return readFileSync(p, 'utf8');
}

function getSpecialistFromCache(projectPath, taskId) {
  const content = readAnalysis(projectPath, taskId);
  if (!content) return null;
  const m = content.match(/^\s*(?:[-*]\s*)?Специалист\s*:\s*(frontend|backend|fullstack)\b/im);
  return m ? m[1].toLowerCase() : null;
}

function getComplexityFromCache(projectPath, taskId) {
  const content = readAnalysis(projectPath, taskId);
  if (!content) return null;
  const m = content.match(/^\s*(?:[-*]\s*)?Сложность\s*:\s*(simple|medium|complex)\b/im);
  return m ? m[1].toLowerCase() : null;
}

// commits.md нужен всегда — Claude в конце делает коммит/пуш.
// qa.md — только для medium/complex, на простые задачи чек-лист избыточен.
function rulesForSpecialist(specialist, complexity) {
  const base = specialist === 'frontend' ? ['frontend.md']
             : specialist === 'backend' ? ['backend.md']
             : ['frontend.md', 'backend.md'];
  const withQa = complexity === 'simple' ? base : [...base, 'qa.md'];
  return [...withQa, 'commits.md'];
}

// Выбор модели по сложности: простые задачи — на дешёвой Haiku, средние — Sonnet,
// сложные — дефолтная (самая сильная доступная).
function modelFlagForComplexity(complexity) {
  if (complexity === 'simple') return '--model haiku';
  if (complexity === 'medium') return '--model sonnet';
  return '';
}

function readTask({ taskId, taskUrl, projectPath, extraPrompt, figmaUrl, tracker, youtrackToken, youtrackUrl, figmaToken, trelloKey, trelloToken, trelloBoardId }) {
  const extra = extraPrompt ? `\n\nДоп. инструкции от разработчика: ${extraPrompt}` : '';
  const rules = loadRules(['pm.md']);
  const rulesBlock = rules ? `\n\nПравила PM (строго соблюдай):\n${rules}` : '';
  const analysisFile = taskAnalysisPath(projectPath, taskId);
  const prompt = `Ты проводишь анализ задачи, код НЕ пишешь. Цель — собрать всё, что нужно следующему запуску, чтобы он сразу начал писать, не исследуя заново.

${trackerReadNote(tracker, taskUrl)}

Прочитай описание задачи и все комментарии. ${figmaCacheNote(projectPath, figmaUrl)}

Дальше быстро сориентируйся в коде проекта — не читай всё подряд, только:
- структура папок (\`ls\`, tree на 2 уровня),
- \`package.json\` / entry-файлы (main, index, App),
- модули/компоненты, связанные с темой задачи по названиям (grep по ключевым словам из задачи).

Составь анализ в таком виде (разделы ровно в этом порядке):

## 1. Суть задачи
Короткое изложение того, что надо сделать, с точки зрения пользователя.

## 2. Что говорят в комментариях
Ключевое из обсуждения. Особенно — последний комментарий тестировщика/проверяющего.

## 3. Figma (если есть)
Что в макете, какие экраны, поведение. Если макета нет — пропусти раздел.

## 4. План действий
3-5 буллетов: что делать по шагам. Конкретно, не «разобраться с X» — «вынести fetch в composable, подключить в TaskCard, показать loading-state».

## 5. Ключевые файлы
Список путей, которые скорее всего будут затронуты. Формат:
- \`frontend/src/components/TaskCard.vue\` — UI карточки, туда добавляем кнопку.
- \`backend/server.js\` — роут \`/api/...\`, туда вешаем обработчик.

Путь + 1 строка зачем. 3-10 файлов. Не включай файлы, которые точно не будут меняться (тесты можно упомянуть отдельно если есть).

## 6. Риски и нюансы
Коротко: что может сломаться, где скрытые зависимости, что стоит проверить после правок. Если нет — «без существенных рисков».

В самом конце файла — две машинно-читаемые строки (их парсит бэкенд дашборда, формат строгий):
- \`Специалист: frontend | backend | fullstack\` — ровно одно значение, латиница, нижний регистр.
- \`Сложность: simple | medium | complex\` — одно значение, латиница, нижний регистр.

Критерии сложности:
- **simple** — 1-3 файла, минимальные изменения (строки, стили, одно состояние, фикс опечатки).
- **medium** — 3-10 файлов, стандартная фича или баг-фикс со средней глубиной.
- **complex** — рефакторинг, архитектурные изменения, новая внешняя интеграция, 10+ файлов.

Сохрани анализ в ${analysisFile} (создай директорию если нужно).${extra}${rulesBlock}`;

  const env = buildEnv({ youtrackToken, youtrackUrl, figmaToken, trelloKey, trelloToken, trelloBoardId });
  // --print: без него claude запускает TUI, который не выходит сам — окно остаётся висеть, autoclose не срабатывает.
  // --dangerously-skip-permissions: анализ только читает код и пишет в .ai-cache, подтверждать каждый Bash/Read/Write — лишняя возня.
  const cmd = `cd ${shQuote(projectPath)} && ${env} ${shQuote(claudePath)} --print --dangerously-skip-permissions --model haiku ${shQuote(prompt)}`;
  openTerminalWithScript(cmd, { autoCloseOnSuccess: true });
}

function writeCode({ taskId, taskUrl, projectPath, extraPrompt, figmaUrl, autoCommit = false, autoMoveTask = false, tracker, youtrackToken, youtrackUrl, figmaToken, trelloKey, trelloToken, trelloBoardId }) {
  const extra = extraPrompt ? `\n\nДоп. инструкции от разработчика: ${extraPrompt}` : '';
  const specialist = getSpecialistFromCache(projectPath, taskId);
  const complexity = getComplexityFromCache(projectPath, taskId);
  const rules = loadRules(rulesForSpecialist(specialist, complexity));
  const rulesBlock = rules ? `\n\nПравила разработки (строго соблюдай):\n${rules}` : '';
  const specialistLine = specialist
    ? `Задача помечена как **${specialist}** — работай в соответствии с правилами этой роли.`
    : `Специалист не определён — работай как fullstack.`;
  const complexityLine = complexity
    ? `Оценка сложности — **${complexity}**. Не превращай простое в сложное: фикс опечатки не требует переделки архитектуры.`
    : '';
  const analysisFile = taskAnalysisPath(projectPath, taskId);
  const hasAnalysis = existsSync(analysisFile);
  const cwd = ensureWorktree(projectPath, taskId);

  // Если анализ есть — Claude доверяет ему, трекер и Figma повторно не дёргает.
  // Если нет — старая логика с чтением трекера и Figma-кеша.
  const taskContextStep = hasAnalysis
    ? `Прочитай ${analysisFile} — там полный анализ: суть задачи, план действий, ключевые файлы, риски. **Доверяй анализу**: трекер повторно не открывай, Figma повторно не фетчи, комменты не перечитывай. Начинай работу с ключевых файлов из раздела «Ключевые файлы» — не изучай вслепую всю кодовую базу.`
    : `Анализ заранее не сделан. ${trackerReadNote(tracker, taskUrl)} ${figmaCacheNote(projectPath, figmaUrl)}`;

  const prompt = `Задача ${taskId}. Ветка — ${taskId}. ${specialistLine}${complexityLine ? `\n${complexityLine}` : ''}

1. Ты находишься в изолированной рабочей копии (git worktree) на ветке ${taskId} — ветку переключать НЕ надо, \`git checkout\` не запускай. Основной проект (${projectPath}) живёт своей жизнью и может быть на другой ветке. Рабочая папка — ${cwd}.
2. ${taskContextStep}
3. Выполни задачу: код, вёрстка, правки — что требуется. Если нужны зависимости (\`node_modules\` etc.) — установи их внутри worktree или симлинкни из основного проекта.
4. В конце — перечисли что сделал и какие файлы изменил.
5. ${completionNote(tracker, taskId, taskUrl, { autoCommit, autoMoveTask })}${extra}${rulesBlock}`;

  const env = buildEnv({ youtrackToken, youtrackUrl, figmaToken, trelloKey, trelloToken, trelloBoardId });
  const modelFlag = modelFlagForComplexity(complexity);
  const modelPart = modelFlag ? `${modelFlag} ` : '';
  // --dangerously-skip-permissions: правки идут в изолированный git worktree,
  // а пуш и перенос задачи в трекере гейтятся отдельными галочками autoCommit/autoMoveTask.
  // Подтверждать каждый Edit/Bash вручную в N окнах смысла нет.
  const cmd = `cd ${shQuote(cwd)} && ${env} ${shQuote(claudePath)} --dangerously-skip-permissions ${modelPart}${shQuote(prompt)}`;
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
  // --print + skip-permissions: read-only по коду, пишет в TECH-LEAD.md/.tech-lead-history; без --print TUI висит и autoclose не срабатывает.
  const cmd = `cd ${shQuote(projectPath)} && ${env} ${shQuote(claudePath)} --print --dangerously-skip-permissions ${shQuote(prompt)}`;
  openTerminalWithScript(cmd, { autoCloseOnSuccess: true });
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
  // --print + skip-permissions: read-only по коду, пишет в PM.md/.pm-history; без --print TUI висит и autoclose не срабатывает.
  const cmd = `cd ${shQuote(projectPath)} && ${env} ${shQuote(claudePath)} --print --dangerously-skip-permissions ${shQuote(prompt)}`;
  openTerminalWithScript(cmd, { autoCloseOnSuccess: true });
}

module.exports = { readTask, writeCode, analyzeProject, pmAnalyze, taskAnalysisPath };
