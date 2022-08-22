import flagsmith from 'flagsmith';
import Pkid from '@jimber/pkid';
import { appKeyPair } from '@/modules/Core/services/crypto.service';
import { PkidClient } from 'shared-types/src/types/global/pkid.types';
import { IPkidWallet } from 'shared-types/src/interfaces/global/pkid.interfaces';
import { IWallet } from 'shared-types/src/interfaces/global/wallet.interfaces';
import { PkidNamedKeys } from 'shared-types/src/enums/global/pkid.enums';
import { mapToWallet, wallets } from '@/modules/Wallet/services/wallet.service';

let initializedPkidClient: PkidClient;
export const getPkidClient: () => PkidClient = () => {
    if (initializedPkidClient) return initializedPkidClient;

    const url = flagsmith.getValue('pkid-url');
    initializedPkidClient = new Pkid(url, appKeyPair.value);
    return initializedPkidClient;
};

export const saveWalletsToPkid = async () => {
    const pkidWallets: IPkidWallet[] = wallets.value.map(
        (wallet: IWallet): IPkidWallet => ({
            type: wallet.meta.type,
            name: wallet.name,
            index: wallet.meta.index,
            seed: wallet.keyPair.getSeed(),
        })
    );

    const pkid = getPkidClient();
    await pkid.setDoc(PkidNamedKeys.V3_PURSE, pkidWallets, true);
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
