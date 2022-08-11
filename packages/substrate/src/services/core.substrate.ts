import { ApiPromise, WsProvider } from '@polkadot/api';
import type { ISubmittableResult } from '@polkadot/types/types';
import { IKeyringPair } from '@polkadot/types/types/interfaces';
import { ExtrinsicStatus } from 'shared-types/src/enums/substrate.enums';
import { SubmittableExtrinsic } from '@polkadot/api/promise/types';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import SubstrateChainTypes from 'shared-types/src/types/substrate.chain.types';

let apiCache: Promise<ApiPromise>;

export const getSubstrateApi = async (): Promise<ApiPromise> => {
    await cryptoWaitReady();
    const endpoint = 'wss://tfchain.grid.tf';

    if (apiCache) {
        const api = await apiCache;
        await api.isReady;
        return api;
    }

    const provider = new WsProvider(endpoint);

    apiCache = ApiPromise.create({ provider, types: SubstrateChainTypes });

    const api = await apiCache;
    await api.isReady;
    return api;
};

export const submitExtrinsic = async (extrinsic: SubmittableExtrinsic, keyringPair: IKeyringPair, options = {}) => {
    await cryptoWaitReady();
    const p = new Promise((resolve, reject) => {
        extrinsic.signAndSend(keyringPair, options, (result: ISubmittableResult) => {
            if (result.isFinalized) {
                resolve(result.toHuman(true));
                return;
            }
            if (result.isError) {
                reject(result.toHuman(true));
                return;
            }

            if (result.status.type === ExtrinsicStatus.FINALIZED || result.status.type === ExtrinsicStatus.READY) {
                resolve(result.toHuman(true));
                return;
            }
        });
    });

    return await p;
};
