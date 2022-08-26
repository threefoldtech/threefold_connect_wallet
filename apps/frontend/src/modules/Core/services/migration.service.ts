import { Keypair } from 'stellar-sdk';
import { bytesToHex } from '@/modules/Core/utils/crypto';
import { getPkidClient } from '@/modules/Pkid/services/pkid.service';
import { appKeyPair, getSeedPhraseFromPkidWallet } from '@/modules/Core/services/crypto.service';
import { calculateWalletEntropyFromAccount, keypairFromAccount } from 'cryptolib';
import { PkidNamedKeys, PkidWalletTypes } from 'shared-types/src/enums/global/pkid.enums';
import {
    IPkidV2AppWallet,
    IPkidV2ImportedWallet,
    IPkidWallet,
} from 'shared-types/src/interfaces/global/pkid.interfaces';

const mapV2toV3PkidWallet = (wallet: IPkidV2ImportedWallet | IPkidV2AppWallet): IPkidWallet => {
    const isImported = 'seed' in wallet;
    const seedPhrase = getSeedPhraseFromPkidWallet(wallet);

    const walletEntropy = calculateWalletEntropyFromAccount(seedPhrase, wallet.index);
    const walletKeypair: Keypair = keypairFromAccount(walletEntropy);

    return {
        index: wallet.index,
        name: wallet.walletName,
        position: wallet.position,
        seed: bytesToHex(walletKeypair.rawSecretKey()),
        type: isImported ? PkidWalletTypes.IMPORTED : PkidWalletTypes.NATIVE,
    };
};

export const migratePkid2_xTo3_x = async () => {
    const pkid = getPkidClient();

    const walletsToMigrate: IPkidWallet[] = [];

    const pkidAppWalletsDoc = await pkid.getDoc(appKeyPair.value.publicKey, PkidNamedKeys.V2_WALLETS);

    if (pkidAppWalletsDoc?.success) {
        const pkid2_xAppWallets: IPkidV2AppWallet[] = pkidAppWalletsDoc.data;
        const pkid2_xAppWalletsToMigrate: IPkidWallet[] = pkid2_xAppWallets.map(mapV2toV3PkidWallet);

        walletsToMigrate.push(...pkid2_xAppWalletsToMigrate);
    }

    const pkidImportedWalletsDoc = await pkid.getDoc(appKeyPair.value.publicKey, PkidNamedKeys.V2_IMPORTED_ACCOUNTS);
    if (pkidImportedWalletsDoc?.success) {
        const pkid2_xImportedWallets: IPkidV2ImportedWallet[] = pkidImportedWalletsDoc.data;

        const pkid2_xImportedWalletsToMigrate = pkid2_xImportedWallets.map(mapV2toV3PkidWallet);

        walletsToMigrate.push(...pkid2_xImportedWalletsToMigrate);
    }

    if (walletsToMigrate.length <= 0) {
        return;
    }

    await pkid.setDoc(PkidNamedKeys.V3_PURSE, walletsToMigrate, true);
};
