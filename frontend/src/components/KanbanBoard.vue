<template>
  <div class="board-container">
    <div class="board-header">
      <h1 class="board-title">AI Dashboard</h1>
      <div class="header-actions">
        <nav class="role-tabs">
          <router-link to="/" class="role-tab" exact-active-class="active">Задачи</router-link>
          <router-link to="/pm" class="role-tab" exact-active-class="active">ПМ</router-link>
          <router-link to="/lead" class="role-tab" exact-active-class="active">Тех. лид</router-link>
        </nav>
        <button class="logout-btn" @click="logout" title="Выйти">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Выйти
        </button>
      </div>
    </div>

    <router-view />
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '../composables/useAuth';

const { logout } = useAuth();
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
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.board-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #cdd6f4;
}

.role-tabs {
  display: flex;
  gap: 2px;
  background: #181825;
  border: 1px solid #313244;
  border-radius: 7px;
  padding: 3px;
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
}

.logout-btn:hover {
  color: #f38ba8;
  border-color: #f38ba8;
}
</style>
