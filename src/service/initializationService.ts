import { initFlags } from './flagService';
import { Ref, ref } from 'vue';
import { decodeBase64 } from 'tweetnacl-util';
import { entropyToMnemonic } from 'bip39';
// @ts-ignore
import Pkid from '@jimber/pkid';
import flagsmith from 'flagsmith';
import sodium from 'libsodium-wrappers';
// @ts-ignore
import { calculateWalletEntropyFromAccount, keypairFromAccount, generateActivationCode } from '@jimber/stellar-crypto';
import { wallets } from '@/service/walletService';
import { getPkidClient } from '@/service/pkidService';
import { Keypair } from 'stellar-base';
import { appKeyPair, appSeed, appSeedPhrase, userInitialized } from '@/service/cryptoService';
import { getStellarClient } from '@/service/stellarService';

export type InitCallback = (value?: unknown) => void;
export const firstWalletInitCallback: Ref<InitCallback> = ref<InitCallback>() as Ref<InitCallback>;

type LoadingText = {
    title: string;
    subtitle?: string;
};
export const loadingText = ref<LoadingText>({ title: 'loading...' });

enum PkidWalletTypes {
    Native = 'NATIVE',
    Imported = 'IMPORTED',
}

interface PkidWallet {
    name: string;
    position?: number;
    secret: string;
    chain: 'stellar';
    type: PkidWalletTypes;
    index?: number;
}

interface PkidV2AppWallet {
    index: number;
    isConverted: boolean;
    position?: number;
    stellar: boolean;
    walletName: string;
}

interface PkidV2ImportedWallet {
    index: -1;
    isConverted: boolean;
    position?: number;
    seed: Buffer;
    stellar: boolean;
    walletName: string;
}

const firstInit = async () => {
    const entropy = calculateWalletEntropyFromAccount(appSeedPhrase.value, 0);
    const keyPair: Keypair = keypairFromAccount(entropy);

    const server = getStellarClient();
    const pkid = getPkidClient();

    //@todo: save to purse
    const initialWallet: PkidWallet = {
        chain: 'stellar',
        index: 0,
        name: 'Daily',
        position: 0,
        secret: keyPair.secret(),
        type: PkidWalletTypes.Native,
    };

    loadingText.value = { title: 'checking if an account already exists' };

    try {
        await server.loadAccount(keyPair.publicKey());
        await pkid.setDoc('purse', [initialWallet], true);
    } catch (e) {
        console.log('no acc found');
    }
    loadingText.value = { title: 'initializing first wallet creation' };

    try {
        await generateActivationCode(keyPair);
    } catch (e) {
        loadingText.value = { title: 'wallet creation failed' };

        throw e;
    }

    try {
        await server.loadAccount(keyPair.publicKey());
        await pkid.setDoc('purse', [initialWallet], true);
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
    (<any>window).feeDestination = flagsmith.getValue('fee-destination');
    (<any>window).feeAmount = flagsmith.getValue('fee-amount');
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
    initKeys(seedString);
    initStellarCryptoConfig();

    const pkid = getPkidClient();

    const purseDocToCheckMigration = await pkid.getDoc(appKeyPair.value.publicKey, 'purse');
    if (!purseDocToCheckMigration?.success) {
        loadingText.value = { title: 'starting update' };
        await migratePkid2_xTo3_x();
    }

    const purseDocToCheckFirstWalletInit = !purseDocToCheckMigration?.success
        ? await pkid.getDoc(appKeyPair.value.publicKey, 'purse')
        : purseDocToCheckMigration;

    if (!purseDocToCheckFirstWalletInit?.success) {
        await firstInit();
    }

    const purseDoc = !purseDocToCheckFirstWalletInit?.success
        ? await pkid.getDoc(appKeyPair.value.publicKey, 'purse')
        : purseDocToCheckFirstWalletInit;
    console.log(purseDoc);

    if (!purseDocToCheckFirstWalletInit?.success || purseDoc?.data?.length <= 0) {
        throw new Error('Critical Initialization error: no purseDoc');
    }

    const pkidPurseWallets: PkidWallet[] = purseDoc.data;

    wallets.value = pkidPurseWallets.map(wallet => {
        const keyPair = Keypair.fromSecret(wallet.secret);

        return {
            keyPair,
            name: wallet.name,
        };
    });

    userInitialized.value = name.slice(0, -5);
};

const mapV2toV3PkidWallet = (wallet: PkidV2ImportedWallet | PkidV2AppWallet): PkidWallet => {
    const isImported = wallet.index === -1;
    const seedPhrase = isImported ? entropyToMnemonic((wallet as PkidV2ImportedWallet).seed) : appSeedPhrase.value;

    const walletEntropy = calculateWalletEntropyFromAccount(seedPhrase, wallet.index);
    const walletKeypair: Keypair = keypairFromAccount(walletEntropy);
    const secret = walletKeypair.secret();

    return {
        chain: 'stellar',
        index: wallet.index,
        name: wallet.walletName,
        position: wallet.position,
        secret: secret,
        type: isImported ? PkidWalletTypes.Imported : PkidWalletTypes.Native,
    };
};

const migratePkid2_xTo3_x = async () => {
    const pkid = getPkidClient();

    const walletsToMigrate: PkidWallet[] = [];

    const pkidAppWalletsDoc = await pkid.getDoc(appKeyPair.value.publicKey, 'wallets');
    console.log(pkidAppWalletsDoc);

    if (pkidAppWalletsDoc?.success) {
        const pkid2_xAppWallets: PkidV2AppWallet[] = pkidAppWalletsDoc.data;
        console.log(pkid2_xAppWallets);
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
