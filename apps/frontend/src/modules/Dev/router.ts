import DevShell from '@/modules/Dev/views/DevShell.vue';
import Logs from '@/modules/Dev/views/Logs.vue';
import Actions from '@/modules/Dev/views/Actions.vue';
import { RenderFunction } from 'vue';
import { BeakerIcon, TableIcon } from '@heroicons/vue/outline';
import { Router } from 'vue-router';

export const devRoutes = [
    {
        path: '/dev',
        name: 'dev',
        component: DevShell,
        children: [
            {
                path: '',
                name: 'devLogs',
                component: Logs,
                meta: {
                    activeNav: 'devLogs',
                },
            },
            {
                path: '',
                name: 'devActions',
                component: Actions,
                meta: {
                    activeNav: 'devActions',
                },
            },
        ],
        meta: {
            bottomNav: [
                { name: 'devLogs', icon: <RenderFunction>TableIcon },
                { name: 'devActions', icon: <RenderFunction>BeakerIcon },
            ],
        },
    },
];

export default async (router: Router) => {
    for (const route of devRoutes) {
        router.addRoute(route);
    }
};
