import { ChainTypes, IAssetBalance } from 'shared-types';
import { getSubstrateApi } from './core.service.substrate';
import axios from 'axios';
import { AssetsTypes } from 'shared-types/src/enums/global/asset.enums';

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

export const activateSubstrateAccount = async (accountId: string, url: string): Promise<boolean> => {
    const headers = { 'Content-Type': 'application/json' };

    const data = { substrateAccountID: accountId };

    try {
        await axios.post(url, data, { headers });
        return true;
    } catch (e) {
        return false;
    }
};
