import Farmer from '@/modules/Farm/views/Farmer.vue';
import { Router } from 'vue-router';

export const farmRoutes = [
    {
        path: '/farmer',
        name: 'farmer',
        component: Farmer,
    },
];

export default async (router: Router) => {
    for (const route of farmRoutes) {
        router.addRoute(route);
    }
};
