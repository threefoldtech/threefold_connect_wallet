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

export interface TokenItem {
    amount: number;
    address: string;
    unlockHash: string | null;
    unlockFrom: string | undefined;
    canBeUnlocked: boolean;
    balance: HorizonBalance;
}

export const fetchAllLockedTokens = async (kp: StellarKeypair): Promise<TokenRecord[]> => {
    const allLockedBalances = await getLockedBalances(kp);

    // Remove all undefined balances
    return allLockedBalances.filter((token: TokenRecord) => token.balance !== undefined);
};

export const getAllTokensDetails = async (kp: StellarKeypair): Promise<TokenItem[]> => {
    const lockedTokens = await fetchAllLockedTokens(kp);

    if (lockedTokens.length === 0) {
        return [];
    }

    const allLockedTokens = await Promise.all(
        lockedTokens.map(async b => {
            return getLockedTokenRecordDetails(b);
        })
    );

    return allLockedTokens.filter(b => !!b);
};

const getLockedTokenRecordDetails = async (b: TokenRecord): Promise<TokenItem> => {
    const unlockTx = await fetchUnlockTransaction(b.unlockHash!);
    const isValidMoment = moment.unix(toNumber(unlockTx?.timeBounds?.minTime)).isBefore();

    return {
        amount: toNumber(b.balance?.balance),
        address: b.id,
        unlockHash: b.unlockHash,
        unlockFrom: unlockTx?.timeBounds?.minTime,
        canBeUnlocked: isValidMoment,
        balance: b.balance,
    };
};

export const unlockTokens = async (lockedBalances: TokenItem[], kp: StellarKeypair) => {
    if (!lockedBalances) return;
    for (let lockedBalance of lockedBalances) {
        if (lockedBalance.unlockHash) {
            const lBalance = await submitLockedTokenTxHash(lockedBalance);

            if (lBalance == null) return;

            lockedBalance = lBalance;
        }

        if (!lockedBalance.unlockHash) {
            const balance = lockedBalance.balance as Horizon.BalanceLineAsset<'credit_alphanum4'>;
            await transferLockedBalance(kp, lockedBalance.address, balance.asset_code, Number(balance.balance));
            return;
        }
    }
};

const submitLockedTokenTxHash = async (lockedBalance: TokenItem): Promise<TokenItem | null> => {
    if (!lockedBalance.unlockHash) return null;

    const unlockTx = await fetchUnlockTransaction(lockedBalance.unlockHash);
    if (!unlockTx) return null;

    if (!moment.unix(toNumber(lockedBalance.unlockFrom)).isBefore()) {
        console.log("Tokens can't be unlocked yet");
        return null;
    }
    const server = getStellarClient();
    await server.submitTransaction(unlockTx);

    lockedBalance.unlockHash = null;

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
