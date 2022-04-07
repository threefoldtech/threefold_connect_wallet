import { Keypair as StellarKeypair } from 'stellar-base';
import { fetchUnlockTransaction, getLockedBalances, transferLockedTokens } from 'cryptolib';
import { Horizon, Keypair, Transaction } from 'stellar-sdk';
import moment from 'moment';
import { toNumber } from 'lodash';
import { getStellarClient } from '@/service/stellarService';

type LockedBalanceType = Horizon.BalanceLineAsset<'credit_alphanum4'>;

type HorizonBalance =
    | Horizon.BalanceLineNative
    | Horizon.BalanceLineAsset<'credit_alphanum4'>
    | Horizon.BalanceLineAsset<'credit_alphanum12'>
    | Horizon.BalanceLineLiquidityPool
    | undefined;

export interface TokenRecord {
    keyPair: Keypair;
    id: string;
    balance: HorizonBalance;
    unlockHash: string | null;
    unlockTransaction?: Transaction | null;
}

export const fetchLockedTokens = async (kp: StellarKeypair) => {
    const lockedTokens = await getLockedBalances(kp);
    const tokens: TokenRecord[] = lockedTokens.filter((token: TokenRecord) => token.balance !== undefined);
    const server = getStellarClient();

    const t: TokenRecord = tokens[1];
    console.log(t);

    if (!t.unlockHash) {
        const b = t.balance as LockedBalanceType;
        try {
            await transferLockedTokens(t.keyPair, t.id, b.asset_code, Number(b.balance));
            console.log('done');
        } catch (e) {
            console.log(e);
        }
        return;
    }

    // for (const t of tokens) {
    //     if (!t.unlockHash) return;
    //
    const unlockTx = await getUnlockTransactionByTxHash(t.unlockHash!);
    //
    //     console.log(unlockTx.timeBounds?.minTime);
    //     if (!unlockTx) return;

    t.unlockTransaction = unlockTx;
    //
    // if (!unlockTx.timeBounds?.minTime) return;
    //
    const isValidTime = moment.unix(toNumber(unlockTx.timeBounds?.minTime)).isBefore();
    if (!isValidTime) {
        console.log('Not a valid time');
        return;
    }
    //

    await server.submitTransaction(t.unlockTransaction);
    console.log('yo');
};

export const getUnlockTransactionByTxHash = async (txHash: string) => {
    return await fetchUnlockTransaction(txHash);
};
