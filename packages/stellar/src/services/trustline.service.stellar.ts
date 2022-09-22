import flagsmith from 'flagsmith';
import { getStellarNet } from '../helpers/stellar.helpers';
import { getStellarClient, signAndSubmitTransaction } from './core.service.stellar';
import {
    AccountResponse,
    Asset,
    Keypair as StellarKeyPair,
    Networks,
    Operation,
    TransactionBuilder,
} from 'stellar-sdk';
import { IAsset } from 'shared-types';

export const addNecessaryStellarTrustlines = async (kp: StellarKeyPair) => {
    const supportedCurrencies = flagsmith.getValue('supported-currencies');
    const server = getStellarClient();
    const baseFee = String(await server.fetchBaseFee());
    const network: Networks | null = getStellarNet();

    const account: AccountResponse = await server.loadAccount(kp.publicKey());

    if (!supportedCurrencies) return;
    if (!network) return;

    const options: TransactionBuilder.TransactionBuilderOptions = {
        fee: baseFee,
        networkPassphrase: network,
    };

    const transaction = new TransactionBuilder(account, options);

    const mappedCurrencies: IAsset[] = JSON.parse(supportedCurrencies.toString()).map((currency: any) => {
        return {
            assetCode: currency.asset_code,
            issuer: currency.issuer,
        };
    });

    mappedCurrencies.forEach((asset: IAsset) => {
        const stellarAsset = new Asset(asset.assetCode, asset.issuer);
        transaction.addOperation(Operation.changeTrust({ asset: stellarAsset }));
    });

    transaction.setTimeout(3000);
    await signAndSubmitTransaction(kp, transaction);
};
