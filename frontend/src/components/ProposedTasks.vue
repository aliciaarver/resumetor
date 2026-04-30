<template>
  <div class="pt">
    <button class="pt-header" type="button" @click="collapsed = !collapsed">
      <span class="chev chev-md" :class="{ 'chev-open': !collapsed }">▶</span>
      <span class="pt-head-text">
        Задачи
        <span v-if="loaded" class="pt-count">{{ tasks.length }}</span>
        <span v-else class="pt-count pt-count-loading">…</span>
      </span>
      <span v-if="reportFile" class="pt-meta">отчёт: {{ reportFile }}</span>
    </button>

    <template v-if="!collapsed">
    <div v-if="!loaded" class="pt-loading">
      <div v-for="i in 2" :key="i" class="pt-skeleton" />
    </div>

    <template v-else>
    <div v-if="trelloWarning" class="pt-warning">{{ trelloWarning }}</div>

    <p v-if="!tasks.length" class="pt-empty">
      {{ reportFile
        ? 'Задач нет — в отчёте пусто и в бэклоге Trello задач с меткой роли тоже.'
        : 'Запусти анализ, чтобы увидеть предложения.' }}
    </p>

    <ul v-else class="pt-list">
      <li
        v-for="t in tasks"
        :key="t.title"
        class="pt-item"
        :class="[
          t.inBacklog ? 'pt-in-backlog' : 'pt-proposed',
          {
            'pt-done': !!status[t.title]?.created,
            'pt-dismissed': !!status[t.title]?.dismissed,
            'pt-error': !!status[t.title]?.error,
          }
        ]"
      >
        <div class="pt-head">
          <span class="pt-tag" :class="t.inBacklog ? 'tag-backlog' : 'tag-proposed'">
            {{ t.inBacklog ? 'в бэклоге' : 'предложено' }}
          </span>
          <span class="pt-title">{{ t.title }}</span>
          <span v-if="t.priority" class="pt-prio" :class="prioClass(t.priority)">{{ t.priority }}</span>
          <a
            v-if="status[t.title]?.url || t.trelloUrl"
            :href="status[t.title]?.url || t.trelloUrl"
            target="_blank"
            rel="noopener"
            class="pt-link"
          >Trello ↗</a>
        </div>

        <dl v-if="t.fields.length" class="pt-fields">
          <template v-for="f in t.fields" :key="f.label">
            <dt>{{ f.label }}:</dt>
            <dd>{{ f.value }}</dd>
          </template>
        </dl>

        <div v-if="status[t.title]?.error" class="pt-err-msg">{{ status[t.title].error }}</div>
        <div v-else-if="status[t.title]?.dismissed" class="pt-note">
          {{ t.inBacklog ? 'отклонено — карточка заархивирована' : 'отклонено — больше не будет предлагаться' }}
        </div>
        <div v-else-if="status[t.title]?.created" class="pt-note pt-ok">создано в Trello</div>

        <div v-if="!status[t.title]?.dismissed && !status[t.title]?.created" class="pt-actions">
          <button
            v-if="!t.inBacklog"
            class="pt-create"
            :disabled="busy(t.title)"
            @click="create(t.title)"
          >
            {{ status[t.title]?.action === 'create' ? 'Создаю...' : 'Создать в Trello' }}
          </button>
          <button
            class="pt-dismiss"
            :disabled="busy(t.title)"
            @click="dismiss(t.title)"
            :title="t.inBacklog ? 'Архивировать карточку и исключить из будущих предложений' : 'Исключить из будущих предложений'"
            :aria-label="t.inBacklog ? 'Архивировать и отклонить' : 'Отклонить'"
          >
            <span v-if="status[t.title]?.action === 'dismiss'" class="pt-dismiss-spin" />
            <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6"/>
              <path d="M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </button>
        </div>

        <div v-if="t.inBacklog && t.cardId && !status[t.title]?.dismissed" class="pt-comment-wrap">
          <button class="pt-comment-toggle" type="button" @click="toggleComment(t.title)">
            <span class="chev chev-sm" :class="{ 'chev-open': commentOpen[t.title] }">▶</span>
            {{ commentOpen[t.title] ? 'Скрыть комментарий' : 'Добавить комментарий' }}
          </button>
          <div v-if="commentOpen[t.title]" class="pt-comment">
            <textarea
              v-model="commentDraft[t.title]"
              class="pt-comment-input"
              rows="2"
              placeholder="Рекомендация / комментарий к карточке... (минимум 3 символа)"
              :disabled="commentBusy[t.title]"
            />
            <div class="pt-comment-row">
              <button
                class="pt-comment-btn"
                :disabled="!commentValid(t.title) || commentBusy[t.title]"
                @click="sendComment(t)"
              >
                {{ commentBusy[t.title] ? 'Отправляю...' : 'Отправить' }}
              </button>
              <span
                v-if="commentStatus[t.title]"
                class="pt-comment-status"
                :class="{ 'pt-comment-err': commentStatus[t.title].error }"
              >{{ commentStatus[t.title].text }}</span>
              <span
                v-else-if="commentTyped(t.title) && !commentValid(t.title)"
                class="pt-comment-hint"
              >минимум 3 символа</span>
            </div>
          </div>
        </div>
      </li>
    </ul>
    </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import { useAuth } from '../composables/useAuth';

type Field = { label: string; value: string };
type Task = {
  title: string;
  fields: Field[];
  priority: string;
  inBacklog: boolean;
  trelloUrl?: string;
  cardId?: string;
  source: 'report' | 'trello' | 'both';
};
type CommentStatus = { text: string; error?: boolean };
type Status = {
  action?: 'create' | 'dismiss';
  created?: boolean;
  dismissed?: boolean;
  url?: string;
  error?: string;
};

const props = defineProps<{ role: 'lead' | 'pm'; projectPath: string }>();

const { authHeaders } = useAuth();
const tasks = ref<Task[]>([]);
const reportFile = ref<string | null>(null);
const trelloWarning = ref<string | null>(null);
const loaded = ref(false);
const collapsed = ref(false);
const status = reactive<Record<string, Status>>({});
const commentDraft = reactive<Record<string, string>>({});
const commentBusy = reactive<Record<string, boolean>>({});
const commentStatus = reactive<Record<string, CommentStatus>>({});
const commentOpen = reactive<Record<string, boolean>>({});

function toggleComment(title: string) {
  commentOpen[title] = !commentOpen[title];
}

function commentTyped(title: string) {
  return (commentDraft[title] || '').trim().length > 0;
}

function commentValid(title: string) {
  return (commentDraft[title] || '').trim().length >= 3;
}

async function load() {
  if (!props.projectPath.trim()) return;
  const params = new URLSearchParams({ projectPath: props.projectPath.trim(), role: props.role });
  try {
    const res = await fetch(`/api/proposed-tasks?${params}`, { headers: authHeaders() });
    const data = await res.json();
    tasks.value = data.tasks ?? [];
    reportFile.value = data.reportFile ?? null;
    trelloWarning.value = data.trelloWarning ?? null;
  } catch {
    tasks.value = [];
    reportFile.value = null;
    trelloWarning.value = 'не удалось загрузить задачи';
  } finally {
    loaded.value = true;
  }
}

onMounted(load);
watch(() => [props.role, props.projectPath], load);

defineExpose({ reload: load });

function busy(title: string) {
  return !!status[title]?.action;
}

async function create(title: string) {
  if (busy(title)) return;
  status[title] = { action: 'create' };
  try {
    const res = await fetch('/api/create-task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ projectPath: props.projectPath.trim(), role: props.role, title }),
    });
    const data = await res.json();
    if (!res.ok) {
      status[title] = { error: data.error || `HTTP ${res.status}` };
    } else {
      status[title] = { created: true, url: data.url };
      await load();
    }
  } catch (e: any) {
    status[title] = { error: e?.message || 'сетевая ошибка' };
  }
}

async function dismiss(title: string) {
  if (busy(title)) return;
  status[title] = { action: 'dismiss' };
  try {
    const res = await fetch('/api/dismiss-task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ projectPath: props.projectPath.trim(), role: props.role, title }),
    });
    const data = await res.json();
    if (!res.ok) {
      status[title] = { error: data.error || `HTTP ${res.status}` };
    } else {
      status[title] = { dismissed: true };
      await load();
    }
  } catch (e: any) {
    status[title] = { error: e?.message || 'сетевая ошибка' };
  }
}

async function sendComment(t: Task) {
  if (!t.cardId) return;
  const text = (commentDraft[t.title] || '').trim();
  if (text.length < 3 || commentBusy[t.title]) return;
  commentBusy[t.title] = true;
  commentStatus[t.title] = { text: '' };
  try {
    const res = await fetch('/api/task-comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ cardId: t.cardId, comment: text }),
    });
    const data = await res.json();
    if (!res.ok) {
      commentStatus[t.title] = { text: data.error || `HTTP ${res.status}`, error: true };
    } else {
      commentStatus[t.title] = { text: 'комментарий добавлен в Trello ✓' };
      commentDraft[t.title] = '';
    }
  } catch (e: any) {
    commentStatus[t.title] = { text: e?.message || 'сетевая ошибка', error: true };
  } finally {
    commentBusy[t.title] = false;
  }
}

function prioClass(p: string) {
  const s = p.toLowerCase();
  if (s.includes('критич')) return 'prio-crit';
  if (s.includes('высок')) return 'prio-high';
  if (s.includes('средн')) return 'prio-mid';
  return 'prio-low';
}
</script>

<style scoped>
.pt {
  background: #1e1e2e;
  border: 1px solid #313244;
  border-radius: 10px;
  overflow: hidden;
}

.pt-header {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 16px;
  border: none;
  border-bottom: 1px solid #313244;
  background: transparent;
  color: #6c7086;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s;
  font-family: inherit;
}
.pt-header:hover { background: #181825; }

.chev {
  display: inline-block;
  color: currentColor;
  line-height: 1;
  transition: transform 0.15s;
}
.chev-md { font-size: 12px; }
.chev-sm { font-size: 10px; }
.chev-open { transform: rotate(90deg); }

.pt-head-text { flex: 1; }

.pt-count-loading { opacity: 0.5; }

.pt-loading {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.pt-skeleton {
  height: 54px;
  background: linear-gradient(90deg, #313244 25%, #3b3d56 50%, #313244 75%);
  background-size: 200% 100%;
  animation: pt-shimmer 1.4s infinite;
  border-radius: 8px;
}
@keyframes pt-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.pt-count {
  display: inline-block;
  margin-left: 6px;
  background: #313244;
  color: #a6adc8;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  text-transform: none;
  letter-spacing: 0;
}

.pt-meta {
  color: #45475a;
  text-transform: none;
  letter-spacing: 0;
  font-weight: 400;
  font-size: 11px;
}

.pt-warning {
  padding: 10px 16px;
  background: #3b2c1c;
  border-bottom: 1px solid #313244;
  color: #fab387;
  font-size: 12px;
}

.pt-empty {
  padding: 20px 16px;
  color: #6c7086;
  font-size: 13px;
  margin: 0;
}

.pt-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.pt-item {
  padding: 14px 16px;
  border-bottom: 1px solid #313244;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: opacity 0.2s;
}
.pt-item:last-child { border-bottom: none; }

.pt-item.pt-dismissed { opacity: 0.5; }
.pt-item.pt-done { border-left: 3px solid #a6e3a1; }
.pt-item.pt-error { border-left: 3px solid #f38ba8; }

.pt-head {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.pt-tag {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 700;
  white-space: nowrap;
}
.tag-proposed { background: #1c2e3b; color: #89b4fa; }
.tag-backlog  { background: #2e1c3b; color: #cba6f7; }

.pt-title {
  font-size: 14px;
  font-weight: 600;
  color: #cdd6f4;
  flex: 1;
}

.pt-prio {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 700;
}
.prio-crit { background: #3b1c1c; color: #f38ba8; }
.prio-high { background: #3b2c1c; color: #fab387; }
.prio-mid  { background: #3b351c; color: #f9e2af; }
.prio-low  { background: #1c3b2e; color: #a6e3a1; }

.pt-link {
  font-size: 11px;
  color: #89b4fa;
  text-decoration: none;
}
.pt-link:hover { text-decoration: underline; }

.pt-fields {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 2px 10px;
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
}
.pt-fields dt { color: #6c7086; font-weight: 500; }
.pt-fields dd { color: #cdd6f4; margin: 0; }

.pt-note { font-size: 12px; color: #6c7086; font-style: italic; }
.pt-note.pt-ok { color: #a6e3a1; }
.pt-err-msg { font-size: 12px; color: #f38ba8; }

.pt-actions { display: flex; gap: 8px; margin-top: 2px; }

.pt-create, .pt-dismiss {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.pt-create {
  border: 1px solid #a6e3a1;
  background: transparent;
  color: #a6e3a1;
}
.pt-create:hover:not(:disabled) { background: #a6e3a1; color: #1e1e2e; }

.pt-dismiss {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 28px;
  padding: 0;
  border: 1px solid #f38ba8;
  background: transparent;
  color: #f38ba8;
}
.pt-dismiss:hover:not(:disabled) { background: #f38ba8; color: #1e1e2e; }
.pt-dismiss-spin {
  width: 12px;
  height: 12px;
  border: 2px solid rgba(243,139,168,0.3);
  border-top-color: #f38ba8;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.pt-create:disabled, .pt-dismiss:disabled { opacity: 0.4; cursor: default; }

.pt-comment-wrap {
  margin-top: 4px;
  padding-top: 8px;
  border-top: 1px dashed #313244;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pt-comment-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  align-self: flex-start;
  padding: 0;
  border: none;
  background: transparent;
  color: #89b4fa;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.15s;
  font-family: inherit;
}
.pt-comment-toggle:hover { color: #b4befe; }


.pt-comment {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.pt-comment-input {
  width: 100%;
  box-sizing: border-box;
  background: #181825;
  border: 1px solid #45475a;
  border-radius: 6px;
  color: #cdd6f4;
  font-size: 12px;
  line-height: 1.4;
  padding: 7px 9px;
  resize: vertical;
  font-family: inherit;
}
.pt-comment-input:focus { outline: none; border-color: #89b4fa; }
.pt-comment-input:disabled { opacity: 0.6; }
.pt-comment-input::placeholder { color: #45475a; }

.pt-comment-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.pt-comment-btn {
  padding: 5px 12px;
  border-radius: 6px;
  border: 1px solid #89b4fa;
  background: transparent;
  color: #89b4fa;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.pt-comment-btn:hover:not(:disabled) { background: #89b4fa; color: #1e1e2e; }
.pt-comment-btn:disabled { opacity: 0.4; cursor: default; }

.pt-comment-status {
  font-size: 11px;
  color: #a6e3a1;
}
.pt-comment-status.pt-comment-err { color: #f38ba8; }

.pt-comment-hint {
  font-size: 11px;
  color: #6c7086;
  font-style: italic;
}
</style>
