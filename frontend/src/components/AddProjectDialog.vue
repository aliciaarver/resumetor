<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay" @click.self="close">
      <div class="add-modal">
        <div class="modal-head">
          <h3>Новый проект</h3>
          <button class="close-x" @click="close" title="Закрыть">✕</button>
        </div>

        <div class="modal-hint">
          Имя проекта подставится автоматически из названия папки. Переименовать можно потом в настройках.
        </div>

        <form class="form" @submit.prevent="submit">
          <CredentialsForm :form="form" />

          <div v-if="error" class="form-error">{{ error }}</div>

          <div class="form-footer">
            <button type="button" class="cancel-btn" @click="close">Отмена</button>
            <button type="submit" class="confirm-btn">Создать проект</button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { useProjects } from '../composables/useProjects';
import { normalizeCreds, type TrackerType, type GitHost } from '../composables/useAuth';
import CredentialsForm from './CredentialsForm.vue';

const props = defineProps<{ show: boolean }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const { addProject } = useProjects();

function makeBlank() {
  return {
    tracker: 'youtrack' as TrackerType,
    youtrackUrl: '',
    youtrackToken: '',
    trelloKey: '',
    trelloToken: '',
    trelloBoardId: '',
    repoPath: '',
    figmaToken: '',
    gitHost: '' as GitHost,
    githubToken: '',
    gitlabToken: '',
    gitlabUrl: '',
    roles: [] as never[],
  };
}

const form = reactive(makeBlank());
const error = ref('');

// Сброс формы при каждом открытии.
watch(
  () => props.show,
  (open) => {
    if (open) {
      Object.assign(form, makeBlank());
      error.value = '';
    }
  },
  { immediate: true }
);

function close() {
  emit('close');
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

function deriveProjectName(repoPath: string): string {
  const trimmed = (repoPath || '').trim().replace(/\/+$/, '');
  if (!trimmed) return ''; // addProject автонумерует если имя пустое
  const segs = trimmed.split('/');
  return segs[segs.length - 1] || '';
}

function submit() {
  error.value = '';
  const msg = validate();
  if (msg) {
    error.value = msg;
    return;
  }
  const creds = normalizeCreds({ ...form });
  const name = deriveProjectName(form.repoPath);
  addProject(name, creds);
  close();
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  z-index: 1000;
  padding: 40px 16px;
  overflow-y: auto;
}

.add-modal {
  background: #1e1e2e;
  border: 1px solid #45475a;
  border-radius: 14px;
  width: 100%;
  max-width: 420px;
  padding: 24px 28px 28px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.modal-head h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: #cdd6f4;
}

.close-x {
  background: transparent;
  border: none;
  color: #6c7086;
  font-size: 16px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: color 0.15s;
}

.close-x:hover {
  color: #cdd6f4;
}

.modal-hint {
  font-size: 12px;
  color: #6c7086;
  line-height: 1.5;
  padding: 8px 10px;
  background: #181825;
  border: 1px solid #313244;
  border-radius: 6px;
  margin-bottom: 8px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-error {
  background: #3b1c1c;
  border: 1px solid #f38ba8;
  color: #f38ba8;
  padding: 9px 12px;
  border-radius: 6px;
  font-size: 12px;
}

.form-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 4px;
}

.cancel-btn,
.confirm-btn {
  padding: 9px 18px;
  border-radius: 7px;
  font-size: 13px;
  cursor: pointer;
  font-family: inherit;
  font-weight: 600;
  transition: background 0.15s, border-color 0.15s;
}

.cancel-btn {
  background: transparent;
  border: 1px solid #45475a;
  color: #cdd6f4;
}

.cancel-btn:hover {
  border-color: #89b4fa;
}

.confirm-btn {
  background: #89b4fa;
  border: 1px solid #89b4fa;
  color: #1e1e2e;
}

.confirm-btn:hover {
  background: #74c7ec;
  border-color: #74c7ec;
}
</style>
