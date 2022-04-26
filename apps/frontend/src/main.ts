//@ts-ignore
import process from 'process';
import { Buffer } from 'buffer';

import '@polkadot/api-augment'; //see: https://github.com/polkadot-js/api/releases/tag/v7.0.1

window.Buffer = Buffer;
window.process = process;

import { createApp } from 'vue';
import App from './App.vue';
import './index.css';

import { createVueRouter } from './router';
import { overrideConsole } from '@/modules/Dev/utils/log';
import axios from 'axios';

import Vue3TouchEvents from 'vue3-touch-events';
import sodium from 'libsodium-wrappers';
import { i18n } from '@/modules/Core/utils/translate';
import { getRoutes } from '@/router/routes';
import { isDev } from '@/modules/Core/utils/enviroment';
import { registerModules } from '@/router/registerRouters';

import BridgeModule from '@/modules/Bridge';
import ContactModule from '@/modules/Contact';
import CurrencyModule from '@/modules/Currency';
import DevModule from '@/modules/Dev';
import FarmModule from '@/modules/Farm';
import LockedTokensModule from '@/modules/LockedTokens';
import MiscModule from '@/modules/Misc';
import StellarModule from '@/modules/Stellar';
import TFChainModule from '@/modules/TFChain';
import TransferModule from '@/modules/Transfer';
import VestingModule from '@/modules/Vesting';
import WalletModule from '@/modules/Wallet';
import CoreModule from '@/modules/Core';

const init = async () => {
    await sodium.ready;

    // should be implemented
    // @ts-ignore
    globalThis.version = '';

    try {
        overrideConsole();
        // @ts-ignore
        console.info(`running version: ${globalThis.version}`);
        axios.interceptors.response.use(undefined, error => {
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
        const router = createVueRouter();
        await registerModules(router, [
            BridgeModule,
            ContactModule,
            CurrencyModule,
            DevModule,
            FarmModule,
            LockedTokensModule,
            MiscModule,
            StellarModule,
            TFChainModule,
            TransferModule,
            VestingModule,
            WalletModule,
            CoreModule,
        ]);
        app.use(router);

        app.mount('#app');
    } catch (e) {
        console.error(e);
        throw e;
    }
};

init();
