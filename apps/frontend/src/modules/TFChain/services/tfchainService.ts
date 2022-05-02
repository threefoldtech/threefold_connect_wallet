import types from '@/modules/TFChain/lib/substrateTypes';

import { ApiPromise, WsProvider } from '@polkadot/api';
import { ref } from 'vue';
import { AssetBalance } from '@/modules/Wallet/services/walletService';
import { IKeyringPair } from '@polkadot/types/types/interfaces';
import { bin2String } from '@/modules/Core/utils/crypto';
import flagsmith from 'flagsmith';
import axios from 'axios';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import type { ISubmittableResult } from '@polkadot/types/types';
import { SubstrateFarmDto } from '@/modules/Core/types/substrate.types';
import throttle from 'lodash/throttle';
import { KeyringPair } from '@polkadot/keyring/types';
import { isSubstrateBalanceAvailable } from '@/modules/Currency/services/currencyService';

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

// Method to check if a specific user by substrateId has their terms and conditions accepted
// Returns a boolean
export const hasAcceptedTermsAndConditions = async (id: string): Promise<boolean> => {
    const api = await getSubstrateApi();

    const listTermsAndConditions = (await api.query.tfgridModule.usersTermsAndConditions(id)).toJSON();

    return Object.keys(listTermsAndConditions as Object).length > 0;
};

// Method to check if a specific user by substrateId has their terms and conditions accepted
// Returns a boolean
export const checkIfTermsAndConditionsAreAccepted = async (id: string, retries = 0): Promise<boolean> => {
    const api = await getSubstrateApi();

    while (retries < 5) {
        const listTermsAndConditions = (await api.query.tfgridModule.usersTermsAndConditions(id)).toJSON();

        if (Object.keys(listTermsAndConditions as Object).length > 0) {
            return true;
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
        await checkIfTermsAndConditionsAreAccepted(id, (retries += 1));
    }

    return false;
};

// Sign terms and condition to blockchain
// Returns a boolean for success
export const signTermsAndConditions = async (keyRing: KeyringPair): Promise<boolean> => {
    const termsAndConditionsUrl = <string>flagsmith.getValue('farm_terms_and_conditions_url');
    const api = await getSubstrateApi();

    try {
        const submittableExtrinsic = api.tx.tfgridModule.userAcceptTc(termsAndConditionsUrl, 'NO_HASH');
        await submitExtrensic(submittableExtrinsic, keyRing);
        return true;
    } catch {
        console.error('Unable to sign terms and conditions');
        return false;
    }
};

// Accept terms and conditions for a specific user by substrateId
export const acceptTermsAndConditions = async (keyRing: KeyringPair) => {
    // Using activation service to make sure we have balance available
    await activationServiceForSubstrate(keyRing.address);

    // Check if balance is available => if no throw error
    const isBalanceAvailable = isSubstrateBalanceAvailable(keyRing.address);
    if (!isBalanceAvailable) throw new Error('Unable to load substrate balance');

    // Sign terms and conditions to blockchain
    const signed = await signTermsAndConditions(keyRing);
    if (!signed) throw new Error('Unable to sign terms and conditions');

    // Getting terms and conditions
    const accepted = await checkIfTermsAndConditionsAreAccepted(keyRing.address);
    if (!accepted) throw new Error("Can't fetch signed terms and conditions");
};

export const addTwin = async (keyRing: KeyringPair, retries = 0): Promise<number> => {
    const api = await getSubstrateApi();

    const submittableExtrinsic = api.tx.tfgridModule.createTwin('127.0.0.1');
    await submitExtrensic(submittableExtrinsic, keyRing);

    const twinId = await getTwinId(keyRing.address);
    if (twinId == 0) return 0;

    return twinId;
};

export const getTwinId = async (id: string, retries = 0): Promise<number> => {
    const api = await getSubstrateApi();

    while (retries < 5) {
        const twinId = (await api.query.tfgridModule.twinIdByAccountID(id)).toJSON();

        if (twinId != 0) {
            return twinId as number;
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
        await getTwinId(id, (retries += 1));
    }

    return 0;
};
