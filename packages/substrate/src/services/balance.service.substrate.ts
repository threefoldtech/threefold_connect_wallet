import { ChainTypes, IAssetBalance, IBalance } from 'shared-types';
import { getSubstrateApi } from './core.service.substrate';
import axios from 'axios';
import { balances, mergeAssets } from 'wallet-frontend/src/modules/Wallet/services/wallet.service';
import { AssetsTypes } from 'shared-types/src/enums/global/asset.enums';

export const getSubstrateBalancesInLocalStorage = async (substrateAddress: string, basePublicKey: string) => {
    const substrateBalances = await getSubstrateAssetBalances(substrateAddress);

    const baseBalance: IBalance = {
        id: basePublicKey,
        assets: [],
    };

    const foundBalances: IBalance = balances.value.find(b => b.id === basePublicKey) || baseBalance;

    foundBalances.assets = mergeAssets(...substrateBalances, ...foundBalances.assets);
    const index = balances.value.findIndex(lb => lb.id === foundBalances.id);

    index === -1 ? balances.value.push(foundBalances) : balances.value.splice(index, 1, foundBalances);
};

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
