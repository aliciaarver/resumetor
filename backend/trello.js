const axios = require('axios');

const BASE = 'https://api.trello.com/1';

const LIST_STATUS_MAP = {
  'in progress': 'В работе',
  'в работе': 'В работе',
  'rework': 'На доработку',
  'на доработку': 'На доработку',
  'backlog': 'В бэклоге',
  'в бэклоге': 'В бэклоге',
  'бэклог': 'В бэклоге',
  'to do': 'В бэклоге',
  'todo': 'В бэклоге',
  'на тестировании': 'На тестировании',
  'done': 'Готово',
  'готово': 'Готово',
  'complete': 'Готово',
  'completed': 'Готово',
  'выполнено': 'Готово',
};

const ACTIVE = new Set(['В работе', 'На доработку', 'В бэклоге']);

function mapListName(name) {
  return LIST_STATUS_MAP[name.toLowerCase().trim()];
}

async function getTasks(key, token, boardId) {
  const k = key || process.env.TRELLO_KEY;
  const t = token || process.env.TRELLO_TOKEN;
  const b = boardId || process.env.TRELLO_BOARD_ID;

  const meRes = await axios.get(`${BASE}/members/me`, { params: { key: k, token: t } });
  const listsRes = await axios.get(`${BASE}/boards/${b}/lists`, {
    params: { key: k, token: t, cards: 'open', card_fields: 'id,name,shortUrl,idMembers,idList' },
  });

  const myId = meRes.data.id;
  const tasks = [];

  for (const list of listsRes.data) {
    const status = mapListName(list.name);
    if (!status || !ACTIVE.has(status)) continue;

    const isBacklog = status === 'В бэклоге';
    for (const card of (list.cards || [])) {
      // В бэклоге показываем весь пул. В «В работе» / «На доработку» — только свои карточки.
      if (!isBacklog && !card.idMembers.includes(myId)) continue;
      tasks.push({
        id: card.id,
        title: card.name,
        status,
        branch: card.id,
        url: card.shortUrl,
      });
    }
  }

  return tasks;
}

async function getTaskDetails(cardId, key, token) {
  const k = key || process.env.TRELLO_KEY;
  const t = token || process.env.TRELLO_TOKEN;

  const [cardRes, actionsRes] = await Promise.all([
    axios.get(`${BASE}/cards/${cardId}`, {
      params: { key: k, token: t, fields: 'id,name,desc,url,dateLastActivity', members: true, member_fields: 'fullName,username' },
    }),
    axios.get(`${BASE}/cards/${cardId}/actions`, {
      params: { key: k, token: t, filter: 'commentCard' },
    }),
  ]);

  const card = cardRes.data;

  return {
    id: card.id,
    title: card.name,
    description: card.desc || '',
    created: new Date(card.dateLastActivity).getTime(),
    updated: new Date(card.dateLastActivity).getTime(),
    url: card.url,
    status: '',
    priority: '',
    type: '',
    assignee: (card.members || []).map((m) => m.fullName || m.username).join(', '),
    reporter: '',
    comments: (actionsRes.data || []).map((a) => ({
      id: a.id,
      author: a.memberCreator?.fullName || a.memberCreator?.username || 'Unknown',
      created: new Date(a.date).getTime(),
      text: a.data?.text || '',
    })),
  };
}

async function resolveBoardId(key, token, boardId) {
  const r = await axios.get(`${BASE}/boards/${boardId}`, {
    params: { key, token, fields: 'id' },
  });
  return r.data.id;
}

async function getBoardCards(key, token, boardId) {
  const r = await axios.get(`${BASE}/boards/${boardId}/cards`, {
    params: { key, token, fields: 'name,shortUrl,closed,idList,idLabels', filter: 'all' },
  });
  return r.data;
}

async function getBoardLists(key, token, boardId) {
  const r = await axios.get(`${BASE}/boards/${boardId}/lists`, {
    params: { key, token },
  });
  return r.data;
}

async function findLabel(key, token, boardId, name) {
  const r = await axios.get(`${BASE}/boards/${boardId}/labels`, {
    params: { key, token },
  });
  return r.data.find((l) => (l.name || '').toLowerCase() === name.toLowerCase()) || null;
}

async function ensureLabel(key, token, boardId, name, color) {
  const existing = await findLabel(key, token, boardId, name);
  if (existing) return existing;
  const created = await axios.post(`${BASE}/labels`, null, {
    params: { key, token, name, color, idBoard: boardId },
  });
  return created.data;
}

async function createCard(key, token, { name, desc, idList, idLabels, due }) {
  const params = { key, token, name, desc, idList };
  if (idLabels && idLabels.length) params.idLabels = idLabels.join(',');
  if (due) params.due = due;
  const r = await axios.post(`${BASE}/cards`, null, { params });
  return r.data;
}

async function archiveCard(key, token, cardId) {
  const r = await axios.put(`${BASE}/cards/${cardId}`, null, {
    params: { key, token, closed: true },
  });
  return r.data;
}

async function addComment(key, token, cardId, text) {
  const r = await axios.post(`${BASE}/cards/${cardId}/actions/comments`, null, {
    params: { key, token, text },
  });
  return r.data;
}

function findBacklogList(lists) {
  return lists.find((l) => mapListName(l.name) === 'В бэклоге');
}

module.exports = {
  getTasks,
  getTaskDetails,
  resolveBoardId,
  getBoardCards,
  getBoardLists,
  findLabel,
  ensureLabel,
  createCard,
  archiveCard,
  addComment,
  findBacklogList,
};
