import flagsmith from 'flagsmith';
import sodium from 'libsodium-wrappers';

import { initializeFlagsmith } from './flagsmith.service';
import { ref } from 'vue';
import { decodeBase64 } from 'tweetnacl-util';
import { entropyToMnemonic } from '@jimber/simple-bip39';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { calculateWalletEntropyFromAccount, generateActivationCode, keypairFromAccount } from 'cryptolib';
import { mapToWallet, saveWallets, sendWalletDataToFlutter, wallets } from '@/modules/Wallet/services/walletService';
import { getPkidClient } from '@/modules/Pkid/services/pkid.service';
import { Keypair } from 'stellar-sdk';
import { appKeyPair, appSeed, appSeedPhrase, initializedUser } from '@/modules/Core/services/crypto.service';
import { bytesToHex } from '@/modules/Core/utils/crypto';
import { WalletKeyPairBuilder } from '@/modules/Core/models/keypair.model';
import { addNotification } from '@/modules/Core/services/notification.service';
import { getStellarClient } from '@/modules/Stellar/services/stellarService';
import { PkidNamedKeys, PkidWalletTypes } from '@/modules/Pkid/enums/pkid.enums';
import { PkidWallet } from '@/modules/Pkid/interfaces/pkid.interfaces';
import { migratePkid2_xTo3_x } from '@/modules/Core/services/migration.service';
import { initializeStellarConfig } from '@/modules/Core/services/config.service';
import { NotificationType } from '@/modules/Core/enums/notification.enum';

type LoadingText = {
    title: string;
    subtitle?: string;
};
export const loadingText = ref<LoadingText>({ title: 'loading' });

export const initFirstWallet = async () => {
    const entropy = calculateWalletEntropyFromAccount(appSeedPhrase.value, 0);
    const keyPair: Keypair = keypairFromAccount(entropy);

    const server = getStellarClient();

    const initialWallet: PkidWallet = {
        index: 0,
        name: 'Daily',
        position: 0,
        seed: bytesToHex(keyPair.rawSecretKey()),
        type: PkidWalletTypes.NATIVE,
    };

    const walletKeyPairBuilder = new WalletKeyPairBuilder();
    walletKeyPairBuilder.addSeed(bytesToHex(keyPair.rawSecretKey()));

    const walletKeyPair = walletKeyPairBuilder.build();

    if (!walletKeyPair) {
        throw new Error('Failed to create wallet key pair');
    }

    loadingText.value = { title: 'checkExist' };

    try {
        await server.loadAccount(keyPair.publicKey());
        wallets.value.unshift({
            keyPair: walletKeyPair,
            name: initialWallet.name,
            meta: {
                index: initialWallet.index,
                type: initialWallet.type,
                position: initialWallet.position,
            },
        });

        await saveWallets();
        return;
    } catch (e) {
        console.error('No account found');
    }

    loadingText.value = { title: 'startFirstWallet' };

    try {
        await generateActivationCode(keyPair);
    } catch (e) {
        loadingText.value = { title: 'walletCreationFailed' };

        throw e;
    }

    try {
        await server.loadAccount(keyPair.publicKey());
        wallets.value.unshift({
            keyPair: walletKeyPair,
            name: initialWallet.name,
            meta: {
                index: initialWallet.index,
                type: initialWallet.type,
                position: initialWallet.position,
            },
        });
        await saveWallets();
    } catch (e) {
        throw e;
    }
};

const initializeKeys = (seedString: string) => {
    appSeed.value = new Uint8Array(decodeBase64(seedString));
    appSeedPhrase.value = entropyToMnemonic(appSeed.value as Buffer);
    appKeyPair.value = sodium.crypto_sign_seed_keypair(appSeed.value);
};

export const init = async (name: string, derivedSeed: string) => {
    if (initializedUser.value) {
        console.error('Should not be here - initialized twice');
        return;
    }

    await initializeFlagsmith(name);

    // https://polkadot.js.org/docs/util-crypto/FAQ/#i-am-having-trouble-initializing-the-wasm-interface
    await cryptoWaitReady();

    initializeKeys(derivedSeed);
    initializeStellarConfig();

    const pkid = getPkidClient();

    const alwaysMigratePkid = flagsmith.hasFeature('always-migrate-pkid');
    const purseDocToCheckMigration = await pkid.getDoc(appKeyPair.value.publicKey, PkidNamedKeys.V3_PURSE);

    // Checking if the user is already migrated (See Actions.vue to clear the purse to reinforce migration)
    if (alwaysMigratePkid || !purseDocToCheckMigration?.success || !purseDocToCheckMigration?.data) {
        loadingText.value = { title: 'startUpdating' };
        await migratePkid2_xTo3_x();
    }

    const purseDocToCheckFirstWalletInit =
        !purseDocToCheckMigration?.success || !purseDocToCheckMigration?.data
            ? await pkid.getDoc(appKeyPair.value.publicKey, PkidNamedKeys.V3_PURSE)
            : purseDocToCheckMigration;

    if (!purseDocToCheckFirstWalletInit?.success) {
        console.info('Migration V2 to V3');
        loadingText.value = { title: 'noDataYet', subtitle: 'isThisFirstTime' };

        await pkid.setDoc(PkidNamedKeys.V3_PURSE, [], true);
    }

    const purseDoc = !purseDocToCheckFirstWalletInit?.success
        ? await pkid.getDoc(appKeyPair.value.publicKey, PkidNamedKeys.V3_PURSE)
        : purseDocToCheckFirstWalletInit;

    if (!purseDoc?.success) {
        addNotification(NotificationType.error, 'Critical Initialization error: please contact support');
        throw new Error('Critical Initialization error: no purse data found');
    }

    const pkidPurseWallets: PkidWallet[] = purseDoc.data;

    console.info('All available wallets on PKID: ');
    console.table(pkidPurseWallets.map(wallet => ({ ...wallet, seed: '*********************' })));

    try {
        wallets.value = mapToWallet(pkidPurseWallets);
    } catch (e) {
        throw Error('Something went wrong mapping your wallets to the desired format. Please contact support');
    }

    initializedUser.value = name.slice(0, -5);

    setTimeout(() => {
        sendWalletDataToFlutter();
    }, 5000);
};
