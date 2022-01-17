import types from '@/lib/substrateTypes';

import { ApiPromise, WsProvider } from '@polkadot/api';
import { ref } from 'vue';
import { AssetBalance, Balance, wallets } from '@/service/walletService';

//@todo: move to flagsmith
const endpoint = 'wss://tfchain.test.grid.tf';

const apiCache = ref<Promise<ApiPromise>>();

export const getSubstrateApi = async (): Promise<ApiPromise> => {
    if (apiCache.value) return apiCache.value;

    const provider = new WsProvider(endpoint);
    apiCache.value = ApiPromise.create({ provider, types });
    return apiCache.value;
};

export const getSubstrateAssetBalances = async (publicKey: string): Promise<AssetBalance[]> => {
    const api = await getSubstrateApi();

    const { data: balances } = await api.query.system.account(publicKey);
    const balance = balances.free.toJSON() / 1e7;

    const assetBalance: AssetBalance = {
        amount: Number(balance),
        name: 'TFT',
        type: 'substrate',
    };
    return [assetBalance];
};
