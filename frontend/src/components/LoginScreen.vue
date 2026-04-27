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
        <CredentialsForm :form="form" />

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
import { useAuth, normalizeCreds, type TrackerType, type GitHost } from '../composables/useAuth';
import CredentialsForm from './CredentialsForm.vue';

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
  gitHost: '' as GitHost,
  githubToken: '',
  gitlabToken: '',
  gitlabUrl: '',
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

  if (form.gitHost === 'gitlab') {
    if (!form.gitlabUrl.trim() || !form.gitlabToken.trim()) {
      error.value = 'Для GitLab нужны URL и токен';
      return;
    }
  } else if (form.gitHost === 'github') {
    if (!form.githubToken.trim()) {
      error.value = 'Для GitHub нужен токен';
      return;
    }
  }

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
    roles: [],
  });
  login({ ...creds, remember: form.remember });
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
