import process from 'process';
import { Buffer } from 'buffer';

//see: https://github.com/polkadot-js/api/releases/tag/v7.0.1
import '@polkadot/api-augment';

import { createApp } from 'vue';
import App from './App.vue';
import './index.css';
import { overrideConsole } from '@/modules/Dev/utils/log';

import Vue3TouchEvents from 'vue3-touch-events';
import sodium from 'libsodium-wrappers';
import { i18n } from '@/modules/Core/utils/translate';
import { createRouterWithModules } from '@/modules/Core/services/module.service';
import { useAxiosInterceptor } from '@/modules/Core/services/interceptor.service';

window.Buffer = Buffer;
window.process = process;

const init = async () => {
    await sodium.ready;

    overrideConsole();
    useAxiosInterceptor();

    const router = await createRouterWithModules();
    const app = createApp(App).use(i18n).use(Vue3TouchEvents).use(router);

    app.mount('#app');
};

init();
