import process from 'process';
import { Buffer } from 'buffer';

import '@polkadot/api-augment'; //see: https://github.com/polkadot-js/api/releases/tag/v7.0.1

window.Buffer = Buffer;
window.process = process;

import { createApp } from 'vue';
import App from './App.vue';
import './index.css';

import '@/components/global';
import { registerGlobalComponent } from './components/global';
import { createVueRouter } from './router';
import { overrideConsole } from '@/util/log';
import axios from 'axios';

import Vue3TouchEvents from 'vue3-touch-events';
import sodium from 'libsodium-wrappers';
import { i18n } from '@/util/translate';
import { getRoutes } from '@/router/routes';

const init = async () => {
    await sodium.ready;
    // @ts-ignore
    globalThis.version = import.meta.env.VITE_VERSION;

    try {
        overrideConsole();
        // @ts-ignore
        console.info(`running version: ${globalThis.version}`);
        axios.interceptors.response.use(undefined, error => {
            const isDev = import.meta.env.DEV;
            if (isDev) return;
            console.error(
                error?.config ? `${error.message}: ${error?.config?.method.toUpperCase()} ${error?.config?.url}` : error
            );
        });
        const { Buffer } = await import('buffer');
        window.Buffer = Buffer;

        const app = createApp(App);

        app.use(i18n);
        app.use(Vue3TouchEvents);

        const routes = await getRoutes();

        const router = createVueRouter(routes);
        app.use(router);
        registerGlobalComponent(app);

        app.mount('#app');
    } catch (e) {
        console.error(e);
        throw e;
    }
};

init();
