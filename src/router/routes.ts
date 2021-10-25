import { RouteRecordRaw } from 'vue-router';
import Home from '@/views/Home.vue';
import PathNotFound from '@/views/PathNotFound.vue';

export const routes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'home',
        component: Home,
    },
    {
        path: '/404',
        name: '404',
        component: PathNotFound,
        // Allows props to be passed to the 404 page through route
        // params, such as `resource` to define what wasn't found.
        props: true,
    },
    {
        path: '/:pathMatch(.*)',
        redirect: '404',
    },
];
