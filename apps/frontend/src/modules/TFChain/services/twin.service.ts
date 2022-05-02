import { KeyringPair } from '@polkadot/keyring/types';
import { getSubstrateApi, submitExtrensic } from '@/modules/TFChain/services/tfchainService';

export const addTwin = async (keyRing: KeyringPair): Promise<number> => {
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
