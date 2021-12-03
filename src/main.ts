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

const init = async () => {
    // @ts-ignore
    globalThis.version = import.meta.env.VITE_VERSION;

    try {
        overrideConsole();
        // @ts-ignore
        console.info(`running version: ${globalThis.version}`);
        axios.interceptors.response.use(
            value => {
                console.log(value);
            },
            error => {
                console.error(
                    error?.config
                        ? `${error.message}: ${error?.config?.method.toUpperCase()} ${error?.config?.url}`
                        : error
                );
            }
        );
        const { Buffer } = await import('buffer');
        window.Buffer = Buffer;

        const app = createApp(App);
        app.use(router);
        registerGlobalComponent(app);

        app.mount('#app');

        axios.get('https://api.github.com/_private/browser/stats').then(res => {
            console.log(res);
        });
        axios.get('https://618934abd0821900178d7870.mockapi.io/test').then(res => {
            console.log(res);
        });
    } catch (e) {
        console.error(e);
        throw e;
    }
};

init();
