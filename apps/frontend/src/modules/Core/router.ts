import Init from '@/modules/Core/views/Init.vue';
import PathNotFound from '@/modules/Core/views/PathNotFound.vue';
import { Router } from 'vue-router';
import FarmerInit from '@/modules/Farm/views/FarmerInit.vue';
import { userInitialized } from '@/modules/Core/services/cryptoService';
import axios from 'axios';

const coreRoutes = [
    {
        path: '/404',
        name: '404',
        component: PathNotFound,
        // Allows props to be passed to the 404 page through route
        // params, such as `resource` to define what wasn't found.
        props: true,
    },
    {
        path: '/error',
        name: 'error',
        component: PathNotFound,
        // Allows props to be passed to the 404 page through route
        // params, such as `resource` to define what wasn't found.
        props: true,
    },
    {
        path: '/:pathMatch(.*)',
        redirect: '/404',
    },
];

export default async (router: Router) => {
    const farmerOnly = parseInt((await axios.get('/api/v1/env')).data.farmerOnly) ?? 1;

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

        if (to.name !== 'init' && !userInitialized.value) {
            next({ name: 'init' });
            return;
        }
        next();
    });

    coreRoutes.forEach(route => {
        router.addRoute(route);
    });
};
