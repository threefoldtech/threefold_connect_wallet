import { Router, RouterView } from 'vue-router';
import ConfirmBridge from '@/modules/Bridge/views/ConfirmBridge.vue';
import Bridge from '@/modules/Bridge/views/Bridge.vue';

export const bridgeRoutes = [
    {
        path: '/bridge',
        component: RouterView,
        children: [
            {
                path: 'confirm/:walletId/:amount',
                name: 'confirmBridge',
                component: ConfirmBridge,
            },
            {
                path: ':basePublicKey',
                name: 'bridge',
                component: Bridge,
            },
        ],
    },
];

export default async (router: Router) => {
    for (const route of bridgeRoutes) {
        router.addRoute(route);
    }
};
