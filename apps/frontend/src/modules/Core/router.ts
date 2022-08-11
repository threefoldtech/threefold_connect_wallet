import Init from '@/modules/Core/views/Init.vue';
import PathNotFound from '@/modules/Core/views/PathNotFound.vue';
import { Router } from 'vue-router';
import FarmerInit from '@/modules/Farm/views/FarmerInit.vue';
import { initializedUser } from '@/modules/Core/services/crypto.service';
import axios from 'axios';

const coreRoutes = [
    {
        path: '/404',
        name: '404',
        component: PathNotFound,
        props: true,
    },
    {
        path: '/error',
        name: 'error',
        component: PathNotFound,
        props: true,
    },
    {
        path: '/:pathMatch(.*)',
        redirect: '/404',
    },
];

export default async (router: Router) => {
    const farmerOnly = 1;

    router.addRoute({
        path: '/init',
        name: 'init',
        component: farmerOnly === 1 ? FarmerInit : Init,
        props: true,
    });

    router.beforeEach((to, from, next) => {
        if (to.name === 'dev' || to.name === 'devLogs' || to.name === 'devActions') {
            next();
            return;
        }

        if (to.name !== 'init' && !initializedUser.value) {
            next({ name: 'init' });
            return;
        }
        next();
    });

    coreRoutes.forEach(route => {
        router.addRoute(route);
    });
};
