import { Keypair as StellarKeypair } from 'stellar-base';
import { fetchUnlockTransaction, getLockedBalances, transferLockedTokens } from 'cryptolib';
import { Horizon, Transaction } from 'stellar-sdk';
import { toNumber } from 'lodash';
import { addNotification } from '@/modules/Core/services/notification.service';
import { isBefore } from '@/modules/Core/utils/time';
import { translate } from '@/modules/Core/utils/translate';
import { ITokenItem, ITokenRecord } from 'shared-types/src/interfaces/stellar/locked.interfaces';
import { NotificationType } from 'shared-types/src/enums/global/notification.enums';
import { getStellarClient } from 'tf-stellar';
export const fetchAllLockedTokens = async (kp: StellarKeypair): Promise<ITokenRecord[]> => {
    const allLockedBalances = await getLockedBalances(kp);

    // Remove all undefined balances
    return allLockedBalances.filter((token: ITokenRecord) => token.balance !== undefined);
};

export const getAllTokensDetails = async (kp: StellarKeypair): Promise<ITokenItem[]> => {
    const lockedTokens = await fetchAllLockedTokens(kp);

    if (lockedTokens.length === 0) {
        return [];
    }

    const allLockedTokens = await Promise.all(
        lockedTokens.map(async b => {
            return getLockedTokenRecordDetails(b);
        })
    );

    return allLockedTokens.filter(b => b != undefined || b != null) as ITokenItem[];
};

const getLockedTokenRecordDetails = async (b: ITokenRecord): Promise<ITokenItem | undefined> => {
    let unlockTx: Transaction | null = null;
    try {
        if (!b.unlockHash) {
            await transferLockedBalance(b.keyPair, b.id, 'TFT', toNumber(b.balance?.balance));
            return;
        }

        unlockTx = await fetchUnlockTransaction(b.unlockHash!);
    } catch (e) {
        addNotification(NotificationType.error, translate('locking.errors.unableToFetch'));
        console.error('Cant fetch unlock transaction');
        return;
    }

    const isValidMoment = isBefore(toNumber(unlockTx?.timeBounds?.minTime));
    const balance = b.balance as Horizon.BalanceLineAsset<'credit_alphanum4'>;

    return {
        amount: toNumber(balance.balance),
        address: b.id,
        unlockHash: b.unlockHash,
        unlockFrom: unlockTx?.timeBounds?.minTime,
        canBeUnlocked: isValidMoment,
        asset_code: balance.asset_code,
    };
};

//
// Unlocking tokens functions
//

export const unlockTokens = async (lockedBalances: ITokenItem[], kp: StellarKeypair) => {
    if (!lockedBalances) return;

    for (let lockedBalance of lockedBalances) {
        if (lockedBalance.unlockHash) {
            try {
                const lBalance = await submitLockedTokenTxHash(lockedBalance);

                if (lBalance == null) continue;

                lockedBalance = lBalance;
            } catch (e) {
                continue;
            }
        }

        if (!lockedBalance.unlockHash) {
            try {
                await transferLockedBalance(
                    kp,
                    lockedBalance.address,
                    lockedBalance.asset_code,
                    Number(lockedBalance.amount)
                );
            } catch (e) {
                continue;
            }
        }
    }
};

const submitLockedTokenTxHash = async (lockedBalance: ITokenItem): Promise<ITokenItem | null> => {
    if (!lockedBalance.unlockHash) return null;

    const unlockTx = await fetchUnlockTransaction(lockedBalance.unlockHash);
    if (!unlockTx) return null;

    if (!isBefore(toNumber(lockedBalance.unlockFrom))) {
        addNotification(NotificationType.error, translate('locking.errors.cantBeUnlockedYet'));
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

        addNotification(NotificationType.success, translate('locking.successfullyUnlocked'));
    } catch (e) {
        addNotification(NotificationType.error, translate('locking.errors.failedToUnlock'));
        console.error(e);
    }
};
