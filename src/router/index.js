import { createRouter, createWebHistory } from 'vue-router';
import BuilderView from '@/views/BuilderView.vue';
export default createRouter({
    history: createWebHistory(),
    routes: [{ path: '/', component: BuilderView }],
});
