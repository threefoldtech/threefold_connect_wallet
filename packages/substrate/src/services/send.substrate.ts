import { IKeyringPair } from '@polkadot/types/types/interfaces';
import { getSubstrateApi, submitExtrinsic } from './core.substrate';

export const sendSubstrateTokens = async (from: IKeyringPair, address: string, amount: number) => {
    const api = await getSubstrateApi();

    const submittableExtrinsic = api.tx.balances.transfer(address, amount * 1e7);
    return await submitExtrinsic(submittableExtrinsic, from);
};
