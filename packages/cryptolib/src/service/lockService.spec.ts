import {
    calculateWalletEntropyFromAccount,
    keypairFromAccount,
    revineAddressFromSeed,
} from './cryptoService';
import {
    fetchUnlockTransaction,
    getLockedBalances,
    transferLockedTokens,
} from './lockService';
import { getConfig } from './stellarService';

const seedPhrase: string =
    'enlist extend long diet crucial broccoli inhale tuna stuff sting miracle runway announce surprise dog limb second sun april reason they produce sick spray';

const walletEntropy = calculateWalletEntropyFromAccount(seedPhrase, 0);
const keypair = keypairFromAccount(walletEntropy);
console.log(keypair.publicKey());

describe.skip('lockservice', () => {
    it('should have locked tokens', async () => {
        const lockedFunds = await getLockedBalances(keypair);

        expect(lockedFunds).toStrictEqual([
            {
                id: 'GDGV7Q3WHYN3X5VHRJ7ICU7LIM5VO3SHS6565QYNDBV77NDGH2RLOQJZ',
                balance: '1.0000000',
                unlockHash:
                    'TDMJUZJ2HUTXFJ4PFTQZXPXGPAGGXNXLH2642A2OROVJ4HI2RQYYTLEB',
            },
        ]);
    });
    it('should fetch unlockTransactionEnvelope', async () => {
        const [lockedFunds, ...rest] = await getLockedBalances(keypair);
        const unlockTransactionEnvelope = await fetchUnlockTransaction(
            lockedFunds.unlockHash
        );
        expect(unlockTransactionEnvelope.source).toEqual(lockedFunds.id);
    });
    it.skip('should unlock escrow account', async () => {
        const [lockedFunds, ...rest] = await getLockedBalances(keypair);
        const unlockTransaction = await fetchUnlockTransaction(
            lockedFunds.unlockHash
        );

        const { server } = getConfig();

        try {
            const result = await server.submitTransaction(unlockTransaction);
            console.log('Success! Results:', result);
        } catch (error) {
            console.error('Something went wrong!', error.response.data);
            // If the result is unknown (no response body, timeout etc.) we simply resubmit
            // already built transaction:
            // await server.submitTransaction(fundedTransaction);
        }
    }, 300000);
    it.skip('should transfer tokens from escrow account', async () => {
        const balances = await getLockedBalances(keypair);
        const lockedFunds = balances[0];
        console.log(lockedFunds);
        // expect(lockedFunds.id).toEqual('GAQAI5BBINBXHTSODKNLJ6DWC7I75X25OKMAMOH3NV47VDMCCECOJL72');
        expect(lockedFunds.unlockHash).toEqual(null);
        await transferLockedTokens(
            lockedFunds.keyPair,
            lockedFunds.id,
            'TFT',
            Number(lockedFunds.balance)
        );
    }, 300000);
});
