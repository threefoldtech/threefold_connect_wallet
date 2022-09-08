import { NetworkError, ServerApi } from 'stellar-sdk';
import { getSubstrateBalancesInLocalStorage } from 'tf-substrate';
import { IWallet } from 'shared-types/src/interfaces/global/wallet.interfaces';
import { getStellarBalance, getStellarBalanceInLocalStorage, getStellarClient } from 'tf-stellar';
import flagsmith from 'flagsmith';
import AccountRecord = ServerApi.AccountRecord;

const useDynamicStellarBalance = (wallet: IWallet) => {
    const streams: (() => void)[] = [];

    const stellarAddress = wallet.keyPair.getStellarKeyPair().publicKey();
    const basePublicKey = wallet.keyPair.getBasePublicKey();
    const allowedCurrencies = <string>flagsmith.getValue('supported-currencies');
    const allowedAssets = JSON.parse(allowedCurrencies).map(a => a.asset_code);

    const streamStellarBalance = async () => {
        let balanceResult: AccountRecord;

        try {
            balanceResult = await getStellarBalance(wallet);
        } catch (error) {
            if ((<NetworkError>error)?.response?.status === 404) return;
            throw Error();
        }

        getStellarBalanceInLocalStorage(balanceResult, basePublicKey, stellarAddress, allowedAssets);

        const server = getStellarClient();
        const closeHandler = server
            .accounts()
            .accountId(wallet.keyPair.getStellarKeyPair().publicKey())
            .stream({
                onmessage: balanceResult =>
                    getStellarBalanceInLocalStorage(balanceResult, basePublicKey, stellarAddress, allowedAssets),
            });

        streams.push(closeHandler);
    };

    streamStellarBalance();

    return () => {
        streams.forEach(closeHandler => closeHandler());
    };
};

const useDynamicSubstrateBalance = (wallet: IWallet) => {
    const basePublicKey = wallet.keyPair.getBasePublicKey();
    const substrateAddress = wallet.keyPair.getSubstrateKeyring().address;

    const myInterval = setInterval(async () => {
        await getSubstrateBalancesInLocalStorage(substrateAddress, basePublicKey);
    }, 5000);

    return () => {
        clearInterval(myInterval);
    };
};

export const balanceUtil = (wallet: IWallet) => {
    const stellarCleanUp = useDynamicStellarBalance(wallet);
    const substrateCleanUp = useDynamicSubstrateBalance(wallet);

    return {
        cleanUp: () => {
            stellarCleanUp();
            substrateCleanUp();
        },
    };
};
