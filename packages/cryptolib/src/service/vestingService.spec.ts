import { checkVesting, generateVestingAccount } from './vestingService';
import { Keypair } from 'stellar-sdk';
import axios from 'axios';

const address = 'GCVBP7EYZVSOT5EJAI6P3LCH7C7WKUCLRM6TLTUV236ZC2R4K7Y752CE';

const friendBot = async (address: string) => {
    await axios.get('https://friendbot.stellar.org/?addr=' + address);
};

describe('funding', () => {
    it('should check an account for vesting acccount', async () => {
        const account = await checkVesting(address);

        expect(account.account_id).toEqual('GBD5VSSCS2W3VFBLGV4GS4JNKFE2X7V5U6CWT3JDLGHJDT4I6W4LCCXL');
    }, 60000);

    it('should not find vesting acccount for random address', async () => {
        const account = await checkVesting('GDSMZD335AGTDJ667PXDKHQHHLMGN7DXMGX6BC5VUPCPBECDJJWO2YFX');

        expect(account).toBeNull();
    }, 60000);

    it('should generate a vesting account', async () => {
        const randomKeypair = Keypair.random();
        await friendBot(randomKeypair.publicKey());
        const account = await generateVestingAccount(randomKeypair.publicKey());

        console.log(account.signers);
        expect(account).toBeTruthy();
        expect(account.signers).toHaveLength(12);
        const mySigner = account.signers.find(signer => signer.key === randomKeypair.publicKey());
        expect(mySigner.weight).toBe(5);
        const ownSigner = account.signers.find(signer => signer.key === account.id);
        expect(ownSigner.weight).toBe(0);

        const otherSigners = account.signers
            .filter(signer => signer.type !== 'preauth_tx')
            .filter(signer => signer.key !== randomKeypair.publicKey() && signer.key !== account.id);

        for (const otherSigner of otherSigners) {
            expect(otherSigner.weight).toBe(1);
        }
    }, 60000);
});
