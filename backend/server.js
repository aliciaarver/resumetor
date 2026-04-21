require('dotenv').config();
const express = require('express');
const cors = require('cors');
const youtrack = require('./youtrack');
const trello = require('./trello');
const { readTask, writeCode, analyzeProject, pmAnalyze, taskAnalysisPath } = require('./claude');
const { readFileSync, existsSync, readdirSync, writeFileSync, unlinkSync } = require('fs');
const path = require('path');
const { parseTaskBlocks, grabField, normalizeTitle, computeDue } = require('./reportParser');

const ROLES = {
  lead: {
    historyDir: '.tech-lead-history',
    dismissedFile: '.tech-lead-dismissed.json',
    stripPrefix: '[Tech Debt]',
    cardPrefix: '[Tech Debt] ',
    label: { name: 'Тех. лид', color: 'purple' },
    fields: [
      { key: 'whatBroken', label: 'Что нарушено' },
      { key: 'howToFix', label: 'Как исправить' },
      { key: 'specialist', label: 'Специалист' },
      { key: 'priority', label: 'Срочность' },
    ],
  },
  pm: {
    historyDir: '.pm-history',
    dismissedFile: '.pm-dismissed.json',
    stripPrefix: null,
    cardPrefix: '',
    label: { name: 'ПМ', color: 'blue' },
    fields: [
      { key: 'goal', label: 'Что нужно сделать' },
      { key: 'why', label: 'Зачем' },
      { key: 'criteria', label: 'Критерии готовности' },
      { key: 'specialist', label: 'Специалист' },
      { key: 'priority', label: 'Срочность' },
    ],
  },
};

function readLatestReport(projectPath, cfg) {
  const dir = path.join(projectPath, cfg.historyDir);
  if (!existsSync(dir)) return null;
  const files = readdirSync(dir).filter((f) => f.endsWith('.md')).sort();
  if (!files.length) return null;
  const latest = files[files.length - 1];
  return { file: latest, md: readFileSync(path.join(dir, latest), 'utf8') };
}

function loadDismissed(projectPath, cfg) {
  const file = path.join(projectPath, cfg.dismissedFile);
  if (!existsSync(file)) return [];
  try {
    const parsed = JSON.parse(readFileSync(file, 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeDismissed(projectPath, cfg, titles) {
  const file = path.join(projectPath, cfg.dismissedFile);
  writeFileSync(file, JSON.stringify(titles, null, 2) + '\n', 'utf8');
}

function trelloError(err) {
  const url = err.config?.url;
  const method = err.config?.method?.toUpperCase();
  const body = err.response?.data;
  const detail = typeof body === 'string' ? body : body?.message || body?.error;
  return { status: err.response?.status, message: detail || err.message, method, url };
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

function getTracker(req) {
  return req.headers['x-tracker'] === 'trello' ? 'trello' : 'youtrack';
}

function extractTokens(req) {
  return {
    tracker: getTracker(req),
    // YouTrack
    youtrackToken: req.headers['x-youtrack-token'] || process.env.YOUTRACK_TOKEN,
    youtrackUrl: req.headers['x-youtrack-url'] || process.env.YOUTRACK_URL,
    // Trello
    trelloKey: req.headers['x-trello-key'] || process.env.TRELLO_KEY,
    trelloToken: req.headers['x-trello-token'] || process.env.TRELLO_TOKEN,
    trelloBoardId: req.headers['x-trello-board-id'] || process.env.TRELLO_BOARD_ID,
    // Shared
    figmaToken: req.headers['x-figma-token'] || process.env.FIGMA_TOKEN,
  };
}

function validateTrackerCreds(t, { requireBoard = false } = {}) {
  if (t.tracker === 'trello') {
    const missing = [];
    if (!t.trelloKey) missing.push('TRELLO_KEY');
    if (!t.trelloToken) missing.push('TRELLO_TOKEN');
    if (requireBoard && !t.trelloBoardId) missing.push('TRELLO_BOARD_ID');
    if (missing.length) {
      return `Trello-токены не переданы (${missing.join(', ')}). Перелогинься в дашборде или задай их в backend/.env.`;
    }
  } else {
    const missing = [];
    if (!t.youtrackToken) missing.push('YOUTRACK_TOKEN');
    if (!t.youtrackUrl) missing.push('YOUTRACK_URL');
    if (missing.length) {
      return `YouTrack-токены не переданы (${missing.join(', ')}). Перелогинься в дашборде или задай их в backend/.env.`;
    }
  }
  return null;
}

app.get('/api/tasks', async (req, res) => {
  try {
    const t = extractTokens(req);
    const tasks = t.tracker === 'trello'
      ? await trello.getTasks(t.trelloKey, t.trelloToken, t.trelloBoardId)
      : await youtrack.getTasks(t.youtrackToken, t.youtrackUrl);
    res.json(tasks);
  } catch (err) {
    console.error('Error fetching tasks:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/tasks/:taskId', async (req, res) => {
  try {
    const t = extractTokens(req);
    const details = t.tracker === 'trello'
      ? await trello.getTaskDetails(req.params.taskId, t.trelloKey, t.trelloToken)
      : await youtrack.getTaskDetails(req.params.taskId, t.youtrackToken, t.youtrackUrl);
    res.json(details);
  } catch (err) {
    console.error('Error fetching task details:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/read-task', (req, res) => {
  const { taskId, taskUrl, projectPath, extraPrompt } = req.body;
  if (!taskId || !taskUrl || !projectPath) {
    return res.status(400).json({ error: 'taskId, taskUrl, projectPath are required' });
  }
  const t = extractTokens(req);
  const analysisFile = taskAnalysisPath(projectPath, taskId);
  if (existsSync(analysisFile)) {
    try { unlinkSync(analysisFile); } catch (e) { console.warn('failed to remove old analysis:', e.message); }
  }
  readTask({ taskId, taskUrl, projectPath, extraPrompt, ...t });
  res.json({ success: true });
});

app.get('/api/task-analysis/:taskId', (req, res) => {
  const { taskId } = req.params;
  const { projectPath } = req.query;
  if (!taskId || !projectPath) return res.status(400).json({ error: 'taskId and projectPath required' });
  const file = taskAnalysisPath(projectPath, taskId);
  res.json({ exists: existsSync(file), path: file });
});

app.get('/api/task-analysis/:taskId/content', (req, res) => {
  const { taskId } = req.params;
  const { projectPath } = req.query;
  if (!taskId || !projectPath) return res.status(400).json({ error: 'taskId and projectPath required' });
  const file = taskAnalysisPath(projectPath, taskId);
  if (!existsSync(file)) return res.status(404).json({ error: 'analysis not found' });
  res.json({ content: readFileSync(file, 'utf8'), path: file });
});

app.post('/api/write-code', (req, res) => {
  const { taskId, taskUrl, projectPath, extraPrompt } = req.body;
  if (!taskId || !taskUrl || !projectPath) {
    return res.status(400).json({ error: 'taskId, taskUrl, projectPath are required' });
  }
  const t = extractTokens(req);
  writeCode({ taskId, taskUrl, projectPath, extraPrompt, ...t });
  res.json({ success: true });
});

app.post('/api/pm-analyze', (req, res) => {
  const { projectPath } = req.body;
  if (!projectPath) return res.status(400).json({ error: 'projectPath is required' });
  const t = extractTokens(req);
  pmAnalyze({ projectPath, ...t });
  res.json({ success: true });
});

app.get('/api/pm-result', (req, res) => {
  const { projectPath } = req.query;
  if (!projectPath) return res.json({ result: null });
  const historyDir = require('path').join(projectPath, '.pm-history');
  if (!existsSync(historyDir)) return res.json({ result: null });
  const files = readdirSync(historyDir).filter(f => f.endsWith('.md')).sort();
  if (!files.length) return res.json({ result: null });
  const latest = require('path').join(historyDir, files[files.length - 1]);
  res.json({ result: readFileSync(latest, 'utf8') });
});

app.post('/api/analyze-project', (req, res) => {
  const { projectPath } = req.body;
  if (!projectPath) return res.status(400).json({ error: 'projectPath is required' });
  const t = extractTokens(req);
  analyzeProject({ projectPath, ...t });
  res.json({ success: true });
});

app.get('/api/proposed-tasks', async (req, res) => {
  try {
    const { projectPath, role } = req.query;
    if (!projectPath) return res.status(400).json({ error: 'projectPath is required' });
    const cfg = ROLES[role];
    if (!cfg) return res.status(400).json({ error: `unknown role: ${role} (ожидается lead | pm)` });

    const report = readLatestReport(projectPath, cfg);
    const blocks = report ? parseTaskBlocks(report.md, { stripPrefix: cfg.stripPrefix }) : [];
    const dismissedNorm = new Set(
      loadDismissed(projectPath, cfg).map((d) => normalizeTitle(d, cfg.stripPrefix || undefined))
    );

    const t = extractTokens(req);
    let backlogByNorm = new Map();
    let trelloWarning = null;
    if (t.trelloKey && t.trelloToken && t.trelloBoardId) {
      try {
        const boardId = await trello.resolveBoardId(t.trelloKey, t.trelloToken, t.trelloBoardId);
        const [cards, lists, label] = await Promise.all([
          trello.getBoardCards(t.trelloKey, t.trelloToken, boardId),
          trello.getBoardLists(t.trelloKey, t.trelloToken, boardId),
          trello.findLabel(t.trelloKey, t.trelloToken, boardId, cfg.label.name),
        ]);
        const backlog = trello.findBacklogList(lists);
        if (backlog && label) {
          for (const c of cards) {
            if (c.closed) continue;
            if (c.idList !== backlog.id) continue;
            if (!c.idLabels || !c.idLabels.includes(label.id)) continue;
            backlogByNorm.set(normalizeTitle(c.name, cfg.stripPrefix || undefined), c);
          }
        } else if (!backlog) {
          trelloWarning = 'на доске нет колонки бэклога';
        }
      } catch (err) {
        const e = trelloError(err);
        trelloWarning = `Trello недоступен: ${e.message}`;
      }
    }

    const byNorm = new Map();

    // 1) AI-предложения из отчёта
    for (const b of blocks) {
      const norm = normalizeTitle(b.title);
      if (dismissedNorm.has(norm)) continue;
      const fields = cfg.fields.map((f) => ({
        label: f.label,
        key: f.key,
        value: grabField(b.body, f.label),
      }));
      const priority = fields.find((f) => f.key === 'priority')?.value || '';
      const card = backlogByNorm.get(norm);
      byNorm.set(norm, {
        title: card ? card.name.replace(/^\[Tech Debt\]\s*/i, '') : b.title,
        fields: fields.filter((f) => f.value && f.key !== 'priority'),
        priority,
        inBacklog: !!card,
        trelloUrl: card?.shortUrl,
        cardId: card?.id,
        source: card ? 'both' : 'report',
      });
    }

    // 2) Карточки из бэклога с меткой роли, которых нет в отчёте (созданные вручную или из старых отчётов)
    for (const [norm, card] of backlogByNorm) {
      if (byNorm.has(norm)) continue;
      if (dismissedNorm.has(norm)) continue;
      byNorm.set(norm, {
        title: card.name.replace(/^\[Tech Debt\]\s*/i, ''),
        fields: [],
        priority: '',
        inBacklog: true,
        trelloUrl: card.shortUrl,
        cardId: card.id,
        source: 'trello',
      });
    }

    res.json({
      tasks: [...byNorm.values()],
      reportFile: report?.file || null,
      trelloWarning,
    });
  } catch (err) {
    console.error('proposed-tasks error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/create-task', async (req, res) => {
  try {
    const { projectPath, role, title } = req.body;
    if (!projectPath || !role || !title) {
      return res.status(400).json({ error: 'projectPath, role, title required' });
    }
    const cfg = ROLES[role];
    if (!cfg) return res.status(400).json({ error: `unknown role: ${role}` });
    const t = extractTokens(req);
    if (!t.trelloKey || !t.trelloToken || !t.trelloBoardId) {
      return res.status(400).json({ error: 'Trello credentials missing (key/token/boardId)' });
    }

    const report = readLatestReport(projectPath, cfg);
    if (!report) return res.status(404).json({ error: `нет ${cfg.historyDir} — сначала запусти анализ` });
    const block = parseTaskBlocks(report.md, { stripPrefix: cfg.stripPrefix }).find(
      (b) => b.title === title
    );
    if (!block) return res.status(404).json({ error: `задача "${title}" не найдена в последнем отчёте` });

    const fields = cfg.fields.map((f) => ({ ...f, value: grabField(block.body, f.label) }));
    const priority = fields.find((f) => f.key === 'priority')?.value || '';

    const boardId = await trello.resolveBoardId(t.trelloKey, t.trelloToken, t.trelloBoardId);
    const [cards, lists, label] = await Promise.all([
      trello.getBoardCards(t.trelloKey, t.trelloToken, boardId),
      trello.getBoardLists(t.trelloKey, t.trelloToken, boardId),
      trello.ensureLabel(t.trelloKey, t.trelloToken, boardId, cfg.label.name, cfg.label.color),
    ]);
    const backlog = trello.findBacklogList(lists);
    if (!backlog) return res.status(400).json({ error: 'на доске не нашёл колонку бэклога (backlog/бэклог/в бэклоге)' });

    const existing = cards.find(
      (c) => !c.closed && normalizeTitle(c.name, cfg.stripPrefix || undefined) === normalizeTitle(title)
    );
    if (existing) {
      return res.json({ created: false, existed: true, url: existing.shortUrl, title });
    }

    const desc = fields
      .filter((f) => f.value)
      .map((f) => `**${f.label}:** ${f.value}`)
      .join('\n\n');
    const card = await trello.createCard(t.trelloKey, t.trelloToken, {
      name: `${cfg.cardPrefix}${title}`,
      desc,
      idList: backlog.id,
      idLabels: [label.id],
      due: computeDue(priority),
    });
    res.json({ created: true, url: card.shortUrl, title });
  } catch (err) {
    const e = trelloError(err);
    console.error(`create-task error: ${e.method || ''} ${e.url || ''} → ${e.status || ''} ${e.message}`);
    res.status(500).json({ error: e.url ? `${e.message} (${e.method} ${e.url})` : e.message });
  }
});

app.post('/api/task-comment', async (req, res) => {
  try {
    const { cardId, comment } = req.body;
    if (!cardId || !comment || !comment.trim()) {
      return res.status(400).json({ error: 'cardId и непустой comment обязательны' });
    }
    const t = extractTokens(req);
    if (!t.trelloKey || !t.trelloToken) {
      return res.status(400).json({ error: 'Trello credentials missing (key/token)' });
    }
    const action = await trello.addComment(t.trelloKey, t.trelloToken, cardId, comment.trim());
    res.json({ ok: true, commentId: action.id, created: action.date });
  } catch (err) {
    const e = trelloError(err);
    console.error(`task-comment error: ${e.method || ''} ${e.url || ''} → ${e.status || ''} ${e.message}`);
    res.status(500).json({ error: e.url ? `${e.message} (${e.method} ${e.url})` : e.message });
  }
});

app.post('/api/dismiss-task', async (req, res) => {
  try {
    const { projectPath, role, title } = req.body;
    if (!projectPath || !role || !title) {
      return res.status(400).json({ error: 'projectPath, role, title required' });
    }
    const cfg = ROLES[role];
    if (!cfg) return res.status(400).json({ error: `unknown role: ${role}` });

    const t = extractTokens(req);
    let archivedCardId = null;

    // Если Trello доступен — ищем карточку в бэклоге и архивируем её.
    // Если нет карточки в бэклоге (задача только в отчёте) — просто фиксируем в dismissed.
    if (t.trelloKey && t.trelloToken && t.trelloBoardId) {
      try {
        const boardId = await trello.resolveBoardId(t.trelloKey, t.trelloToken, t.trelloBoardId);
        const [cards, lists, label] = await Promise.all([
          trello.getBoardCards(t.trelloKey, t.trelloToken, boardId),
          trello.getBoardLists(t.trelloKey, t.trelloToken, boardId),
          trello.findLabel(t.trelloKey, t.trelloToken, boardId, cfg.label.name),
        ]);
        const backlog = trello.findBacklogList(lists);
        if (backlog) {
          const targetNorm = normalizeTitle(title, cfg.stripPrefix || undefined);
          const card = cards.find((c) => {
            if (c.closed) return false;
            if (c.idList !== backlog.id) return false;
            if (label && c.idLabels && !c.idLabels.includes(label.id)) return false;
            return normalizeTitle(c.name, cfg.stripPrefix || undefined) === targetNorm;
          });
          if (card) {
            await trello.archiveCard(t.trelloKey, t.trelloToken, card.id);
            archivedCardId = card.id;
          }
        }
      } catch (err) {
        const e = trelloError(err);
        console.warn(`dismiss-task Trello warn: ${e.method || ''} ${e.url || ''} → ${e.message}`);
        // Продолжаем — пишем в dismissed даже если Trello недоступен
      }
    }

    const list = loadDismissed(projectPath, cfg);
    if (!list.includes(title)) list.push(title);
    writeDismissed(projectPath, cfg, list);

    res.json({ ok: true, archivedCardId, dismissed: list.length });
  } catch (err) {
    console.error('dismiss-task error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/tech-lead-result', (req, res) => {
  const { projectPath } = req.query;
  if (!projectPath) return res.json({ result: null });
  const historyDir = require('path').join(projectPath, '.tech-lead-history');
  if (!existsSync(historyDir)) return res.json({ result: null });
  const files = readdirSync(historyDir).filter(f => f.endsWith('.md')).sort();
  if (!files.length) return res.json({ result: null });
  const latest = require('path').join(historyDir, files[files.length - 1]);
  res.json({ result: readFileSync(latest, 'utf8') });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
