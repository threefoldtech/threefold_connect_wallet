import { Keypair, Keypair as StellarKeypair } from 'stellar-sdk';
import { bytesToHex, hexToBytes } from '@/util/crypto';
import { Keyring } from '@polkadot/api';
import { KeyringPair } from '@polkadot/keyring/types';
import { KeyPair as SodiumKeyPair } from 'libsodium-wrappers';
import { entropyToMnemonic } from '@jimber/simple-bip39';

// do not simplify => else libsodium.crypto_sign_seed_keypair will no longer work(probbaly some treeshaking issue)
import libsodium from 'libsodium-wrappers';

export class WalletKeyPair {
    private readonly basePublicKey: string;
    private readonly baseKeyPair: SodiumKeyPair;
    private readonly stellarKeyPair: StellarKeypair;
    private readonly substrateKeyring: KeyringPair;
    private readonly seed: string;

    constructor(seed: string) {
        this.seed = seed;
        const bytes = hexToBytes(seed);
        this.baseKeyPair = libsodium.crypto_sign_seed_keypair(bytes);
        this.basePublicKey = bytesToHex(this.baseKeyPair.publicKey);

        this.stellarKeyPair = Keypair.fromRawEd25519Seed(<Buffer>bytes);
        const keyring = new Keyring({ type: 'sr25519' }); // will be sr to be compatible with tooling (substrate)
        this.substrateKeyring = keyring.addFromSeed(bytes);
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

    static random(): WalletKeyPair {
        const seed = bytesToHex(libsodium.randombytes_buf(32));
        return new WalletKeyPair(seed);
    }
}
