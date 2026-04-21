<template>
  <div class="pm-panel">
    <div class="pm-info">
      <div class="pm-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      </div>
      <div>
        <div class="pm-title">Продуктовый менеджер</div>
        <div class="pm-desc">Анализирует продукт глазами пользователя и бизнеса, обновляет продуктовую доку и предлагает задачи. Задачи в Trello создаются отдельной кнопкой.</div>
      </div>
    </div>

    <div class="pm-actions">
      <button class="analyze-btn" :disabled="running || !repoPath" @click="analyze">
        <svg v-if="!running" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
        <span v-if="running" class="spinner" />
        {{ running ? 'Анализирую...' : 'Запустить анализ' }}
      </button>
    </div>

    <div v-if="!repoPath" class="pm-status pm-status-warn">
      Путь к репозиторию не задан — укажи его при входе в приложение.
    </div>

    <div v-if="running" class="pm-status">
      Claude анализирует проект в терминале — результат появится здесь автоматически
    </div>

    <ProposedTasks
      v-if="repoPath"
      ref="proposedRef"
      role="pm"
      :project-path="repoPath"
    />

    <div v-if="result" class="pm-result">
      <button class="result-label" type="button" @click="resultCollapsed = !resultCollapsed">
        <span class="chev chev-md" :class="{ 'chev-open': !resultCollapsed }">▶</span>
        Результат анализа
      </button>
      <div v-if="!resultCollapsed" class="result-content markdown-body" v-html="renderedResult" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { marked } from 'marked';
import { useAuth } from '../composables/useAuth';
import ProposedTasks from './ProposedTasks.vue';

const { credentials, authHeaders } = useAuth();

const repoPath = computed(() => credentials.value?.repoPath?.trim() ?? '');
const running = ref(false);
const result = ref('');
const resultCollapsed = ref(true);
const proposedRef = ref<InstanceType<typeof ProposedTasks> | null>(null);
const renderedResult = computed(() => result.value ? marked.parse(result.value) as string : '');
let pollTimer: ReturnType<typeof setInterval> | null = null;

async function loadLastResult() {
  if (!repoPath.value) return;
  const params = new URLSearchParams({ projectPath: repoPath.value });
  const res = await fetch(`/api/pm-result?${params}`, { headers: authHeaders() });
  const data = await res.json();
  if (data.result) result.value = data.result;
}

onMounted(loadLastResult);

async function analyze() {
  if (!repoPath.value) return;
  running.value = true;
  result.value = '';

  await fetch('/api/pm-analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ projectPath: repoPath.value }),
  });

  pollTimer = setInterval(async () => {
    const params = new URLSearchParams({ projectPath: repoPath.value });
    const res = await fetch(`/api/pm-result?${params}`, { headers: authHeaders() });
    const data = await res.json();
    if (data.result) {
      result.value = data.result;
      running.value = false;
      if (pollTimer) clearInterval(pollTimer);
      proposedRef.value?.reload();
    }
  }, 3000);
}

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer);
});
</script>

<style scoped>
.pm-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 720px;
}

.pm-info {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  background: #1e1e2e;
  border: 1px solid #313244;
  border-radius: 10px;
  padding: 16px;
}

.pm-icon {
  color: #89b4fa;
  flex-shrink: 0;
  margin-top: 2px;
}

.pm-title {
  font-size: 14px;
  font-weight: 700;
  color: #cdd6f4;
  margin-bottom: 4px;
}

.pm-desc {
  font-size: 13px;
  color: #6c7086;
  line-height: 1.5;
}

.pm-actions {
  display: flex;
  gap: 10px;
  align-items: flex-end;
}

.analyze-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 9px 18px;
  border-radius: 7px;
  border: none;
  background: #89b4fa;
  color: #1e1e2e;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s;
  height: 38px;
}

.analyze-btn:hover:not(:disabled) { background: #74c7ec; }
.analyze-btn:disabled { opacity: 0.6; cursor: default; }

.spinner {
  width: 12px;
  height: 12px;
  border: 2px solid rgba(30,30,46,0.3);
  border-top-color: #1e1e2e;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

@keyframes spin { to { transform: rotate(360deg); } }

.pm-status {
  font-size: 12px;
  color: #6c7086;
  font-style: italic;
}

.pm-status-warn {
  color: #f9e2af;
  font-style: normal;
}

.pm-result {
  background: #1e1e2e;
  border: 1px solid #313244;
  border-radius: 10px;
  overflow: hidden;
}

.result-label {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  font-size: 11px;
  font-weight: 600;
  color: #6c7086;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 12px 16px;
  border: none;
  border-bottom: 1px solid #313244;
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s;
  font-family: inherit;
}
.result-label:hover { background: #181825; }
.chev {
  display: inline-block;
  color: currentColor;
  line-height: 1;
  transition: transform 0.15s;
}
.chev-md { font-size: 12px; }
.chev-open { transform: rotate(90deg); }

.result-content {
  margin: 0;
  padding: 16px 20px;
  font-size: 13px;
  color: #cdd6f4;
  line-height: 1.7;
  word-break: break-word;
  font-family: inherit;
  max-height: 600px;
  overflow-y: auto;
}

.result-content :deep(h1),
.result-content :deep(h2),
.result-content :deep(h3),
.result-content :deep(h4) {
  color: #89b4fa;
  margin: 1.2em 0 0.4em;
  font-weight: 700;
  line-height: 1.3;
}
.result-content :deep(h1) { font-size: 17px; }
.result-content :deep(h2) { font-size: 15px; }
.result-content :deep(h3) { font-size: 13px; }
.result-content :deep(p) { margin: 0.5em 0; }
.result-content :deep(ul),
.result-content :deep(ol) { padding-left: 20px; margin: 0.4em 0; }
.result-content :deep(li) { margin: 0.2em 0; }
.result-content :deep(code) {
  background: #181825;
  border: 1px solid #313244;
  border-radius: 4px;
  padding: 1px 5px;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 12px;
  color: #a6e3a1;
}
.result-content :deep(pre) {
  background: #181825;
  border: 1px solid #313244;
  border-radius: 7px;
  padding: 12px 14px;
  overflow-x: auto;
  margin: 0.6em 0;
}
.result-content :deep(pre code) { background: none; border: none; padding: 0; font-size: 12px; }
.result-content :deep(blockquote) {
  border-left: 3px solid #45475a;
  padding-left: 12px;
  color: #a6adc8;
  margin: 0.5em 0;
}
.result-content :deep(hr) { border: none; border-top: 1px solid #313244; margin: 1em 0; }
.result-content :deep(strong) { color: #f5c2e7; font-weight: 700; }
.result-content :deep(a) { color: #89b4fa; text-decoration: none; }
.result-content :deep(a:hover) { text-decoration: underline; }
</style>
