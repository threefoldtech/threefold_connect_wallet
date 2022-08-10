import {
    Balance,
    balances,
    getStellarBalance,
    handleAccountRecord,
    mergeAssets,
    Wallet,
} from '@/modules/Wallet/services/walletService';
import { NetworkError } from 'stellar-sdk/lib/errors';
import { ServerApi } from 'stellar-sdk';
import AccountRecord = ServerApi.AccountRecord;
import { getSubstrateAssetBalances } from '@/modules/TFChain/services/tfchainService';
import { getStellarClient } from '@/modules/Stellar/services/stellarService';

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
            // .join('transactions')
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
        const assetBalances = await getSubstrateAssetBalances(wallet.keyPair.getSubstrateKeyring().address);
        const balance: Balance = balances.value.find(value => value.id === wallet.keyPair.getBasePublicKey()) || {
            id: wallet.keyPair.getBasePublicKey(),
            assets: [],
        };

        balance.assets = mergeAssets(...assetBalances, ...balance.assets);
        const index = balances.value.findIndex(lb => lb.id === balance.id);

        index === -1 ? balances.value.push(balance) : balances.value.splice(index, 1, balance);
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
