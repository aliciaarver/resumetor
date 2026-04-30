<template>
  <div class="settings-page">
    <div class="settings-head">
      <div class="settings-name-row">
        <template v-if="!editingName">
          <h2 class="settings-title">{{ activeProject?.name ?? 'Настройки' }}</h2>
          <button class="head-btn" @click="startRename" title="Переименовать">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z"/>
            </svg>
          </button>
        </template>
        <template v-else>
          <input
            ref="renameInput"
            v-model="renameValue"
            class="rename-input"
            type="text"
            @keydown.enter="confirmRename"
            @keydown.escape="cancelRename"
            @blur="confirmRename"
          />
        </template>
      </div>
      <button class="head-btn delete-btn" @click="deleteActiveProject" title="Удалить проект">
        Удалить проект
      </button>
    </div>

    <form class="settings-form" @submit.prevent="save">
      <!-- Tracker -->
      <section class="settings-section">
        <div class="section-title">Трекер задач</div>
        <div class="tracker-options">
          <label class="tracker-option" :class="{ active: form.tracker === 'youtrack' }">
            <input v-model="form.tracker" type="radio" value="youtrack" class="tracker-radio" />
            <span class="tracker-radio-custom" :class="{ checked: form.tracker === 'youtrack' }" />
            <span class="tracker-name">YouTrack</span>
          </label>
          <label class="tracker-option" :class="{ active: form.tracker === 'trello' }">
            <input v-model="form.tracker" type="radio" value="trello" class="tracker-radio" />
            <span class="tracker-radio-custom" :class="{ checked: form.tracker === 'trello' }" />
            <span class="tracker-name">Trello</span>
          </label>
        </div>

        <template v-if="form.tracker === 'youtrack'">
          <div class="field-group">
            <label class="field-label">YouTrack URL <span class="required">*</span></label>
            <input v-model="form.youtrackUrl" class="field-input" type="url" placeholder="https://your-team.youtrack.cloud" autocomplete="off" />
          </div>
          <div class="field-group">
            <label class="field-label">YouTrack токен <span class="required">*</span></label>
            <input v-model="form.youtrackToken" class="field-input" type="password" placeholder="perm:..." autocomplete="off" />
          </div>
        </template>
        <template v-else>
          <div class="field-group">
            <label class="field-label">Trello API Key <span class="required">*</span></label>
            <input v-model="form.trelloKey" class="field-input" type="password" placeholder="API Key" autocomplete="off" />
          </div>
          <div class="field-group">
            <label class="field-label">Trello API Token <span class="required">*</span></label>
            <input v-model="form.trelloToken" class="field-input" type="password" placeholder="API Token" autocomplete="off" />
          </div>
          <div class="field-group">
            <label class="field-label">Board ID <span class="required">*</span></label>
            <input v-model="form.trelloBoardId" class="field-input" type="text" placeholder="Из URL: trello.com/b/{boardId}/..." autocomplete="off" />
          </div>
        </template>
      </section>

      <!-- Repo -->
      <section class="settings-section">
        <div class="section-title">Репозиторий</div>
        <div class="field-group">
          <label class="field-label">Путь к репозиторию по умолчанию</label>
          <input v-model="form.repoPath" class="field-input" type="text" placeholder="/Users/name/projects/my-app" autocomplete="off" spellcheck="false" />
        </div>
      </section>

      <!-- Figma -->
      <section class="settings-section">
        <div class="section-title">Figma</div>
        <div class="field-group">
          <label class="field-label">Figma токен</label>
          <input v-model="form.figmaToken" class="field-input" type="password" placeholder="figd_..." autocomplete="off" />
        </div>
      </section>

      <!-- Git host -->
      <section class="settings-section">
        <div class="section-title">Хост репозиториев (для MR/PR)</div>
        <div class="tracker-options">
          <label class="tracker-option" :class="{ active: form.gitHost === '' }">
            <input v-model="form.gitHost" type="radio" value="" class="tracker-radio" />
            <span class="tracker-radio-custom" :class="{ checked: form.gitHost === '' }" />
            <span class="tracker-name">Нет</span>
          </label>
          <label class="tracker-option" :class="{ active: form.gitHost === 'github' }">
            <input v-model="form.gitHost" type="radio" value="github" class="tracker-radio" />
            <span class="tracker-radio-custom" :class="{ checked: form.gitHost === 'github' }" />
            <span class="tracker-name">GitHub</span>
          </label>
          <label class="tracker-option" :class="{ active: form.gitHost === 'gitlab' }">
            <input v-model="form.gitHost" type="radio" value="gitlab" class="tracker-radio" />
            <span class="tracker-radio-custom" :class="{ checked: form.gitHost === 'gitlab' }" />
            <span class="tracker-name">GitLab</span>
          </label>
        </div>

        <template v-if="form.gitHost === 'gitlab'">
          <div class="field-group">
            <label class="field-label">GitLab URL <span class="required">*</span></label>
            <input v-model="form.gitlabUrl" class="field-input" type="url" placeholder="https://gitlab.com или https://gitlab.your-company.com" autocomplete="off" />
          </div>
          <div class="field-group">
            <label class="field-label">GitLab токен <span class="required">*</span></label>
            <input v-model="form.gitlabToken" class="field-input" type="password" placeholder="glpat-..." autocomplete="off" />
          </div>
        </template>
        <template v-else-if="form.gitHost === 'github'">
          <div class="field-group">
            <label class="field-label">GitHub токен <span class="required">*</span></label>
            <input v-model="form.githubToken" class="field-input" type="password" placeholder="ghp_..." autocomplete="off" />
          </div>
        </template>
      </section>

      <!-- Columns -->
      <section class="settings-section">
        <div class="section-title">Колонки доски</div>
        <div class="section-desc">Выбери, какие колонки показывать и в каком порядке. Если ни одна не выбрана — показываются все.</div>
        <button type="button" class="load-cols-btn" :disabled="loadingCols" @click="loadColumns">
          {{ loadingCols ? 'Загружаю...' : 'Загрузить колонки из трекера' }}
        </button>
        <div v-if="colsError" class="cols-error">{{ colsError }}</div>
        <div v-if="availableCols.length" class="cols-list">
          <label v-for="col in availableCols" :key="col" class="col-check">
            <input type="checkbox" :value="col" v-model="form.columns" />
            <span>{{ col }}</span>
          </label>
        </div>
      </section>

      <!-- Roles -->
      <section class="settings-section">
        <div class="section-title">Роли</div>
        <div class="section-desc">По умолчанию ролей нет. Включи нужные — в навбаре появятся соответствующие табы.</div>
        <label
          v-for="opt in roleOptions"
          :key="opt.value"
          class="role-check"
        >
          <input v-model="form.roles" type="checkbox" :value="opt.value" />
          <span>{{ opt.label }}</span>
        </label>
      </section>

      <div v-if="error" class="settings-error">{{ error }}</div>

      <div class="settings-footer">
        <button class="save-btn" type="submit" :disabled="saving">
          {{ saving ? 'Сохраняю...' : 'Сохранить' }}
        </button>
        <span v-if="savedAt" class="saved-flash">Сохранено ✓</span>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch, nextTick } from 'vue';
import { useAuth, normalizeCreds, type TrackerType, type GitHost, type Role } from '../composables/useAuth';
import { useProjects } from '../composables/useProjects';

const { credentials, updateCredentials } = useAuth();
const { activeProject, renameProject, deleteProject } = useProjects();

function makeFormFromCreds() {
  const c = credentials.value;
  return {
    tracker: (c?.tracker ?? 'youtrack') as TrackerType,
    youtrackUrl: c?.youtrackUrl ?? '',
    youtrackToken: c?.youtrackToken ?? '',
    trelloKey: c?.trelloKey ?? '',
    trelloToken: c?.trelloToken ?? '',
    trelloBoardId: c?.trelloBoardId ?? '',
    repoPath: c?.repoPath ?? '',
    figmaToken: c?.figmaToken ?? '',
    gitHost: (c?.gitHost ?? '') as GitHost,
    githubToken: c?.githubToken ?? '',
    gitlabToken: c?.gitlabToken ?? '',
    gitlabUrl: c?.gitlabUrl ?? '',
    roles: [...(c?.roles ?? [])] as Role[],
    columns: [...(c?.columns ?? [])] as string[],
  };
}

const form = reactive(makeFormFromCreds());

// При переключении проекта (activeProject меняется) — перезаливаем форму с новыми кредами.
watch(
  () => activeProject.value?.id,
  () => {
    Object.assign(form, makeFormFromCreds());
    error.value = '';
    savedAt.value = 0;
  }
);

const roleOptions: { value: Role; label: string }[] = [
  { value: 'pm', label: 'ПМ — продуктовый менеджер' },
  { value: 'lead', label: 'Тех. лид' },
];

const error = ref('');
const saving = ref(false);
const savedAt = ref(0);

const availableCols = ref<string[]>([]);
const loadingCols = ref(false);
const colsError = ref('');

async function loadColumns() {
  loadingCols.value = true;
  colsError.value = '';
  try {
    const res = await fetch('/api/columns', { headers: authHeaders() });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `HTTP ${res.status}`);
    }
    const cols: string[] = await res.json();
    availableCols.value = cols;
    // Добавляем новые колонки в список доступных, не сбрасывая выбор пользователя
    for (const col of cols) {
      if (!form.columns.includes(col)) {
        // Не выбираем автоматически — пусть пользователь решит
      }
    }
  } catch (e) {
    colsError.value = `Ошибка: ${(e as Error).message}`;
  } finally {
    loadingCols.value = false;
  }
}

// Inline rename
const editingName = ref(false);
const renameValue = ref('');
const renameInput = ref<HTMLInputElement | null>(null);

function startRename() {
  renameValue.value = activeProject.value?.name ?? '';
  editingName.value = true;
  nextTick(() => {
    renameInput.value?.focus();
    renameInput.value?.select();
  });
}

function confirmRename() {
  const name = renameValue.value.trim();
  if (name && activeProject.value) {
    renameProject(activeProject.value.id, name);
  }
  editingName.value = false;
}

function cancelRename() {
  editingName.value = false;
}

function deleteActiveProject() {
  if (!activeProject.value) return;
  const name = activeProject.value.name;
  const ok = window.confirm(
    `Удалить проект «${name}»? Все настройки и per-task параметры этого проекта будут стёрты.`
  );
  if (!ok) return;
  deleteProject(activeProject.value.id);
}

function validate(): string {
  if (form.tracker === 'youtrack') {
    if (!form.youtrackUrl.trim() || !form.youtrackToken.trim()) {
      return 'Заполни YouTrack URL и токен';
    }
  } else {
    if (!form.trelloKey.trim() || !form.trelloToken.trim() || !form.trelloBoardId.trim()) {
      return 'Заполни API Key, API Token и Board ID для Trello';
    }
  }
  if (form.gitHost === 'gitlab' && (!form.gitlabUrl.trim() || !form.gitlabToken.trim())) {
    return 'Для GitLab нужны URL и токен';
  }
  if (form.gitHost === 'github' && !form.githubToken.trim()) {
    return 'Для GitHub нужен токен';
  }
  return '';
}

function save() {
  error.value = '';
  const msg = validate();
  if (msg) {
    error.value = msg;
    return;
  }
  saving.value = true;
  try {
    const creds = normalizeCreds({
      tracker: form.tracker,
      youtrackUrl: form.youtrackUrl,
      youtrackToken: form.youtrackToken,
      trelloKey: form.trelloKey,
      trelloToken: form.trelloToken,
      trelloBoardId: form.trelloBoardId,
      repoPath: form.repoPath,
      figmaToken: form.figmaToken,
      gitHost: form.gitHost,
      githubToken: form.githubToken,
      gitlabToken: form.gitlabToken,
      gitlabUrl: form.gitlabUrl,
      roles: form.roles,
      columns: form.columns,
    });
    updateCredentials(creds);
    savedAt.value = Date.now();
    setTimeout(() => {
      if (Date.now() - savedAt.value >= 2000) savedAt.value = 0;
    }, 2100);
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.settings-page {
  max-width: 560px;
}

.settings-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
}

.settings-name-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.settings-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #cdd6f4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.head-btn {
  background: transparent;
  border: 1px solid #45475a;
  border-radius: 6px;
  color: #6c7086;
  padding: 6px 10px;
  cursor: pointer;
  font-size: 12px;
  transition: color 0.15s, border-color 0.15s;
  font-family: inherit;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.head-btn:hover {
  color: #cdd6f4;
  border-color: #89b4fa;
}

.head-btn.delete-btn:hover {
  color: #f38ba8;
  border-color: #f38ba8;
}

.rename-input {
  background: #181825;
  border: 1px solid #89b4fa;
  border-radius: 6px;
  color: #cdd6f4;
  font-size: 16px;
  font-weight: 700;
  padding: 6px 10px;
  flex: 1;
  font-family: inherit;
}

.rename-input:focus {
  outline: none;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.settings-section {
  background: #1e1e2e;
  border: 1px solid #313244;
  border-radius: 10px;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title {
  font-size: 13px;
  font-weight: 700;
  color: #cdd6f4;
}

.section-desc {
  font-size: 12px;
  color: #6c7086;
  line-height: 1.5;
  margin-top: -6px;
}

.tracker-options {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.tracker-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 8px;
  border: 1.5px solid #313244;
  background: #181825;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  user-select: none;
  flex: 1;
  min-width: 100px;
}

.tracker-option.active {
  border-color: #89b4fa;
  background: #1a2640;
}

.tracker-radio { display: none; }

.tracker-radio-custom {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1.5px solid #45475a;
  background: #181825;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.15s;
}

.tracker-radio-custom.checked {
  border-color: #89b4fa;
  background: #89b4fa;
  box-shadow: inset 0 0 0 3px #181825;
}

.tracker-name {
  font-size: 13px;
  color: #cdd6f4;
  font-weight: 500;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.field-label {
  font-size: 12px;
  font-weight: 600;
  color: #a6adc8;
}

.required {
  color: #f38ba8;
  font-weight: 700;
}

.field-input {
  padding: 9px 12px;
  border-radius: 7px;
  border: 1px solid #45475a;
  background: #181825;
  color: #cdd6f4;
  font-size: 13px;
  width: 100%;
  box-sizing: border-box;
  transition: border-color 0.15s;
}

.field-input:focus {
  outline: none;
  border-color: #89b4fa;
}

.field-input::placeholder {
  color: #45475a;
}

.role-check {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 4px;
  font-size: 13px;
  color: #cdd6f4;
  cursor: pointer;
  user-select: none;
}

.role-check input {
  accent-color: #89b4fa;
  cursor: pointer;
  width: 16px;
  height: 16px;
}

.settings-error {
  background: #3b1c1c;
  border: 1px solid #f38ba8;
  color: #f38ba8;
  padding: 9px 12px;
  border-radius: 6px;
  font-size: 12px;
}

.settings-footer {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 4px;
}

.save-btn {
  padding: 10px 22px;
  border-radius: 7px;
  border: none;
  background: #89b4fa;
  color: #1e1e2e;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}

.save-btn:hover:not(:disabled) {
  background: #74c7ec;
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: default;
}

.saved-flash {
  font-size: 12px;
  color: #a6e3a1;
  font-weight: 500;
}
</style>
