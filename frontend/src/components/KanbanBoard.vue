<template>
  <div class="board-container">
    <div class="board-header">
      <!-- Top row: title + projects + logout -->
      <div class="top-row">
        <h1 class="board-title">AI Dashboard</h1>

        <div v-if="projects.length" class="project-tabs">
          <button
            v-for="p in projects"
            :key="p.id"
            class="project-tab"
            :class="{ active: p.id === activeProjectId }"
            @click="switchProject(p.id)"
            :title="p.name"
          >
            {{ p.name }}
          </button>
          <button
            class="project-add"
            title="Добавить проект"
            @click="openAddDialog"
          >
            ＋
          </button>
        </div>

        <button class="logout-btn" @click="logout" title="Выйти из всех проектов">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Выйти
        </button>
      </div>

      <!-- Bottom row: role tabs (within active project) -->
      <nav class="role-tabs">
        <router-link to="/" class="role-tab" exact-active-class="active">Задачи</router-link>
        <router-link v-if="hasRole('pm')" to="/pm" class="role-tab" exact-active-class="active">ПМ</router-link>
        <router-link v-if="hasRole('lead')" to="/lead" class="role-tab" exact-active-class="active">Тех. лид</router-link>
        <router-link to="/settings" class="role-tab settings-tab" exact-active-class="active" title="Настройки проекта">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
          Настройки
        </router-link>
      </nav>
    </div>

    <router-view :key="activeProjectId" />

    <AddProjectDialog :show="showAddDialog" @close="showAddDialog = false" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuth, type Role } from '../composables/useAuth';
import { useProjects } from '../composables/useProjects';
import AddProjectDialog from './AddProjectDialog.vue';

const { credentials, logout } = useAuth();
const { projects, activeProjectId, switchProject } = useProjects();

function hasRole(r: Role): boolean {
  return credentials.value?.roles?.includes(r) ?? false;
}

const showAddDialog = ref(false);

function openAddDialog() {
  showAddDialog.value = true;
}
</script>

<style scoped>
.board-container {
  padding: 24px;
  min-height: 100vh;
  background: #181825;
  color: #cdd6f4;
}

.board-header {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 24px;
}

.top-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.board-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #cdd6f4;
  white-space: nowrap;
}

/* Project tabs */
.project-tabs {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: #11111b;
  border: 1px solid #313244;
  border-radius: 8px;
  flex: 1;
  overflow-x: auto;
}

.project-tab {
  padding: 6px 14px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  color: #6c7086;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
  font-family: inherit;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.project-tab:hover:not(.active) {
  color: #a6adc8;
  background: #1e1e2e;
}

.project-tab.active {
  background: #313244;
  color: #cdd6f4;
  border-color: #45475a;
}

.project-add {
  padding: 6px 12px;
  background: transparent;
  border: 1px dashed #45475a;
  border-radius: 6px;
  color: #6c7086;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s, background 0.15s;
  font-family: inherit;
  flex-shrink: 0;
}

.project-add:hover {
  color: #89b4fa;
  border-color: #89b4fa;
  border-style: solid;
  background: #1a2640;
}

/* Logout */
.logout-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 7px 12px;
  border-radius: 6px;
  border: 1px solid #45475a;
  background: transparent;
  color: #6c7086;
  font-size: 13px;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
  flex-shrink: 0;
}

.logout-btn:hover {
  color: #f38ba8;
  border-color: #f38ba8;
}

/* Role tabs (bottom row) */
.role-tabs {
  display: flex;
  gap: 2px;
  background: #181825;
  border: 1px solid #313244;
  border-radius: 7px;
  padding: 3px;
  align-self: flex-start;
}

.role-tab {
  padding: 5px 14px;
  border-radius: 5px;
  border: none;
  background: transparent;
  color: #6c7086;
  font-size: 13px;
  cursor: pointer;
  text-decoration: none;
  transition: background 0.15s, color 0.15s;
}

.role-tab.active {
  background: #313244;
  color: #cdd6f4;
}

.role-tab:hover:not(.active) {
  color: #a6adc8;
}

.settings-tab {
  display: flex;
  align-items: center;
  gap: 5px;
}
</style>
