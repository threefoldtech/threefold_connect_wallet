import {
    calculateWalletEntropyFromAccount,
    keypairFromAccount,
} from './cryptoService';
import { fetchFundDetails, makeFundPayment } from './fundService';
import { Asset, Operation } from 'stellar-sdk';

const seedPhrase: string =
    'treat gloom wrong topple learn device stable orchard essay bitter brand cattle amateur beach bulk build cluster quit survey news physical hole tower glass';

const walletEntropy = calculateWalletEntropyFromAccount(seedPhrase, 0);
const keypair = keypairFromAccount(walletEntropy);

const source = 'GBTJEFDDMA5N4TDBFLJGA6K3MQFNHR2KUUFYAKYCOAEE43JD4CP3UTQC';

const asset = new Asset(
    'TFT',
    'GA47YZA3PKFUZMPLQ3B5F2E3CJIB57TGGU7SPCQT2WAEYKN766PWIMB3'
);

const referenceCondition = {
    asset: 'TFT:GA47YZA3PKFUZMPLQ3B5F2E3CJIB57TGGU7SPCQT2WAEYKN766PWIMB3',
    fee_account_id: 'GAKONCKYJ7PRRKBZSWVPG3MURUNX4H44AB3CU2YGVKF2FD7KXJBB3XID',
    fee_fixed: '0.01',
};

const fundOperation = Operation.payment({
    destination: 'GAKONCKYJ7PRRKBZSWVPG3MURUNX4H44AB3CU2YGVKF2FD7KXJBB3XID',
    asset: asset,
    amount: '0.01',
    source: source,
});

describe('funding', () => {
    it('should fetch a fee and destination address for a given asset', async () => {
        const fundDetails = await fetchFundDetails(asset);

        expect(fundDetails).toEqual(referenceCondition);
    }, 60000);

    it('should generate a fee payment operation for a given asset and source address', async () => {
        const operation = await makeFundPayment(source, asset);

        expect(operation).toEqual(fundOperation);
    }, 60000);
});
