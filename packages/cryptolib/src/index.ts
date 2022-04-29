import { calculateWalletEntropyFromAccount, keypairFromAccount, revineAddressFromSeed } from './service/cryptoService';
import { Keypair } from 'stellar-sdk';
import { migrateAccount } from './service/stellarService';

export const convertTfAccount: (
    seedPhrase: string,
    walletAmount?: number,
    startIndex?: number
) => Promise<void> = async (seedPhrase: string, walletAmount: number = 1, startIndex: number = 1) => {
    for (let i = 0; i < walletAmount; i++) {
        const walletEntropy = calculateWalletEntropyFromAccount(seedPhrase, startIndex + i);
        const stellarPair = keypairFromAccount(walletEntropy);

        const revinePair = revineAddressFromSeed(seedPhrase, startIndex + i);
        await migrateAccount(stellarPair, revinePair);
    }
};

export * from './service/cryptoService';
export * from './service/lockService';
export * from './service/rivineService';
export * from './service/stellarService';
export * from './service/fundService';
export * from './service/vestingService';
export * from './service/bscService';
export * from './service/trustlineService';
export * from './service/priceService';
export * from './service/tradeService';
