import flagsmith from 'flagsmith';
import Pkid, { signEncode } from '@jimber/pkid';
import { appKeyPair, initializedUser } from '@/modules/Core/services/crypto.service';
import { PkidClient } from 'shared-types/src/types/global/pkid.types';
import { IPkidWallet } from 'shared-types/src/interfaces/global/pkid.interfaces';
import { IWallet } from 'shared-types/src/interfaces/global/wallet.interfaces';
import { PkidNamedKeys } from 'shared-types/src/enums/global/pkid.enums';
import { mapToWallet, wallets } from '@/modules/Wallet/services/wallet.service';
import { ChainTypes } from 'shared-types';
import { isDev } from '@/modules/Core/utils/environment';
import { decodeBase64 } from 'tweetnacl-util';
import { useLocalStorage } from '@vueuse/core';

let initializedPkidClient: PkidClient;
export const getPkidClient: () => PkidClient = () => {
    if (initializedPkidClient) return initializedPkidClient;

    const url = 'http://localhost:3001'; //flagsmith.getValue('pkid-url');
    initializedPkidClient = new Pkid(url, appKeyPair.value);
    return initializedPkidClient;
};

export const saveWalletsToPkid = async () => {
    const pkidWallets: IPkidWallet[] = wallets.value.map(
        (wallet: IWallet): IPkidWallet => ({
            type: wallet.meta.type,
            name: wallet.name,
            isPublic: wallet.meta.isPublic,
            index: wallet.meta.index,
            seed: wallet.keyPair.getSeed(),
        })
    );

    const pkid = getPkidClient();
    await pkid.setDoc(PkidNamedKeys.V3_PURSE, pkidWallets, true);
};

export const saveNamespaceWalletsToPkid = async () => {
    const publicWallets: {
        chains: { [ChainTypes.STELLAR]: string; [ChainTypes.SUBSTRATE]: string };
        name: string;
    }[] = [];

    wallets.value.forEach((wallet: IWallet) => {
        console.log(wallet);
        if (!wallet.meta.isPublic) {
            return;
        }
        publicWallets.push({
            name: wallet.name,
            chains: {
                [ChainTypes.STELLAR]: wallet.keyPair.getStellarKeyPair().publicKey(),
                [ChainTypes.SUBSTRATE]: wallet.keyPair.getSubstrateKeyring().address,
            },
        });
    });

    console.log(publicWallets);

    const pkid = getPkidClient();

    let signedData: string = await globalThis?.flutter_inappwebview?.callHandler(
        'SIGNING',
        JSON.stringify(publicWallets)
    );
    if (isDev) {
        const devMainPriv = useLocalStorage('mainPriv', '');
        signedData = signEncode(publicWallets, decodeBase64(devMainPriv.value));
    }

    await pkid.setNamespace(<string>initializedUser.value, signedData);
};

export const deleteWalletFromPkid = async (seed: string): Promise<boolean> => {
    const pKid = getPkidClient();

    const docs = await pKid.getDoc(appKeyPair.value.publicKey, PkidNamedKeys.V3_PURSE);

    const success = docs?.success;
    if (!success) {
        console.error('No success from PKID');
        return false;
    }

    const pkidData: IPkidWallet[] = docs?.data;
    if (!pkidData) {
        console.error('No success from PKID');
        return false;
    }

    const remainingWallets = pkidData.filter((wallet: IPkidWallet) => wallet.seed != seed);
    if (!remainingWallets) {
        console.error('Cant delete wallet - cannot find corresponding seed');
        return false;
    }

    if (pkidData.length === remainingWallets.length) {
        console.error('Edge case: array should be popped');
        return false;
    }

    const pkid = getPkidClient();
    const res = await pkid.setDoc(PkidNamedKeys.V3_PURSE, remainingWallets, true);

    if (res.status != 200) {
        console.error('Error when saving to PKID');
        return false;
    }

    try {
        wallets.value = mapToWallet(remainingWallets);
    } catch (e) {
        console.error('Error in mapping wallets');
        return false;
    }

    return true;
};
