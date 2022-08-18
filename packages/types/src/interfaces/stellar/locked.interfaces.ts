import { Keypair, Transaction } from 'stellar-sdk';
import { HorizonBalance } from '../../types/stellar/horizon.types';

export interface ITokenRecord {
    keyPair: Keypair;
    id: string;
    balance: HorizonBalance;
    unlockHash: string | null;
    unlockTransaction?: Transaction | null;
}

export interface ITokenItem {
    amount: number;
    address: string;
    unlockHash: string | null;
    unlockFrom: string | undefined;
    canBeUnlocked: boolean;
    asset_code: string;
}
