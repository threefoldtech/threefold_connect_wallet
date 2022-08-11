import { IKeyringPair } from '@polkadot/types/types/interfaces';
import { getSubstrateApi, submitExtrinsic } from '../services/core.substrate';

export const createTwin = async (keyRing: IKeyringPair): Promise<void> => {
    const api = await getSubstrateApi();

    const submittableExtrinsic = api.tx.tfgridModule.createTwin('127.0.0.1');

    await submitExtrinsic(submittableExtrinsic, keyRing);
};

export const createFarm = async (keyRing: IKeyringPair, farmName: string): Promise<void> => {
    const api = await getSubstrateApi();

    const submittableExtrinsic = api.tx.tfgridModule.createFarm(farmName, []);

    await submitExtrinsic(submittableExtrinsic, keyRing);
};

export const addStellarPayoutAddress = async (keyRing: IKeyringPair, address: string, farmId: number) => {
    const api = await getSubstrateApi();

    const submittableExtrinsic = api.tx.tfgridModule.addStellarPayoutV2address(farmId, address);

    await submitExtrinsic(submittableExtrinsic, keyRing);
};
