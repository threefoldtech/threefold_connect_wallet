import flagsmith from 'flagsmith';
import sodium from 'libsodium-wrappers';

import { initializeFlagsmith } from './flagsmith.service';
import { ref } from 'vue';
import { decodeBase64 } from 'tweetnacl-util';
import { entropyToMnemonic } from '@jimber/simple-bip39';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { calculateWalletEntropyFromAccount, generateActivationCode, keypairFromAccount } from 'cryptolib';
import { mapToWallet, sendWalletDataToFlutter, wallets } from '@/modules/Wallet/services/wallet.service';
import { getPkidClient, saveWalletsToPkid } from '@/modules/Pkid/services/pkid.service';
import { Keypair as StellarKeyPair, Networks } from 'stellar-sdk';
import { appKeyPair, appSeed, appSeedPhrase, initializedUser } from '@/modules/Core/services/crypto.service';
import { bytesToHex } from '@/modules/Core/utils/crypto';
import { IWalletKeyPair, WalletKeyPairBuilder } from '@/modules/Core/models/keypair.model';
import { addNotification } from '@/modules/Core/services/notification.service';
import { migratePkid2_xTo3_x } from '@/modules/Core/services/migration.service';
import { initializeStellarConfig } from '@/modules/Core/services/config.service';
import { IPkidWallet } from 'shared-types/src/interfaces/global/pkid.interfaces';
import { NotificationType } from 'shared-types/src/enums/global/notification.enums';
import { PkidNamedKeys, PkidWalletTypes } from 'shared-types/src/enums/global/pkid.enums';
import { addNecessaryStellarTrustlines, getStellarClient, getStellarNet, useStellarFaucet } from 'tf-stellar';

type LoadingText = {
    title: string;
    subtitle?: string;
};
export const loadingText = ref<LoadingText>({ title: 'loading' });

const prepareWalletKeyPairBuilder = (): false | IWalletKeyPair => {
    const entropy = calculateWalletEntropyFromAccount(appSeedPhrase.value, 0);
    const keyPair: StellarKeyPair = keypairFromAccount(entropy);

    const walletKeyPairBuilder = new WalletKeyPairBuilder();
    walletKeyPairBuilder.addSeed(bytesToHex(keyPair.rawSecretKey()));

    return walletKeyPairBuilder.build();
};

export const initializeTestnetWalletWithFriendBot = async (kp: StellarKeyPair): Promise<boolean> => {
    try {
        const server = getStellarClient();

        await useStellarFaucet(kp.publicKey());
        await server.loadAccount(kp.publicKey());

        await addNecessaryStellarTrustlines(kp);

        return true;
    } catch (e) {
        return false;
    }
};

export const initializeMainnetWallet = async (kp: StellarKeyPair): Promise<boolean | undefined> => {
    const server = getStellarClient();

    try {
        const account = await server.loadAccount(kp.publicKey());
        if (account) {
            return true;
        }
    } catch (e) {
        console.error('No account found');
    }

    loadingText.value = { title: 'startFirstWallet' };

    return await generateActivationCode(kp);
};

export const initFirstWallet = async () => {
    const entropy = calculateWalletEntropyFromAccount(appSeedPhrase.value, 0);
    const kp: StellarKeyPair = keypairFromAccount(entropy);
    const server = getStellarClient();
    const network = getStellarNet();

    const walletKeyPair = prepareWalletKeyPairBuilder();

    const initialWallet: IPkidWallet = {
        index: 0,
        name: 'Daily',
        position: 0,
        isPublic: true,
        seed: bytesToHex(kp.rawSecretKey()),
        type: PkidWalletTypes.NATIVE,
    };

    if (!walletKeyPair) {
        throw new Error('Failed to build KeyPair');
    }

    loadingText.value = { title: 'checkExist' };

    try {
        const isActive = await server.loadAccount(kp.publicKey());
        addNotification(NotificationType.info, 'Account already exists');

        if (isActive) return;
    } catch (e) {}

    let success: boolean | undefined = false;

    if (network === Networks.TESTNET) {
        success = await initializeMainnetWallet(kp);
    }

    if (network === Networks.PUBLIC) {
        success = await initializeMainnetWallet(kp);
    }

    console.log('Success of making wallet:', success);

    if (!success) {
        loadingText.value = { title: 'walletCreationFailed' };
        throw Error('Failed to initialize wallet');
    }

    wallets.value.unshift({
        keyPair: walletKeyPair,
        name: initialWallet.name,
        meta: {
            index: initialWallet.index,
            type: initialWallet.type,
            isPublic: initialWallet.isPublic,
            position: initialWallet.position,
        },
    });

    await saveWalletsToPkid();
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

    const pkidPurseWallets: IPkidWallet[] = purseDoc.data;

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
