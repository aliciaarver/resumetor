<template>
  <div class="login-bg">
    <div class="login-card">
      <div class="login-logo">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="8" fill="#313244"/>
          <path d="M8 22 L16 10 L24 22" stroke="#89b4fa" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          <path d="M11 18 L21 18" stroke="#cba6f7" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
      <h1 class="login-title">AI Dashboard</h1>

      <form class="login-form" @submit.prevent="submit">
        <!-- Tracker selection -->
        <div class="tracker-group">
          <div class="tracker-label">Какой трекер используешь?</div>
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
        </div>

        <div class="divider" />

        <!-- YouTrack fields -->
        <template v-if="form.tracker === 'youtrack'">
          <div class="field-group">
            <label class="field-label">YouTrack URL</label>
            <input
              v-model="form.youtrackUrl"
              class="field-input"
              type="url"
              placeholder="https://your-team.youtrack.cloud"
              autocomplete="off"
            />
          </div>
          <div class="field-group">
            <label class="field-label">YouTrack токен</label>
            <input
              v-model="form.youtrackToken"
              class="field-input"
              type="password"
              placeholder="perm:..."
              autocomplete="off"
            />
          </div>
        </template>

        <!-- Trello fields -->
        <template v-else>
          <div class="field-group">
            <label class="field-label">
              Trello API Key
              <a class="field-link" href="https://trello.com/app-key" target="_blank">trello.com/app-key →</a>
            </label>
            <input
              v-model="form.trelloKey"
              class="field-input"
              type="password"
              placeholder="API Key"
              autocomplete="off"
            />
          </div>
          <div class="field-group">
            <label class="field-label">Trello API Token</label>
            <input
              v-model="form.trelloToken"
              class="field-input"
              type="password"
              placeholder="API Token"
              autocomplete="off"
            />
          </div>
          <div class="field-group">
            <label class="field-label">Board ID</label>
            <input
              v-model="form.trelloBoardId"
              class="field-input"
              type="text"
              placeholder="Из URL: trello.com/b/{boardId}/..."
              autocomplete="off"
            />
          </div>
        </template>

        <!-- Repo path (shared) -->
        <div class="field-group">
          <label class="field-label">Путь к репозиторию</label>
          <input
            v-model="form.repoPath"
            class="field-input"
            type="text"
            placeholder="/Users/name/projects/my-app"
            autocomplete="off"
            spellcheck="false"
          />
        </div>

        <!-- Figma (shared) -->
        <div class="field-group">
          <label class="field-label">
            Figma
            <span class="field-optional">необязательно</span>
          </label>
          <input
            v-model="form.figmaToken"
            class="field-input"
            type="password"
            placeholder="Токен: figd_..."
            autocomplete="off"
          />
          <input
            v-model="form.figmaUrl"
            class="field-input"
            style="margin-top: 6px"
            type="url"
            placeholder="Ссылка на проект: figma.com/..."
            autocomplete="off"
          />
        </div>

        <div v-if="error" class="login-error">{{ error }}</div>

        <label class="remember-label">
          <input v-model="form.remember" type="checkbox" class="remember-checkbox" />
          <span class="remember-custom" :class="{ checked: form.remember }">
            <svg v-if="form.remember" width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 5 L4.2 7.5 L8 2.5" stroke="#1e1e2e" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
          <span class="remember-text">Запомнить меня</span>
        </label>

        <button class="login-btn" type="submit">Войти</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useAuth, type TrackerType } from '../composables/useAuth';

const { login } = useAuth();
const error = ref('');

const form = reactive({
  tracker: 'youtrack' as TrackerType,
  youtrackUrl: '',
  youtrackToken: '',
  trelloKey: '',
  trelloToken: '',
  trelloBoardId: '',
  repoPath: '',
  figmaToken: '',
  figmaUrl: '',
  remember: false,
});

function submit() {
  error.value = '';

  if (form.tracker === 'youtrack') {
    if (!form.youtrackUrl.trim() || !form.youtrackToken.trim()) {
      error.value = 'Заполните YouTrack URL и токен';
      return;
    }
  } else {
    if (!form.trelloKey.trim() || !form.trelloToken.trim() || !form.trelloBoardId.trim()) {
      error.value = 'Заполните API Key, API Token и Board ID';
      return;
    }
  }

  login({
    tracker: form.tracker,
    youtrackUrl: form.youtrackUrl.trim(),
    youtrackToken: form.youtrackToken.trim(),
    trelloKey: form.trelloKey.trim(),
    trelloToken: form.trelloToken.trim(),
    trelloBoardId: form.trelloBoardId.trim(),
    repoPath: form.repoPath.trim(),
    figmaToken: form.figmaToken.trim(),
    figmaUrl: form.figmaUrl.trim(),
    remember: form.remember,
  });
}
</script>

<style scoped>
.login-bg {
  min-height: 100vh;
  background: #181825;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.login-card {
  background: #1e1e2e;
  border: 1px solid #313244;
  border-radius: 14px;
  padding: 36px 32px;
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.login-logo {
  margin-bottom: 4px;
}

.login-title {
  margin: 0 0 20px;
  font-size: 20px;
  font-weight: 700;
  color: #cdd6f4;
}

.login-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* Tracker selector */
.tracker-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tracker-label {
  font-size: 13px;
  font-weight: 600;
  color: #cdd6f4;
}

.tracker-options {
  display: flex;
  gap: 10px;
}

.tracker-option {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1.5px solid #313244;
  background: #181825;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  user-select: none;
}

.tracker-option.active {
  border-color: #89b4fa;
  background: #1a2640;
}

.tracker-radio {
  display: none;
}

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

.divider {
  height: 1px;
  background: #313244;
  margin: 2px 0;
}

/* Fields */
.field-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.field-label {
  font-size: 12px;
  font-weight: 600;
  color: #a6adc8;
  display: flex;
  align-items: center;
  gap: 6px;
}

.field-optional {
  font-size: 11px;
  font-weight: 400;
  color: #585b70;
}

.field-link {
  font-size: 11px;
  font-weight: 400;
  color: #89b4fa;
  text-decoration: none;
  margin-left: auto;
}

.field-link:hover {
  text-decoration: underline;
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

.login-error {
  background: #3b1c1c;
  border: 1px solid #f38ba8;
  color: #f38ba8;
  padding: 9px 12px;
  border-radius: 6px;
  font-size: 12px;
}

/* Remember me */
.remember-label {
  display: flex;
  align-items: center;
  gap: 9px;
  cursor: pointer;
  user-select: none;
}

.remember-checkbox {
  display: none;
}

.remember-custom {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1.5px solid #45475a;
  background: #181825;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.15s, border-color 0.15s;
}

.remember-custom.checked {
  background: #89b4fa;
  border-color: #89b4fa;
}

.remember-text {
  font-size: 13px;
  color: #a6adc8;
}

.login-btn {
  margin-top: 4px;
  padding: 10px;
  border-radius: 7px;
  border: none;
  background: #89b4fa;
  color: #1e1e2e;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
  width: 100%;
}

.login-btn:hover {
  background: #74c7ec;
}
</style>
