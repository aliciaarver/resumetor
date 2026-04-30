<template>
  <!-- Tracker selector -->
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
      <label class="field-label">YouTrack URL <span class="required">*</span></label>
      <input
        v-model="form.youtrackUrl"
        class="field-input"
        type="url"
        placeholder="https://your-team.youtrack.cloud"
        autocomplete="off"
      />
    </div>
    <div class="field-group">
      <label class="field-label">YouTrack токен <span class="required">*</span></label>
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
        Trello API Key <span class="required">*</span>
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
      <label class="field-label">Trello API Token <span class="required">*</span></label>
      <input
        v-model="form.trelloToken"
        class="field-input"
        type="password"
        placeholder="API Token"
        autocomplete="off"
      />
    </div>
    <div class="field-group">
      <label class="field-label">Board ID <span class="required">*</span></label>
      <input
        v-model="form.trelloBoardId"
        class="field-input"
        type="text"
        placeholder="Из URL: trello.com/b/{boardId}/..."
        autocomplete="off"
      />
    </div>
  </template>

  <!-- Repo path -->
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

  <!-- Figma token -->
  <div class="field-group">
    <label class="field-label">
      Figma токен
      <span class="field-optional">необязательно</span>
    </label>
    <input
      v-model="form.figmaToken"
      class="field-input"
      type="password"
      placeholder="figd_..."
      autocomplete="off"
    />
  </div>

  <!-- Git host -->
  <div class="tracker-group">
    <div class="tracker-label">Хост репозиториев</div>
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
  </div>

  <template v-if="form.gitHost === 'gitlab'">
    <div class="field-group">
      <label class="field-label">GitLab URL <span class="required">*</span></label>
      <input
        v-model="form.gitlabUrl"
        class="field-input"
        type="url"
        placeholder="https://gitlab.com или https://gitlab.your-company.com"
        autocomplete="off"
      />
    </div>
    <div class="field-group">
      <label class="field-label">GitLab токен <span class="required">*</span></label>
      <input
        v-model="form.gitlabToken"
        class="field-input"
        type="password"
        placeholder="glpat-..."
        autocomplete="off"
      />
    </div>
  </template>
  <template v-else-if="form.gitHost === 'github'">
    <div class="field-group">
      <label class="field-label">GitHub токен <span class="required">*</span></label>
      <input
        v-model="form.githubToken"
        class="field-input"
        type="password"
        placeholder="ghp_..."
        autocomplete="off"
      />
    </div>
  </template>
</template>

<script setup lang="ts">
import type { TrackerType, GitHost } from '../composables/useAuth';

export interface CredentialsFormData {
  tracker: TrackerType;
  youtrackUrl: string;
  youtrackToken: string;
  trelloKey: string;
  trelloToken: string;
  trelloBoardId: string;
  repoPath: string;
  figmaToken: string;
  gitHost: GitHost;
  githubToken: string;
  gitlabToken: string;
  gitlabUrl: string;
}

defineProps<{
  form: CredentialsFormData;
}>();
</script>

<style scoped>
/* Tracker / Git host selector */
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
  min-width: 0;
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

.divider {
  height: 1px;
  background: #313244;
  margin: 2px 0;
}

/* Inputs */
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

.required {
  color: #f38ba8;
  font-weight: 700;
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
</style>
