import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { routes } from './routes';
import { userInitialized } from '@/service/cryptoService';

const router = createRouter({
    routes: <RouteRecordRaw[]>routes,
    history: createWebHistory(),
});

router.beforeEach((to, from, next) => {
    if (to.name !== 'init' && !userInitialized.value) {
        next({ name: 'init' });
        return;
    }
    next();
});

export default router;
