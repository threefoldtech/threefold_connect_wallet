import { Keypair as StellarKeypair } from 'stellar-base';
import { fetchUnlockTransaction, getLockedBalances, transferLockedTokens } from 'cryptolib';
import { Horizon, Keypair, Transaction } from 'stellar-sdk';
import moment from 'moment';
import { toNumber } from 'lodash';
import { getStellarClient } from '@/service/stellarService';

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

export const fetchLockedTokens = async (kp: StellarKeypair): Promise<TokenRecord[]> => {
    const allLockedBalances = await getLockedBalances(kp);

    // Filter all tokens with available balance
    return allLockedBalances.filter((token: TokenRecord) => token.balance !== undefined);
};

export const checkLockedTokens = async (kp: StellarKeypair) => {
    const availableLockedBalances: TokenRecord[] = await fetchLockedTokens(kp);

    return (
        await Promise.all(
            availableLockedBalances.map(async b => {
                return validateLockedBalance(b);
            })
        )
    ).filter(b => !!b);
};

const validateLockedBalance = async (b: TokenRecord) => {
    const unlockTx = await getUnlockTransactionByTxHash(b.unlockHash!);
    if (!unlockTx) return;

    const isValidMoment = moment.unix(toNumber(unlockTx?.timeBounds?.minTime)).isBefore();
    if (!isValidMoment) return;

    return b;
};

export const unlockTokens = async (kp: StellarKeypair) => {
    const availableLockedBalances: TokenRecord[] = await fetchLockedTokens(kp);

    for (let lockedBalance of availableLockedBalances) {
        if (lockedBalance.unlockHash) {
            const lBalance = await submitLockedTokenTxHash(lockedBalance);

            if (lBalance == null) return;

            lockedBalance = lBalance;
        }

        if (!lockedBalance.unlockHash) {
            const balance = lockedBalance.balance as Horizon.BalanceLineAsset<'credit_alphanum4'>;
            await transferLockedBalance(kp, lockedBalance.id, balance.asset_code, Number(balance.balance));
            return;
        }
    }
};

export const getUnlockTransactionByTxHash = async (txHash: string) => {
    try {
        return await fetchUnlockTransaction(txHash);
    } catch (e) {
        console.log(e);
    }
};

const submitLockedTokenTxHash = async (lockedBalance: TokenRecord): Promise<TokenRecord | null> => {
    if (!lockedBalance.unlockHash) return null;

    const unlockTx = await getUnlockTransactionByTxHash(lockedBalance.unlockHash);
    if (!unlockTx) return null;

    lockedBalance.unlockTransaction = unlockTx;
    if (!moment.unix(toNumber(lockedBalance.unlockTransaction.timeBounds?.minTime)).isBefore()) {
        console.log("Tokens can't be unlocked yet");
        return null;
    }
    const server = getStellarClient();
    await server.submitTransaction(lockedBalance.unlockTransaction);

    lockedBalance.unlockHash = null;
    lockedBalance.unlockTransaction = null;

    return lockedBalance;
};

const transferLockedBalance = async (kp: StellarKeypair, address: string, asset: string, balance: number) => {
    console.info('Unlocking tokens for address ' + address);

    try {
        await transferLockedTokens(kp, address, asset, balance);
    } catch (e) {
        console.error(e);
    }
};
