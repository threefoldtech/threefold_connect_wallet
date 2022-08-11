import { ChainTypes, IAssetBalance } from 'shared-types';
import { AssetsTypes } from 'wallet-frontend/src/modules/Currency/enums/assets.enums';
import { getSubstrateApi } from './core.substrate';

export const getSubstrateAssetBalances = async (accountId: string): Promise<IAssetBalance[]> => {
    const api = await getSubstrateApi();

    const { data: balances }: any = await api.query.system.account(accountId);
    const balance = balances.free.toJSON() / 1e7;

    const substrateBalance: IAssetBalance = {
        amount: Number(balance),
        name: AssetsTypes.TFT,
        type: ChainTypes.SUBSTRATE,
    };

    return [substrateBalance];
};
