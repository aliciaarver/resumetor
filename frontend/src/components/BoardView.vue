<template>
  <div class="board-view">
    <div class="board-toolbar">
      <button class="refresh-btn" :disabled="loading" @click="loadTasks">
        {{ loading ? 'Загрузка...' : 'Обновить' }}
      </button>
    </div>

    <div v-if="error" class="error-banner">{{ error }}</div>

    <div class="board">
      <div
        v-for="col in columns"
        :key="col.key"
        class="column"
        :class="`column--${col.key}`"
      >
        <div class="column-header">
          <span class="column-title">{{ col.label }}</span>
          <span class="column-count">{{ col.tasks.length }}</span>
        </div>

        <template v-if="loading">
          <div v-for="i in 3" :key="i" class="skeleton" />
        </template>

        <template v-else>
          <TaskCard
            v-for="task in col.tasks"
            :key="task.id"
            :task="task"
            @work-started="onWorkStarted"
          />
          <p v-if="col.tasks.length === 0" class="empty-col">Нет задач</p>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import TaskCard from './TaskCard.vue';
import { useAuth } from '../composables/useAuth';

interface Task {
  id: string;
  title: string;
  status: string;
  branch: string;
  url: string;
}

const { authHeaders } = useAuth();

const tasks = ref<Task[]>([]);
const loading = ref(false);
const error = ref('');

const COLUMNS = [
  { key: 'wip', label: 'В работе', status: 'В работе' },
  { key: 'rework', label: 'На доработку', status: 'На доработку' },
  { key: 'backlog', label: 'В бэклоге', status: 'В бэклоге' },
] as const;

const columns = computed(() =>
  COLUMNS.map((col) => ({
    ...col,
    tasks: tasks.value.filter((t) => t.status === col.status),
  }))
);

async function loadTasks() {
  loading.value = true;
  error.value = '';
  try {
    const res = await fetch('/api/tasks', { headers: authHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    tasks.value = await res.json();
  } catch (err) {
    error.value = `Ошибка загрузки задач: ${(err as Error).message}`;
  } finally {
    loading.value = false;
  }
}

// Пока хотя бы одна задача в работе у Claude — поллим доску, чтобы увидеть
// момент, когда Claude перенесёт карточку в «Готово» и она уедет из активных.
const WORK_POLL_MS = 8000;
const WORK_DEADLINE_MS = 30 * 60 * 1000;
const watchedIds = ref<Set<string>>(new Set());
let pollTimer: ReturnType<typeof setInterval> | null = null;
let pollDeadline = 0;

function onWorkStarted(taskId: string) {
  watchedIds.value.add(taskId);
  pollDeadline = Date.now() + WORK_DEADLINE_MS;
  if (pollTimer) return;
  pollTimer = setInterval(async () => {
    if (Date.now() > pollDeadline) {
      stopPoll();
      return;
    }
    await loadTasks();
    const activeIds = new Set(tasks.value.map((t) => t.id));
    for (const id of [...watchedIds.value]) {
      if (!activeIds.has(id)) watchedIds.value.delete(id);
    }
    if (watchedIds.value.size === 0) stopPoll();
  }, WORK_POLL_MS);
}

function stopPoll() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

onMounted(loadTasks);
onUnmounted(stopPoll);
</script>

<style scoped>
.board-view {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.board-toolbar {
  display: flex;
  justify-content: flex-end;
}

.refresh-btn {
  padding: 7px 16px;
  border-radius: 6px;
  border: 1px solid #45475a;
  background: #313244;
  color: #cdd6f4;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.15s;
}

.refresh-btn:hover:not(:disabled) {
  background: #45475a;
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: default;
}

.error-banner {
  background: #3b1c1c;
  border: 1px solid #f38ba8;
  color: #f38ba8;
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 13px;
}

.board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  align-items: start;
}

.column {
  background: #181825;
  border: 1px solid #313244;
  border-radius: 10px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.column-title {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.column--wip .column-title {
  color: #a6e3a1;
}

.column--rework .column-title {
  color: #f38ba8;
}

.column--backlog .column-title {
  color: #fab387;
}

.column-count {
  background: #313244;
  color: #a6adc8;
  font-size: 11px;
  padding: 2px 7px;
  border-radius: 10px;
}

.skeleton {
  height: 90px;
  background: linear-gradient(90deg, #313244 25%, #3b3d56 50%, #313244 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  border-radius: 8px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.empty-col {
  font-size: 12px;
  color: #585b70;
  text-align: center;
  padding: 16px 0;
  margin: 0;
}
</style>
