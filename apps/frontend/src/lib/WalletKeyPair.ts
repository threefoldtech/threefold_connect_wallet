import { Keypair, Keypair as StellarKeypair } from 'stellar-sdk';
import { bytesToHex, hexToBytes } from '@/util/crypto';
import { Keyring } from '@polkadot/api';
import { KeyringPair } from '@polkadot/keyring/types'; // do not simplify => else libsodium.crypto_sign_seed_keypair will no longer work(probbaly some treeshaking issue)
import libsodium, { KeyPair as SodiumKeyPair } from 'libsodium-wrappers';
import { mnemonicToEntropy } from '@jimber/simple-bip39';

export interface IWalletKeyPair {
    basePublicKey: string;
    baseKeyPair: SodiumKeyPair;
    stellarKeyPair: StellarKeypair;
    substrateKeyring: KeyringPair;
    seed: string;

    getStellarKeyPair(): StellarKeypair;

    getSeed(): string;

    getSubstrateKeyring(): KeyringPair;

    getBasePublicKey(): string;
}

export class WalletKeyPairBuilder {
    private basePublicKey?: string;
    private baseKeyPair?: SodiumKeyPair;
    private stellarKeyPair?: StellarKeypair;
    private substrateKeyring?: KeyringPair;
    private seed?: string;

    public addSeed(seed: string) {
        this.seed = seed;
        const bytes = hexToBytes(seed);
        this.baseKeyPair = libsodium.crypto_sign_seed_keypair(bytes);
        this.basePublicKey = bytesToHex(this.baseKeyPair.publicKey);

        this.stellarKeyPair = Keypair.fromRawEd25519Seed(<Buffer>bytes);
        const keyring = new Keyring({ type: 'sr25519' }); // will be sr to be compatible with tooling (substrate)
        this.substrateKeyring = keyring.addFromSeed(bytes);

        return this;
    }

    public addRandomSeed() {
        const seed = bytesToHex(libsodium.randombytes_buf(32));
        this.addSeed(seed);
        return this;
    }

    public add12WordsSeed(words: string) {
        this.seed = words;
        const keyring = new Keyring({ type: 'sr25519' }); // will be sr to be compatible with tooling (substrate)
        this.substrateKeyring = keyring.addFromMnemonic(words);

        const entropy = mnemonicToEntropy(words);
        const paddedEntropy = entropy.padEnd(64, '0');

        console.log(paddedEntropy);
        const bytes = hexToBytes(paddedEntropy);
        this.baseKeyPair = libsodium.crypto_sign_seed_keypair(bytes);
        this.basePublicKey = bytesToHex(this.baseKeyPair.publicKey);

        this.stellarKeyPair = Keypair.fromRawEd25519Seed(<Buffer>bytes);

        return this;
    }

    public build(): IWalletKeyPair | false {
        if (!this.basePublicKey || !this.baseKeyPair || !this.stellarKeyPair || !this.substrateKeyring || !this.seed) {
            return false;
        }

        return new BaseWalletKeyPair(
            this.basePublicKey,
            this.baseKeyPair,
            this.stellarKeyPair,
            this.substrateKeyring,
            this.seed
        );
    }
}

class BaseWalletKeyPair implements IWalletKeyPair {
    readonly basePublicKey: string;
    readonly baseKeyPair: SodiumKeyPair;
    readonly stellarKeyPair: StellarKeypair;
    readonly substrateKeyring: KeyringPair;
    readonly seed: string;

    constructor(
        basePublicKey: string,
        baseKeyPair: SodiumKeyPair,
        stellarKeyPair: StellarKeypair,
        substrateKeyring: KeyringPair,
        seed: string
    ) {
        this.basePublicKey = basePublicKey;
        this.baseKeyPair = baseKeyPair;
        this.stellarKeyPair = stellarKeyPair;
        this.substrateKeyring = substrateKeyring;
        this.seed = seed;
    }

    getStellarKeyPair(): StellarKeypair {
        return this.stellarKeyPair;
    }

    getSeed(): string {
        return this.seed;
    }

    getSubstrateKeyring(): KeyringPair {
        return this.substrateKeyring;
    }

    getBasePublicKey(): string {
        return this.basePublicKey;
    }
}
