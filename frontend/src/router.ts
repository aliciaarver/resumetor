import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'board',
    component: () => import('./components/BoardView.vue'),
  },
  {
    path: '/pm',
    name: 'pm',
    component: () => import('./components/PmPanel.vue'),
  },
  {
    path: '/lead',
    name: 'lead',
    component: () => import('./components/TechLeadPanel.vue'),
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
