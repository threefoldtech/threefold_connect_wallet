import {
    balances,
    getStellarBalance,
    handleAccountRecord,
    mergeAssets,
    Wallet,
} from '@/modules/Wallet/services/walletService';
import { NetworkError } from 'stellar-sdk/lib/errors';
import { ServerApi } from 'stellar-sdk';
import { getStellarClient } from '@/modules/Stellar/services/stellarService';
import AccountRecord = ServerApi.AccountRecord;
import { IBalance } from 'shared-types';
import { getSubstrateAssetBalances } from '../../packages/substrate/src/services/balance.service.substrate';

const useDynamicStellarBalance = (wallet: Wallet) => {
    const streams: (() => void)[] = [];

    const init = async () => {
        let result: AccountRecord;
        try {
            result = await getStellarBalance(wallet);
        } catch (error) {
            if ((<NetworkError>error)?.response?.status === 404) return;
            throw error;
        }
        handleAccountRecord(wallet, result);
        const server = getStellarClient();
        const closeHandler = server
            .accounts()
            .accountId(wallet.keyPair.getStellarKeyPair().publicKey())
            .stream({
                onmessage: res => handleAccountRecord(wallet, res),
            });
        streams.push(closeHandler);
    };

    init();

    return () => {
        streams.forEach(closeHandler => closeHandler());
    };
};

const useDynamicSubstrateBalance = (wallet: Wallet) => {
    const myInterval = setInterval(async () => {
        const substrateBalances = await getSubstrateAssetBalances(wallet.keyPair.getSubstrateKeyring().address);

        const baseBalance: IBalance = {
            id: wallet.keyPair.getBasePublicKey(),
            assets: [],
        };

        const foundBalances: IBalance =
            balances.value.find(b => b.id === wallet.keyPair.getBasePublicKey()) || baseBalance;

        foundBalances.assets = mergeAssets(...substrateBalances, ...foundBalances.assets);
        const index = balances.value.findIndex(lb => lb.id === foundBalances.id);

        index === -1 ? balances.value.push(foundBalances) : balances.value.splice(index, 1, foundBalances);
    }, 5000); //@todo: move to config

    return () => {
        clearInterval(myInterval);
    };
};

export const useDynamicBalance = (wallet: Wallet) => {
    const stellarCleanUp = useDynamicStellarBalance(wallet);
    const substrateCleanUp = useDynamicSubstrateBalance(wallet);

    return {
        cleanUp: () => {
            stellarCleanUp();
            substrateCleanUp();
        },
    };
};
