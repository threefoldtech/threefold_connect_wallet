import { calculateWalletEntropyFromAccount, keypairFromAccount, revineAddressFromSeed } from './cryptoService';
import {
    migrateAccount,
    loadAccount,
    convertTokens,
    buildFundedPaymentTransaction,
    submitFundedTransaction,
    generateActivationCode,
    fetchAccountActivationTransaction,
    submitAccountActivationTransaction,
} from './stellarService';
import { generateMnemonic } from '@jimber/simple-bip39';
import { Keypair } from 'stellar-sdk';

const seedPhrase: string =
    'treat gloom wrong topple learn device stable orchard essay bitter brand cattle amateur beach bulk build cluster quit survey news physical hole tower glass';

const walletEntropy = calculateWalletEntropyFromAccount(seedPhrase, 0);
const keypair = keypairFromAccount(walletEntropy);

const revineKeypair = revineAddressFromSeed(seedPhrase, 0);
describe('stellar', () => {
    // can only be done the once and generating an account for every tests isn't particulary good 💩
    it.skip('should generate an account', async () => {
        console.log({ revine: revineKeypair, stellar: keypair.publicKey() });

        try {
            await migrateAccount(keypair, revineKeypair);
        } catch (error) {
            throw error;
        }
    }, 60000);

    it.skip('should convert tokens', async () => {
        console.log({ revine: revineKeypair, stellar: keypair.publicKey() });

        try {
            await convertTokens(revineKeypair, keypair.publicKey());
        } catch (error) {
            console.log(error.request);
            console.log(error.response.data);
            throw error;
        }
    }, 60000);

    it.skip('should load an account', async () => {
        let accountResponse = await loadAccount(keypair);
        expect(accountResponse.accountId()).toBe('' + 'GBTJEFDDMA5N4TDBFLJGA6K3MQFNHR2KUUFYAKYCOAEE43JD4CP3UTQC');
    });

    it('should do payment with tft', async () => {
        const keypairDaily = Keypair.fromSecret('SB5UP6KAFNVYIRZ7M3CUUHHWOA6BCO3VFWEBL4HCM44SNHUBR76I72WP');

        const fundedTransaction = await buildFundedPaymentTransaction(
            keypairDaily,
            'GA6FBB33B6FVUSFBQSGBR47PKG2UQV6CTFDJLQEBUDKGLEMMASJYDRC2',
            1,
            'test',
            'FreeTFT'
        );

        const response = await submitFundedTransaction(fundedTransaction, keypairDaily);
        console.log(response);
    }, 30000);

    it.skip('should generate activation code', async () => {
        const seedPhrase: string = generateMnemonic(256);

        const walletEntropy = calculateWalletEntropyFromAccount(seedPhrase, 0);
        const keypair = keypairFromAccount(walletEntropy);
        const response = await generateActivationCode(keypair);

        // @ts-ignore
        expect(typeof response.activation_code).toBe('string');
        // @ts-ignore
        expect(typeof response.phonenumbers).toBe('object');
    }, 30000);

    it.skip('should activate account', async () => {
        const seedPhrase: string = generateMnemonic(256);

        const walletEntropy = calculateWalletEntropyFromAccount(seedPhrase, 0);
        const keypair = keypairFromAccount(walletEntropy);
        const transaction = await fetchAccountActivationTransaction(keypair);
        await submitAccountActivationTransaction(transaction, keypair);
    }, 30000);
});
