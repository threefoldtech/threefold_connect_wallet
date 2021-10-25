import { createApp } from 'vue';
import App from './App.vue';
import './index.css';

import '@/components/global';
import { registerGlobalComponent } from './components/global';
import router from './router';

const app = createApp(App);
app.use(router);
registerGlobalComponent(app);

app.mount('#app');
