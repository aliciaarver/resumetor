<template>
  <LoginScreen v-if="!credentials" />
  <KanbanBoard v-else />
</template>

<script setup lang="ts">
import { useAuth } from './composables/useAuth';
import LoginScreen from './components/LoginScreen.vue';
import KanbanBoard from './components/KanbanBoard.vue';

const { credentials } = useAuth();
</script>

<style>
*, *::before, *::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #181825;
}
</style>
