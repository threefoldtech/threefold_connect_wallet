import types from '@/lib/substrateTypes';

import { ApiPromise, WsProvider } from '@polkadot/api';
import { ref } from 'vue';
import { AssetBalance } from '@/service/walletService';
import { IKeyringPair } from '@polkadot/types/types/interfaces';
import { bin2String } from '@/util/crypto';
import flagsmith from 'flagsmith';
import axios from 'axios';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import type { ISubmittableResult } from '@polkadot/types/types';
import { SubstrateFarmDto } from '@/types/substrate.types';
import throttle from 'lodash/throttle';

const apiCache = ref<Promise<ApiPromise>>();

const throttleSubstrateDisconnectedNotification = throttle(
    () => {
        // addNotification(NotificationType.error, translate('notification.substrateDisconnected'));
    },
    15000,
    { leading: true }
);

export const getSubstrateApi = async (): Promise<ApiPromise> => {
    if (apiCache.value) {
        const api = await apiCache.value;
        await api.isReady;
        return api;
    }

    const endpoint = <string>flagsmith.getValue('tfchain_endpoint');
    console.log('TRIGGERING');
    console.log(endpoint);
    const provider = new WsProvider(endpoint);
    provider.on('disconnected', () => {
        throttleSubstrateDisconnectedNotification();
    });
    apiCache.value = ApiPromise.create({ provider, types });
    const api = await apiCache.value;
    await api.isReady;

    return api;
};

export const getSubstrateAssetBalances = async (publicKey: string): Promise<AssetBalance[]> => {
    const api = await getSubstrateApi();

    const { data: balances }: any = await api.query.system.account(publicKey);
    const balance = balances.free.toJSON() / 1e7;

    const assetBalance: AssetBalance = {
        amount: Number(balance),
        name: 'TFT',
        type: 'substrate',
    };
    return [assetBalance];
};

export const sendSubstrateTokens = async (keyring: IKeyringPair, address: string, amount: number) => {
    const api = await getSubstrateApi();

    const submittableExtrinsic = api.tx.balances.transfer(address, amount * 1e7);
    return await submitExtrensic(submittableExtrinsic, keyring);
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
): Promise<{ document_link: string; account_id: string; document_hash: string; timestamp: number }[]> => {
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

export const allFarms = ref<SubstrateFarmDto[]>([]);
export const twinIds = ref<Set<number>>(new Set());

export const fetchAllFarms = async () => {
    // const api = await getSubstrateApi();
    // const farmEntries = await api.query.tfgridModule.farms.entries();

    const query = `query farmQuery($twinIds: [Int!]) {
  farms(where: {twinId_in: $twinIds}) {
    name
    twin_id: twinId
    public_ips: publicIPs {
      ip
    }
    pricing_policy_id: pricingPolicyId
    id: farmId
    certification_type: certificationType
    version
  }
}
`;
    const ids = [...twinIds.value.values()];
    const response = await axios.post(<string>flagsmith.getValue('tfchain_graphql_endpoint'), {
        query,
        variables: {
            twinIds: ids,
        },
    });

    const farms = response?.data?.data?.farms.map((farm: any) => {
        const newFarm = JSON.parse(JSON.stringify(farm));
        newFarm.public_ips = farm.public_ips.map((ip: any) => ip.ip);
        return newFarm;
    });
    // const farms = farmEntries.map(([, farm]) => {
    //     const newFarm = JSON.parse(JSON.stringify(farm));
    //     newFarm.name = bin2String((<any>farm)?.name);
    //     return <SubstrateFarmDto>newFarm;
    // });
    allFarms.value = farms;
};

export const activationServiceForSubstrate = async (id: string) => {
    const headers = { 'Content-Type': 'application/json' };

    const url = `${flagsmith.getValue('tfchain_activation_base_url')}/activation/activate`;
    const data = { substrateAccountID: id };

    await axios.post(url, data, { headers });

    while (true) {
        const balances = await getSubstrateAssetBalances(id);
        if (balances[0].amount > 0) {
            break;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
};

export const submitExtrensic = async (
    submittableExtrinsic: SubmittableExtrinsic<any>,
    keyringPair: IKeyringPair,
    options = {}
) => {
    const promise = new Promise((resolve, reject) => {
        submittableExtrinsic.signAndSend(keyringPair, options, (result: ISubmittableResult) => {
            if (result.isFinalized) {
                resolve(result.toHuman(true));
                return;
            }
            if (result.isError) {
                reject(result.toHuman(true));
                return;
            }

            // @ts-ignore
            if (result.status === 'Finalized' || result.status === 'Ready') {
                resolve(result.toHuman(true));
                return;
            }
        });
    });

    return await promise;
};

export const doesFarmExistByName = async (name: string): Promise<boolean> => {
    const api = await getSubstrateApi();
    const farm = await api.query.tfgridModule.farmIdByName(name);

    const readableFarm = farm.toJSON();
    return readableFarm != 0;
};
