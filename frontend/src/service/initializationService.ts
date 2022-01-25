import { initFlags } from './flagService';
import { ref } from 'vue';
import { decodeBase64 } from 'tweetnacl-util';
// @ts-ignore
import { entropyToMnemonic } from '@jimber/simple-bip39';
// @ts-ignore
import Pkid from '@jimber/pkid';
import flagsmith from 'flagsmith';
import sodium from 'libsodium-wrappers';
import { calculateWalletEntropyFromAccount, generateActivationCode, keypairFromAccount } from '@jimber/stellar-crypto';
import { wallets } from '@/service/walletService';
import { getPkidClient, PkidWallet } from '@/service/pkidService';
import { Keypair } from 'stellar-sdk';
import { appKeyPair, appSeed, appSeedPhrase, userInitialized } from '@/service/cryptoService';
import { getStellarClient } from '@/service/stellarService';
import { bytesToHex, hexToBytes } from '@/util/crypto';
import { WalletKeyPair } from '@/lib/WalletKeyPair';

type LoadingText = {
    title: string;
    subtitle?: string;
};
export const loadingText = ref<LoadingText>({ title: 'loading...' });

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
        chain: 'stellar',
        index: 0,
        name: 'Daily',
        position: 0,
        seed: bytesToHex(keyPair.rawSecretKey()),
        type: PkidWalletTypes.Native,
    };

    loadingText.value = { title: 'checking if an account already exists' };

    try {
        await server.loadAccount(keyPair.publicKey());
        await pkid.setDoc('purse', [initialWallet], true);
        wallets.value = [
            {
                keyPair: new WalletKeyPair(bytesToHex(keyPair.rawSecretKey())),
                name: initialWallet.name,
                meta: {
                    index: initialWallet.index,
                    type: initialWallet.type,
                    position: initialWallet.position,
                    chain: initialWallet.chain,
                },
            },
        ];
        return;
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
    wallets.value = [
        {
            keyPair: new WalletKeyPair(bytesToHex(keyPair.rawSecretKey())),
            name: initialWallet.name,
            meta: {
                index: initialWallet.index,
                type: initialWallet.type,
                position: initialWallet.position,
                chain: initialWallet.chain,
            },
        },
    ];
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

    const alwaysMigratePkid = flagsmith.hasFeature('always-migrate-pkid');
    const purseDocToCheckMigration = await pkid.getDoc(appKeyPair.value.publicKey, 'purse');
    // checking not only if the purse is empty, but also if it is a valid purse see actions.vue
    if (alwaysMigratePkid || !purseDocToCheckMigration?.success || !purseDocToCheckMigration?.data) {
        loadingText.value = { title: 'starting update' };
        await migratePkid2_xTo3_x();
    }

    const purseDocToCheckFirstWalletInit =
        !purseDocToCheckMigration?.success || !purseDocToCheckMigration?.data
            ? await pkid.getDoc(appKeyPair.value.publicKey, 'purse')
            : purseDocToCheckMigration;

    if (!purseDocToCheckFirstWalletInit?.success) {
        console.info('first wallet init');
        loadingText.value = { title: 'no data yet', subtitle: 'is this your first time?' };
        await pkid.setDoc('purse', [], true);
    }

    const purseDoc = !purseDocToCheckFirstWalletInit?.success
        ? await pkid.getDoc(appKeyPair.value.publicKey, 'purse')
        : purseDocToCheckFirstWalletInit;

    if (!purseDoc?.success) {
        throw new Error('Critical Initialization error: no purseDoc');
    }

    const pkidPurseWallets: PkidWallet[] = purseDoc.data;

    console.table(pkidPurseWallets.map(wallet => ({ ...wallet, seed: '*********************' })));
    wallets.value = pkidPurseWallets.map(wallet => {
        const keyPair = Keypair.fromRawEd25519Seed(<Buffer>hexToBytes(wallet.seed));

        return {
            keyPair: new WalletKeyPair(wallet.seed),
            name: wallet.name,
            meta: {
                index: wallet.index,
                type: wallet.type,
                position: wallet.position,
                chain: wallet.chain,
            },
        };
    });

    userInitialized.value = name.slice(0, -5);
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
        chain: 'stellar',
        index: wallet.index,
        name: wallet.walletName,
        position: wallet.position,
        seed: bytesToHex(walletKeypair.rawSecretKey()),
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
