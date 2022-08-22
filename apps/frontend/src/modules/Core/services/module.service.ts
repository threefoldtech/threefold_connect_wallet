import { Router } from 'vue-router';

import BridgeModule from '@/modules/Bridge';
import ContactModule from '@/modules/Contact';
import CurrencyModule from '@/modules/Currency';
import DevModule from '@/modules/Dev';
import FarmModule from '@/modules/Farm';
import LockedTokensModule from '@/modules/LockedTokens';
import MiscModule from '@/modules/Misc';
import TransferModule from '@/modules/Transfer';
import VestingModule from '@/modules/Vesting';
import WalletModule from '@/modules/Wallet';
import CoreModule from '@/modules/Core';
import { createVueRouter } from '@/router';

interface IModule {
    router?: (router: Router) => Promise<void>;
}

export const createRouterWithModules = async (): Promise<Router> => {
    const router = createVueRouter();

    await registerAllModules(router, [
        BridgeModule,
        ContactModule,
        CurrencyModule,
        DevModule,
        FarmModule,
        LockedTokensModule,
        MiscModule,
        TransferModule,
        VestingModule,
        WalletModule,
        CoreModule,
    ]);

    return router;
};

const registerModule = async (router: Router, module: IModule) => {
    if (!module.router) {
        return;
    }
    await module.router(router);
};

export const registerAllModules = async (router: Router, modules: IModule[]) => {
    const promises = modules.map(module => registerModule(router, module));
    return await Promise.all(promises);
};
