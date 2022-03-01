import process from 'process';
import { Buffer } from 'buffer';

window.Buffer = Buffer;
window.process = process;

import { createApp } from 'vue';
import App from './App.vue';
import './index.css';

import '@/components/global';
import { registerGlobalComponent } from './components/global';
import router from './router';
import { overrideConsole } from '@/util/log';
import axios from 'axios';

import Vue3TouchEvents from 'vue3-touch-events';
import sodium from 'libsodium-wrappers';

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
        app.use(Vue3TouchEvents);
        app.use(router);
        registerGlobalComponent(app);

        app.mount('#app');
    } catch (e) {
        console.error(e);
        throw e;
    }
};

init();
