import { ApiPromise, WsProvider } from '@polkadot/api';
import type { ISubmittableResult } from '@polkadot/types/types';
import { IKeyringPair } from '@polkadot/types/types/interfaces';
import { SubmittableExtrinsic } from '@polkadot/api/promise/types';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import SubstrateChainTypes from 'shared-types/src/types/substrate/substrate.chain.types';
import { ExtrinsicStatus } from 'shared-types/src/enums/substrate/substrate.enums';
import flagsmith from 'flagsmith';

let apiCache: Promise<ApiPromise>;

export const getSubstrateApi = async (): Promise<ApiPromise> => {
    await cryptoWaitReady();
    const endpoint = <string>flagsmith.getValue('tfchain_endpoint');

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

export const submitExtrinsic = async (
    extrinsic: SubmittableExtrinsic,
    keyringPair: IKeyringPair,
    callback: Function = () => {}
) => {
    const p = new Promise((resolve, reject) => {
        extrinsic.signAndSend(keyringPair, (result: ISubmittableResult) => {
            if (result.isFinalized) {
                console.log('Extrinsic finalized');

                const readableResult = result.toHuman() as any;
                if (!readableResult) return;

                const method = readableResult.events[0].event.method;
                console.log(method);

                resolve(result.toHuman(true));
                callback(method);
                return;
            }
            if (result.isError) {
                console.error('Extrinsic error');
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
