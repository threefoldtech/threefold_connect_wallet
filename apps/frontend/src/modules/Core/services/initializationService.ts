import { initFlags } from './flagService';
import { ref } from 'vue';
import { decodeBase64 } from 'tweetnacl-util';
// @ts-ignore
import { entropyToMnemonic } from '@jimber/simple-bip39';
// @ts-ignore
import Pkid from '@jimber/pkid';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import flagsmith from 'flagsmith';
import sodium from 'libsodium-wrappers';
import { calculateWalletEntropyFromAccount, generateActivationCode, keypairFromAccount } from 'cryptolib';
import { mapToWallet, saveWallets, sendWalletDataToFlutter, wallets } from '@/modules/Wallet/services/walletService';
import { getPkidClient, PkidWallet } from '@/modules/Core/services/pkidService';
import { Keypair } from 'stellar-sdk';
import { appKeyPair, appSeed, appSeedPhrase, userInitialized } from '@/modules/Core/services/cryptoService';
import { bytesToHex } from '@/modules/Core/utils/crypto';
import { WalletKeyPairBuilder } from '@/modules/Core/models/WalletKeyPair';
import { addNotification, NotificationType } from '@/modules/Core/services/notificationService';
import { getStellarClient } from '@/modules/Stellar/services/stellarService';

type LoadingText = {
    title: string;
    subtitle?: string;
};
export const loadingText = ref<LoadingText>({ title: 'loading' });

export enum PkidWalletTypes {
    Native = 'NATIVE',
    Imported = 'IMPORTED',
}

interface PkidV2AppWallet {
    index: number;
    isConverted: boolean;
    position?: number;
    stellar: boolean;
    walletName: string;
}

interface PkidV2ImportedWallet {
    index: number;
    isConverted: boolean;
    position?: number;
    seed: Buffer;
    stellar: boolean;
    walletName: string;
}

export const initFirstWallet = async () => {
    const entropy = calculateWalletEntropyFromAccount(appSeedPhrase.value, 0);
    const keyPair: Keypair = keypairFromAccount(entropy);

    const server = getStellarClient();
    const pkid = getPkidClient();

    const initialWallet: PkidWallet = {
        index: 0,
        name: 'Daily',
        position: 0,
        seed: bytesToHex(keyPair.rawSecretKey()),
        inNameSpace: false,
        type: PkidWalletTypes.Native,
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
                inNamespace: initialWallet?.inNameSpace,
                position: initialWallet.position,
            },
        });
        await saveWallets();
        return;
    } catch (e) {
        console.log('no acc found');
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
                inNamespace: initialWallet?.inNameSpace,
            },
        });
        await saveWallets();
    } catch (e) {
        throw e;
    }
};

const initKeys = (seedString: string) => {
    appSeed.value = new Uint8Array(decodeBase64(seedString));
    appSeedPhrase.value = entropyToMnemonic(appSeed.value as Buffer);
    appKeyPair.value = sodium.crypto_sign_seed_keypair(appSeed.value);
};
const initStellarCryptoConfig = () => {
    (<any>window).stellarServerUrl = flagsmith.getValue('stellar-url');
    (<any>window).stellarNetwork = flagsmith.getValue('stellar-network');
    (<any>window).serviceUrl = flagsmith.getValue('threefold-service-url');
    (<any>window).stellarBridgeAddress = flagsmith.getValue('stellar-bridge-address');
    (<any>window).supportedCurrencies = flagsmith.getValue('supported-currencies');
    (<any>window).bridgeFees = flagsmith.getValue('stellar-url');
    (<any>window).currencies = (<any[]>JSON.parse(<string>flagsmith.getValue('currencies'))).reduce(
        (previousValue, currentValue) => {
            if (currentValue.type !== 'stellar') return previousValue;
            previousValue[currentValue.asset_code] = {
                asset_code: currentValue.asset_code,
                issuer: currentValue.issuer,
            };
            return previousValue;
        },
        {}
    );
};

export const init = async (name: string, seedString: string) => {
    if (userInitialized.value) {
        console.error('should not be here twice');
        return;
    }
    await initFlags(name);

    // https://polkadot.js.org/docs/util-crypto/FAQ/#i-am-having-trouble-initializing-the-wasm-interface
    await cryptoWaitReady();

    initKeys(seedString);
    initStellarCryptoConfig();

    const pkid = getPkidClient();

    const alwaysMigratePkid = flagsmith.hasFeature('always-migrate-pkid');
    const purseDocToCheckMigration = await pkid.getDoc(appKeyPair.value.publicKey, 'purse');
    // checking not only if the purse is empty, but also if it is a valid purse see actions.vue
    if (alwaysMigratePkid || !purseDocToCheckMigration?.success || !purseDocToCheckMigration?.data) {
        loadingText.value = { title: 'startUpdating' };
        await migratePkid2_xTo3_x();
    }

    const purseDocToCheckFirstWalletInit =
        !purseDocToCheckMigration?.success || !purseDocToCheckMigration?.data
            ? await pkid.getDoc(appKeyPair.value.publicKey, 'purse')
            : purseDocToCheckMigration;

    if (!purseDocToCheckFirstWalletInit?.success) {
        console.info('first wallet init');
        loadingText.value = { title: 'noDataYet', subtitle: 'isThisFirstTime' };
        await pkid.setDoc('purse', [], true);
    }

    const purseDoc = !purseDocToCheckFirstWalletInit?.success
        ? await pkid.getDoc(appKeyPair.value.publicKey, 'purse')
        : purseDocToCheckFirstWalletInit;

    if (!purseDoc?.success) {
        addNotification(NotificationType.error, 'Critical Initialization error: please contact support');
        throw new Error('Critical Initialization error: no purseDoc');
    }

    const pkidPurseWallets: PkidWallet[] = purseDoc.data;

    console.table(pkidPurseWallets.map(wallet => ({ ...wallet, seed: '*********************' })));

    try {
        wallets.value = mapToWallet(pkidPurseWallets);
    } catch (e) {
        throw Error('Something went wrong mapping your wallets to the desired format. Please contact support');
    }

    userInitialized.value = name.slice(0, -5);

    setTimeout(() => {
        sendWalletDataToFlutter();
    }, 5000);
};

//@todo: make this prettier/more readable/better
const getSeedphraseFromPkidWallet = (wallet: PkidV2ImportedWallet | PkidV2AppWallet) => {
    const isImported = 'seed' in wallet;

    if (!isImported) {
        return appSeedPhrase.value;
    }

    // @ts-ignore
    let entropyInput = new Uint8Array((wallet as PkidV2ImportedWallet).seed?.data);
    if (entropyInput.length === 0) {
        entropyInput = (wallet as PkidV2ImportedWallet).seed;
    }
    if (entropyInput.length === 0) {
        throw new Error('no entropy input');
    }
    return isImported ? entropyToMnemonic(entropyInput) : appSeedPhrase.value;
};

const mapV2toV3PkidWallet = (wallet: PkidV2ImportedWallet | PkidV2AppWallet): PkidWallet => {
    const isImported = 'seed' in wallet;
    const seedPhrase = getSeedphraseFromPkidWallet(wallet);

    const walletEntropy = calculateWalletEntropyFromAccount(seedPhrase, wallet.index);
    const walletKeypair: Keypair = keypairFromAccount(walletEntropy);

    return {
        index: wallet.index,
        name: wallet.walletName,
        position: wallet.position,
        seed: bytesToHex(walletKeypair.rawSecretKey()),
        inNameSpace: false,
        type: isImported ? PkidWalletTypes.Imported : PkidWalletTypes.Native,
    };
};

const migratePkid2_xTo3_x = async () => {
    const pkid = getPkidClient();

    const walletsToMigrate: PkidWallet[] = [];

    const pkidAppWalletsDoc = await pkid.getDoc(appKeyPair.value.publicKey, 'wallets');

    if (pkidAppWalletsDoc?.success) {
        const pkid2_xAppWallets: PkidV2AppWallet[] = pkidAppWalletsDoc.data;
        const pkid2_xAppWalletsToMigrate: PkidWallet[] = pkid2_xAppWallets.map(mapV2toV3PkidWallet);

        walletsToMigrate.push(...pkid2_xAppWalletsToMigrate);
    }

    const pkidImportedWalletsDoc = await pkid.getDoc(appKeyPair.value.publicKey, 'imported_accounts');
    if (pkidImportedWalletsDoc?.success) {
        const pkid2_xImportedWallets: PkidV2ImportedWallet[] = pkidImportedWalletsDoc.data;

        const pkid2_xImportedWalletsToMigrate = pkid2_xImportedWallets.map(mapV2toV3PkidWallet);

        walletsToMigrate.push(...pkid2_xImportedWalletsToMigrate);
    }

    if (walletsToMigrate.length <= 0) {
        return;
    }

    await pkid.setDoc('purse', walletsToMigrate, true);
};
