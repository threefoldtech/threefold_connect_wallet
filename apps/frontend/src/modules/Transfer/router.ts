import { Router, RouterView } from 'vue-router';
import Send from '@/modules/Transfer/views/Send.vue';
import Receive from '@/modules/Transfer/views/Receive.vue';
import ConfirmSend from '@/modules/Transfer/views/ConfirmSend.vue';

export const transferRoutes = [
    {
        path: '/transfer',
        component: RouterView,
        children: [
            {
                path: 'send',
                name: 'send',
                component: Send,
                props: true,
            },
            {
                path: 'receive/',
                name: 'receive',
                component: Receive,
                props: true,
            },
            {
                path: 'confirm/send/:from/:to/:amount/:asset',
                name: 'confirmSend',
                component: ConfirmSend,
            },
        ],
    },
];

export default async (router: Router) => {
    for (const route of transferRoutes) {
        router.addRoute(route);
    }
};
