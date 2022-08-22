import { Horizon, ServerApi } from 'stellar-sdk';
import { ChainTypes, IBalance } from 'shared-types';
import AccountRecord = ServerApi.AccountRecord;
import { IWallet } from 'shared-types/src/interfaces/global/wallet.interfaces';
import { getStellarClient } from './core.service.stellar';
import { balances, mergeAssets } from 'wallet-frontend/src/modules/Wallet/services/wallet.service';

export const getStellarBalanceInLocalStorage = (
    accountResult: AccountRecord,
    basePublicKey: string,
    stellarAddress: string,
    allowedAssets: string[]
): void => {
    const allBalances: Horizon.BalanceLine[] = accountResult.balances;

    const filteredBalances: Horizon.BalanceLine[] = allBalances.filter(
        (o: Horizon.BalanceLine) => allowedAssets.indexOf((<any>o)?.asset_code) != -1
    );

    const balance: IBalance = balances.value.find(value => value.id === basePublicKey) || {
        id: basePublicKey,
        assets: [],
    };

    const stellarAssets = filteredBalances.map((balance: Horizon.BalanceLine) => {
        return {
            name: (<any>balance)?.asset_code,
            amount: Number(balance.balance),
            type: ChainTypes.STELLAR,
            issuer: (<any>balance)?.asset_issuer,
        };
    });

    balance.assets = mergeAssets(...stellarAssets, ...balance.assets);
    const index = balances.value.findIndex(lb => lb.id === balance.id);

    index === -1 ? balances.value.push(balance) : balances.value.splice(index, 1, balance);
};

export const getStellarBalance = async (wallet: IWallet): Promise<AccountRecord> => {
    const server = getStellarClient();
    return await server.accounts().accountId(wallet.keyPair.getStellarKeyPair().publicKey()).call();
};
