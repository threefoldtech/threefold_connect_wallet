import { Keypair, Keypair as StellarKeypair } from 'stellar-sdk';
import { hexToBytes } from '@/util/crypto';

export class WalletKeyPair {
    private readonly stellarKeyPair: StellarKeypair;
    private readonly seed: string;

    constructor(seed: string) {
        this.seed = seed;
        this.stellarKeyPair = Keypair.fromRawEd25519Seed(<Buffer>hexToBytes(seed));
    }

    getStellarKeyPair(): StellarKeypair {
        return this.stellarKeyPair;
    }

    getSeed(): string {
        return this.seed;
    }
}
