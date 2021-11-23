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

// declare const Buffer: BufferConstructor;

const init = async () => {
    const { Buffer } = await import('buffer');
    window.Buffer = Buffer;

    const app = createApp(App);
    app.use(router);
    registerGlobalComponent(app);

    app.mount('#app');
};

init();
