import types from '@/lib/substrateTypes';

import { ApiPromise, WsProvider } from '@polkadot/api';
import { ref } from 'vue';
import { AssetBalance } from '@/service/walletService';
import { IKeyringPair } from '@polkadot/types/types/interfaces';
import { bin2String } from '@/util/crypto';
import flagsmith from 'flagsmith';

const apiCache = ref<Promise<ApiPromise>>();

export const getSubstrateApi = async (): Promise<ApiPromise> => {
    if (apiCache.value) return apiCache.value;

    const endpoint = <string>flagsmith.getValue('tfchain_endpoint');
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

export const sendTokens = async (keyring: IKeyringPair, address: string) => {
    const api = await getSubstrateApi();

    const submittableExtrinsic = api.tx.balances.transfer(address, 1);
    const resHash = await submittableExtrinsic.signAndSend(keyring);

    console.log(resHash);

    return resHash;
};
export const hex2a = (hex: string) => {
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
        const v = parseInt(hex.substr(i, 2), 16);
        if (v) str += String.fromCharCode(v);
    }
    return str;
};
export const getTwinId = async (id: string) => {
    const api = await getSubstrateApi();

    const entity = await api.query.tfgridModule.twinIdByAccountID(id);

    const res = <any>entity.toJSON();
    return <number>res;
};

export const getUsersTermsAndConditions = async (
    id: string
): Promise<[{ document_link: string; account_id: string; document_hash: string; timestamp: number }]> => {
    const api = await getSubstrateApi();
    // @ts-ignore
    const arr: any[] = await api.query.tfgridModule.usersTermsAndConditions(id);
    return <any>arr.map((term: any) => {
        const newTerm = JSON.parse(JSON.stringify(term));
        //@ts-ignore
        newTerm.document_link = bin2String(term.document_link);
        //@ts-ignore
        newTerm.document_hash = bin2String(term.document_hash);
        return newTerm;
    });
};
export const allFarms = ref<any>([]);
export const allFarmNames = ref<string[]>([]);

export const fetchAllFarms = async () => {
    const api = await getSubstrateApi();
    allFarms.value = (await api.query.tfgridModule.farms.entries()).map(([, farm]) => farm.toHuman(true));
    allFarmNames.value = allFarms.value.map((farm: any) => farm.name);
};
