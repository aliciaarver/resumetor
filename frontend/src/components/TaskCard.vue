<template>
  <div class="task-card">
    <div class="task-header">
      <a :href="task.url" target="_blank" class="task-id" :title="task.id">{{ task.id }}</a>
      <button class="btn-detail" @click="openDetail" title="Открыть описание задачи">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        Описание
      </button>
    </div>
    <p class="task-title">{{ task.title }}</p>

    <template v-if="!analysisReady">
      <div class="extra-prompt-wrap">
        <button class="extra-toggle" @click="showExtra = !showExtra">
          <span class="chev chev-sm" :class="{ 'chev-open': showExtra }">▶</span>
          Доп. инструкции
        </button>
        <template v-if="showExtra">
          <textarea
            v-model="extraPrompt"
            class="extra-textarea"
            placeholder="Например: не трогай файл auth.ts, используй только TypeScript... (минимум 3 символа)"
            rows="3"
          />
          <span v-if="extraPromptTooShort" class="extra-hint">Если заполняешь — минимум 3 символа</span>
        </template>
      </div>

      <div class="task-actions">
        <button
          class="btn btn-read"
          :disabled="readDisabled"
          @click="handleRead"
        >
          {{ readLabel }}
        </button>
      </div>
    </template>

    <template v-else>
      <div class="analysis-banner">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        <span>Анализ готов</span>
        <button class="analysis-view" type="button" @click="openAnalysis">Посмотреть</button>
      </div>

      <div class="task-actions">
        <button
          class="btn btn-write"
          :disabled="writeDisabled"
          @click="handleWrite"
        >
          {{ writeLabel }}
        </button>
      </div>
    </template>
  </div>

  <!-- Repo path modal -->
  <Teleport to="body">
    <div v-if="showModal" class="modal-overlay" @click.self="cancelModal">
      <div class="modal">
        <h3>Путь к репозиторию</h3>
        <input
          v-model="repoPath"
          class="modal-input"
          placeholder="/Users/name/projects/my-app"
          @keydown.enter="confirmModal"
        />
        <div class="modal-buttons">
          <button class="btn" @click="cancelModal">Отмена</button>
          <button class="btn btn-primary" @click="confirmModal">Подтвердить</button>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Task detail modal -->
  <Teleport to="body">
    <div v-if="showDetail" class="modal-overlay" @click.self="showDetail = false">
      <div class="detail-modal">
        <div class="detail-header">
          <div class="detail-header-left">
            <a :href="task.url" target="_blank" class="detail-task-id" :title="task.id">{{ task.id }}</a>
            <h2 class="detail-title">{{ detail?.title || task.title }}</h2>
          </div>
          <button class="detail-close" @click="showDetail = false">✕</button>
        </div>

        <div v-if="detailLoading" class="detail-loading">
          <span class="spinner" />
          Загрузка...
        </div>

        <div v-else-if="detailError" class="detail-error">
          {{ detailError }}
        </div>

        <template v-else-if="detail">
          <div class="detail-meta">
            <div class="meta-item" v-if="detail.status">
              <span class="meta-label">Статус</span>
              <span class="meta-badge status-badge">{{ detail.status }}</span>
            </div>
            <div class="meta-item" v-if="detail.priority">
              <span class="meta-label">Приоритет</span>
              <span class="meta-value">{{ detail.priority }}</span>
            </div>
            <div class="meta-item" v-if="detail.type">
              <span class="meta-label">Тип</span>
              <span class="meta-value">{{ detail.type }}</span>
            </div>
            <div class="meta-item" v-if="detail.assignee">
              <span class="meta-label">Исполнитель</span>
              <span class="meta-value">{{ detail.assignee }}</span>
            </div>
            <div class="meta-item" v-if="detail.reporter">
              <span class="meta-label">Создатель</span>
              <span class="meta-value">{{ detail.reporter }}</span>
            </div>
            <div class="meta-item" v-if="detail.created">
              <span class="meta-label">Создана</span>
              <span class="meta-value">{{ formatDate(detail.created) }}</span>
            </div>
            <div class="meta-item" v-if="detail.updated">
              <span class="meta-label">Обновлена</span>
              <span class="meta-value">{{ formatDate(detail.updated) }}</span>
            </div>
          </div>

          <div class="detail-scroll">
            <div class="detail-section">
              <div class="section-label">Описание</div>
              <div v-if="detail.description" class="detail-description markdown-body" v-html="renderedDescription" />
              <div v-else class="detail-empty">Описание не указано</div>
            </div>

            <div class="detail-section">
              <div class="section-label">
                Комментарии<span v-if="detail.comments.length"> ({{ detail.comments.length }})</span>
              </div>
              <div v-if="detail.comments.length" class="comments-list">
                <div v-for="comment in detail.comments" :key="comment.id" class="comment">
                  <div class="comment-header">
                    <span class="comment-author">{{ comment.author }}</span>
                    <span class="comment-date">{{ formatDate(comment.created) }}</span>
                  </div>
                  <div class="comment-text markdown-body" v-html="renderComment(comment.text)" />
                </div>
              </div>
              <div v-else class="detail-empty">Комментариев нет</div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </Teleport>

  <!-- Analysis view modal -->
  <Teleport to="body">
    <div v-if="showAnalysis" class="modal-overlay" @click.self="showAnalysis = false">
      <div class="detail-modal">
        <div class="detail-header">
          <div class="detail-header-left">
            <span class="detail-task-id" :title="task.id">{{ task.id }}</span>
            <h2 class="detail-title">Анализ задачи</h2>
          </div>
          <button class="detail-close" @click="showAnalysis = false">✕</button>
        </div>

        <div v-if="analysisFilePath" class="analysis-path">{{ analysisFilePath }}</div>

        <div v-if="analysisLoading" class="detail-loading">
          <span class="spinner" />
          Загрузка...
        </div>

        <div v-else-if="analysisError" class="detail-error">{{ analysisError }}</div>

        <div v-else class="detail-scroll">
          <div class="detail-section markdown-body" v-html="renderedAnalysis" />

          <div class="analysis-regen">
            <button
              type="button"
              class="analysis-regen-toggle"
              @click="showRegen = !showRegen"
            >
              <span class="chev chev-sm" :class="{ 'chev-open': showRegen }">▶</span>
              Уточнить и перезапустить анализ
            </button>
            <template v-if="showRegen">
              <textarea
                v-model="regenInput"
                class="analysis-regen-input"
                placeholder="Например: учти комментарий последнего тестировщика, не трогай модуль auth..."
                rows="3"
              />
              <button
                class="btn btn-read analysis-regen-btn"
                :disabled="regenState === 'loading' || !regenInput.trim()"
                @click="handleRegenerate"
              >
                {{ regenState === 'loading' ? 'Запускаю...' : 'Перезапустить анализ' }}
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { marked } from 'marked';
import { useAuth } from '../composables/useAuth';

marked.setOptions({ breaks: true, gfm: true });

interface Task {
  id: string;
  title: string;
  status: string;
  url: string;
}

interface Comment {
  id: string;
  author: string;
  created: number;
  text: string;
}

interface TaskDetail {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  type: string;
  assignee: string;
  reporter: string;
  created: number;
  updated: number;
  url: string;
  comments: Comment[];
}

const props = defineProps<{ task: Task }>();

const emit = defineEmits<{
  (e: 'work-started', taskId: string): void;
}>();

const { credentials, authHeaders } = useAuth();


const readState = ref<'idle' | 'loading' | 'done'>('idle');
const writeState = ref<'idle' | 'loading' | 'done'>('idle');
const analysisReady = ref(false);
const showExtra = ref(false);
const extraPrompt = ref('');

const extraPromptTooShort = computed(() => {
  const trimmed = extraPrompt.value.trim();
  return trimmed.length > 0 && trimmed.length < 3;
});

const readLabel = computed(() => {
  if (readState.value === 'loading') return 'Открываю...';
  if (readState.value === 'done') return 'Claude анализирует в терминале — жду результат...';
  return 'ИИ анализ';
});

const writeLabel = computed(() => {
  if (writeState.value === 'loading') return 'Открываю...';
  if (writeState.value === 'done') return 'Claude работает в терминале ✓';
  return 'Работать над задачей';
});

const readDisabled = computed(() =>
  readState.value !== 'idle' || writeState.value !== 'idle' || extraPromptTooShort.value
);

const writeDisabled = computed(() =>
  writeState.value !== 'idle' || readState.value !== 'idle'
);

let analysisPollTimer: ReturnType<typeof setInterval> | null = null;

const projectPathForApi = computed(() => credentials.value?.repoPath?.trim() ?? '');

async function checkAnalysis(): Promise<boolean> {
  if (!projectPathForApi.value) return false;
  try {
    const params = new URLSearchParams({ projectPath: projectPathForApi.value });
    const res = await fetch(
      `/api/task-analysis/${encodeURIComponent(props.task.id)}?${params}`,
      { headers: authHeaders() }
    );
    if (!res.ok) return false;
    const data = await res.json();
    analysisFilePath.value = data.path || '';
    return !!data.exists;
  } catch {
    return false;
  }
}

const analysisFilePath = ref('');
const showAnalysis = ref(false);
const analysisContent = ref('');
const analysisLoading = ref(false);
const analysisError = ref('');
const renderedAnalysis = computed(() =>
  analysisContent.value ? (marked.parse(analysisContent.value) as string) : ''
);

async function openAnalysis() {
  showAnalysis.value = true;
  if (analysisContent.value) return;
  analysisLoading.value = true;
  analysisError.value = '';
  try {
    const params = new URLSearchParams({ projectPath: projectPathForApi.value });
    const res = await fetch(
      `/api/task-analysis/${encodeURIComponent(props.task.id)}/content?${params}`,
      { headers: authHeaders() }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    analysisContent.value = data.content || '';
    analysisFilePath.value = data.path || analysisFilePath.value;
  } catch (err) {
    analysisError.value = `Не удалось загрузить анализ: ${(err as Error).message}`;
  } finally {
    analysisLoading.value = false;
  }
}

const regenInput = ref('');
const regenState = ref<'idle' | 'loading'>('idle');
const showRegen = ref(false);

function handleRegenerate() {
  const hint = regenInput.value.trim();
  if (!hint) return;
  regenState.value = 'loading';
  requirePath((projectPath) => {
    fetch('/api/read-task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({
        taskId: props.task.id,
        taskUrl: props.task.url,
        projectPath,
        extraPrompt: hint,
        youtrackToken: credentials.value?.youtrackToken,
        youtrackUrl: credentials.value?.youtrackUrl,
        figmaToken: credentials.value?.figmaToken,
      }),
    })
      .then(() => {
        analysisReady.value = false;
        analysisContent.value = '';
        analysisError.value = '';
        regenInput.value = '';
        showAnalysis.value = false;
        readState.value = 'done';
        startAnalysisPoll();
      })
      .catch((err) => {
        console.error(err);
        analysisError.value = `Не удалось запустить: ${(err as Error).message}`;
      })
      .finally(() => {
        regenState.value = 'idle';
      });
  });
}

function startAnalysisPoll() {
  if (analysisPollTimer) return;
  analysisPollTimer = setInterval(async () => {
    if (await checkAnalysis()) {
      analysisReady.value = true;
      readState.value = 'idle';
      stopAnalysisPoll();
    }
  }, 3000);
}

function stopAnalysisPoll() {
  if (analysisPollTimer) {
    clearInterval(analysisPollTimer);
    analysisPollTimer = null;
  }
}

onMounted(async () => {
  analysisReady.value = await checkAnalysis();
});

onUnmounted(stopAnalysisPoll);

const showModal = ref(false);
const repoPath = ref(credentials.value?.repoPath ?? '');
let pendingAction: ((path: string) => void) | null = null;

function requirePath(action: (path: string) => void) {
  pendingAction = action;
  if (repoPath.value.trim()) {
    action(repoPath.value.trim());
    return;
  }
  showModal.value = true;
}

function cancelModal() {
  showModal.value = false;
  pendingAction = null;
}

function confirmModal() {
  if (!repoPath.value.trim()) return;
  showModal.value = false;
  if (pendingAction) {
    pendingAction(repoPath.value.trim());
    pendingAction = null;
  }
}

function callApi(
  endpoint: string,
  stateRef: ReturnType<typeof ref<'idle' | 'loading' | 'done'>>,
  onDone?: () => void,
) {
  return (projectPath: string) => {
    stateRef.value = 'loading';
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({
        taskId: props.task.id,
        taskUrl: props.task.url,
        projectPath,
        extraPrompt: extraPrompt.value.trim() || undefined,
        youtrackToken: credentials.value?.youtrackToken,
        youtrackUrl: credentials.value?.youtrackUrl,
        figmaToken: credentials.value?.figmaToken,
      }),
    })
      .then(() => {
        stateRef.value = 'done';
        onDone?.();
      })
      .catch((err) => {
        console.error(err);
        stateRef.value = 'idle';
      });
  };
}

function handleRead() {
  requirePath(callApi('/api/read-task', readState, startAnalysisPoll));
}

function handleWrite() {
  requirePath(callApi('/api/write-code', writeState, () => {
    emit('work-started', props.task.id);
  }));
}

// Task detail
const showDetail = ref(false);
const detail = ref<TaskDetail | null>(null);
const detailLoading = ref(false);
const detailError = ref('');

const renderedDescription = computed(() =>
  detail.value?.description ? (marked.parse(detail.value.description) as string) : ''
);

function renderComment(text: string): string {
  return text ? (marked.parse(text) as string) : '';
}

async function openDetail() {
  showDetail.value = true;
  if (detail.value) return;
  detailLoading.value = true;
  detailError.value = '';
  try {
    const res = await fetch(`/api/tasks/${props.task.id}`, { headers: authHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    detail.value = await res.json();
  } catch (err) {
    detailError.value = `Не удалось загрузить задачу: ${(err as Error).message}`;
  } finally {
    detailLoading.value = false;
  }
}

function formatDate(ts: number) {
  if (!ts) return '';
  return new Date(ts).toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}
</script>

<style scoped>
.task-card {
  background: #1e1e2e;
  border: 1px solid #313244;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.task-id {
  font-size: 11px;
  font-weight: 600;
  color: #89b4fa;
  text-decoration: none;
  letter-spacing: 0.05em;
  display: inline-block;
  max-width: 90px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: bottom;
}

.task-id:hover {
  text-decoration: underline;
}

.btn-detail {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: 1px solid #45475a;
  border-radius: 5px;
  color: #6c7086;
  font-size: 10px;
  padding: 3px 6px;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}

.btn-detail:hover {
  color: #cdd6f4;
  border-color: #89b4fa;
}

.task-title {
  margin: 0;
  font-size: 13px;
  color: #cdd6f4;
  line-height: 1.4;
}

.extra-prompt-wrap {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.extra-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: #6c7086;
  font-size: 11px;
  cursor: pointer;
  padding: 0;
  text-align: left;
  transition: color 0.15s;
}

.extra-toggle:hover {
  color: #a6adc8;
}

.chev {
  display: inline-block;
  color: currentColor;
  line-height: 1;
  transition: transform 0.15s;
}
.chev-sm { font-size: 10px; }
.chev-open { transform: rotate(90deg); }

.extra-hint {
  font-size: 11px;
  color: #fab387;
  font-style: italic;
}

.extra-textarea {
  width: 100%;
  box-sizing: border-box;
  background: #181825;
  border: 1px solid #45475a;
  border-radius: 6px;
  color: #cdd6f4;
  font-size: 12px;
  padding: 7px 9px;
  resize: vertical;
  font-family: inherit;
  line-height: 1.4;
}

.extra-textarea:focus {
  outline: none;
  border-color: #89b4fa;
}

.extra-textarea::placeholder {
  color: #45475a;
}

.task-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 4px;
}

.btn {
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #45475a;
  background: #313244;
  color: #cdd6f4;
  font-size: 12px;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s;
}

.btn:hover:not(:disabled) {
  background: #45475a;
}

.btn:disabled {
  opacity: 0.7;
  cursor: default;
}

.btn-read {
  border-color: #74c7ec;
  color: #74c7ec;
}

.btn-read:hover:not(:disabled) {
  background: #1a3a4a;
}

.btn-write {
  border-color: #a6e3a1;
  color: #a6e3a1;
}

.btn-write:hover:not(:disabled) {
  background: #1e3a2a;
}

.analysis-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border-radius: 6px;
  background: #1e3a2a;
  border: 1px solid #2d4d3a;
  color: #a6e3a1;
  font-size: 12px;
  font-weight: 500;
}

.analysis-banner > span {
  flex: 1;
}

.analysis-view {
  background: none;
  border: 1px solid #2d4d3a;
  border-radius: 4px;
  color: #a6e3a1;
  font-size: 11px;
  padding: 2px 8px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}

.analysis-view:hover {
  background: #253d2e;
  border-color: #3d5d4a;
}

.analysis-path {
  padding: 8px 24px;
  border-bottom: 1px solid #313244;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 11px;
  color: #6c7086;
  word-break: break-all;
  user-select: all;
  cursor: text;
}

.analysis-regen {
  padding: 14px 24px 20px;
  border-top: 1px solid #313244;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.analysis-regen-toggle {
  align-self: flex-start;
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  padding: 0;
  font-size: 11px;
  font-weight: 600;
  color: #6c7086;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  cursor: pointer;
  font-family: inherit;
  transition: color 0.15s;
}

.analysis-regen-toggle:hover {
  color: #a6adc8;
}

.analysis-regen-input {
  width: 100%;
  box-sizing: border-box;
  background: #181825;
  border: 1px solid #45475a;
  border-radius: 6px;
  color: #cdd6f4;
  font-size: 13px;
  padding: 8px 10px;
  resize: vertical;
  font-family: inherit;
  line-height: 1.5;
}

.analysis-regen-input:focus {
  outline: none;
  border-color: #89b4fa;
}

.analysis-regen-input::placeholder {
  color: #45475a;
}

.analysis-regen-btn {
  align-self: flex-start;
}

/* ── modals ── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: #1e1e2e;
  border: 1px solid #45475a;
  border-radius: 10px;
  padding: 24px;
  width: 380px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.modal h3 {
  margin: 0;
  font-size: 15px;
  color: #cdd6f4;
}

.modal-input {
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid #45475a;
  background: #313244;
  color: #cdd6f4;
  font-size: 13px;
  width: 100%;
  box-sizing: border-box;
}

.modal-input:focus {
  outline: none;
  border-color: #89b4fa;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.btn-primary {
  background: #89b4fa;
  color: #1e1e2e;
  border-color: #89b4fa;
  font-weight: 600;
}

.btn-primary:hover:not(:disabled) {
  background: #74c7ec;
  border-color: #74c7ec;
}

/* ── detail modal ── */
.detail-modal {
  background: #1e1e2e;
  border: 1px solid #45475a;
  border-radius: 12px;
  width: 720px;
  max-width: 95vw;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.detail-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #313244;
  flex-shrink: 0;
}

.detail-header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.detail-task-id {
  font-size: 11px;
  font-weight: 600;
  color: #89b4fa;
  text-decoration: none;
  letter-spacing: 0.05em;
  display: inline-block;
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: bottom;
}

.detail-task-id:hover {
  text-decoration: underline;
}

.detail-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #cdd6f4;
  line-height: 1.4;
}

.detail-close {
  background: none;
  border: none;
  color: #6c7086;
  font-size: 16px;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  flex-shrink: 0;
  line-height: 1;
  transition: color 0.15s;
}

.detail-close:hover {
  color: #cdd6f4;
}

.detail-loading {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 40px 24px;
  color: #6c7086;
  font-size: 13px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #45475a;
  border-top-color: #89b4fa;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.detail-error {
  padding: 24px;
  color: #f38ba8;
  font-size: 13px;
}

.detail-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 20px;
  padding: 14px 24px;
  border-bottom: 1px solid #313244;
  flex-shrink: 0;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.meta-label {
  font-size: 11px;
  color: #6c7086;
  white-space: nowrap;
}

.meta-value {
  font-size: 12px;
  color: #a6adc8;
}

.meta-badge {
  font-size: 11px;
  padding: 2px 7px;
  border-radius: 4px;
  font-weight: 600;
}

.status-badge {
  background: #313244;
  color: #89b4fa;
  border: 1px solid #45475a;
}

.detail-scroll {
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.detail-section {
  padding: 16px 24px;
  border-bottom: 1px solid #313244;
}

.detail-section:last-child {
  border-bottom: none;
  padding-bottom: 24px;
}

.section-label {
  font-size: 11px;
  font-weight: 600;
  color: #6c7086;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 10px;
}

.detail-description {
  font-size: 13px;
  color: #cdd6f4;
  line-height: 1.6;
  word-break: break-word;
}

.detail-empty {
  font-size: 12px;
  color: #45475a;
  font-style: italic;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.comment {
  background: #181825;
  border: 1px solid #313244;
  border-radius: 8px;
  padding: 12px;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.comment-author {
  font-size: 12px;
  font-weight: 600;
  color: #89b4fa;
}

.comment-date {
  font-size: 11px;
  color: #585b70;
}

.comment-text {
  font-size: 13px;
  color: #cdd6f4;
  line-height: 1.5;
  word-break: break-word;
}

.markdown-body {
  font-size: 13px;
  color: #cdd6f4;
  line-height: 1.6;
  word-break: break-word;
}

.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3),
.markdown-body :deep(h4) {
  color: #cba6f7;
  margin: 1em 0 0.4em;
  font-weight: 700;
  line-height: 1.3;
}
.markdown-body :deep(h1) { font-size: 16px; }
.markdown-body :deep(h2) { font-size: 14px; }
.markdown-body :deep(h3),
.markdown-body :deep(h4) { font-size: 13px; }
.markdown-body :deep(p) { margin: 0.4em 0; }
.markdown-body :deep(p:first-child) { margin-top: 0; }
.markdown-body :deep(p:last-child) { margin-bottom: 0; }
.markdown-body :deep(ul),
.markdown-body :deep(ol) { padding-left: 20px; margin: 0.4em 0; }
.markdown-body :deep(li) { margin: 0.2em 0; }
.markdown-body :deep(code) {
  background: #11111b;
  border: 1px solid #313244;
  border-radius: 4px;
  padding: 1px 5px;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 12px;
  color: #a6e3a1;
}
.markdown-body :deep(pre) {
  background: #11111b;
  border: 1px solid #313244;
  border-radius: 6px;
  padding: 10px 12px;
  overflow-x: auto;
  margin: 0.5em 0;
}
.markdown-body :deep(pre code) {
  background: none;
  border: none;
  padding: 0;
  font-size: 12px;
}
.markdown-body :deep(blockquote) {
  border-left: 3px solid #45475a;
  padding-left: 10px;
  color: #a6adc8;
  margin: 0.5em 0;
}
.markdown-body :deep(hr) {
  border: none;
  border-top: 1px solid #313244;
  margin: 0.8em 0;
}
.markdown-body :deep(strong) { color: #f5c2e7; font-weight: 700; }
.markdown-body :deep(em) { color: #f9e2af; }
.markdown-body :deep(a) { color: #89b4fa; text-decoration: none; }
.markdown-body :deep(a:hover) { text-decoration: underline; }
.markdown-body :deep(img) { max-width: 100%; border-radius: 6px; margin: 0.4em 0; }
.markdown-body :deep(table) {
  border-collapse: collapse;
  margin: 0.5em 0;
  font-size: 12px;
}
.markdown-body :deep(th),
.markdown-body :deep(td) {
  border: 1px solid #313244;
  padding: 4px 8px;
  text-align: left;
}
.markdown-body :deep(th) {
  background: #181825;
  color: #a6adc8;
}
</style>
