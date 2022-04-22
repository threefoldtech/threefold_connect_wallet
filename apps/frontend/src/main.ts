import { createApp } from 'vue';
import App from './App.vue';
import './index.css';

import router from './router';
import { overrideConsole } from '@/util/log';
import axios from 'axios';

import Vue3TouchEvents from 'vue3-touch-events';
import sodium from 'libsodium-wrappers';
import { i18n } from '@/util/translate';

const init = async () => {
    await sodium.ready;
    // @ts-ignore
    globalThis.version = 'development';

    try {
        overrideConsole();
        // @ts-ignore
        console.info(`running version: ${globalThis.version}`);
        axios.interceptors.response.use(undefined, error => {
            const isDev = true;
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
        app.use(router);

        app.mount('#app');
    } catch (e) {
        console.error(e);
        throw e;
    }
};

init();
