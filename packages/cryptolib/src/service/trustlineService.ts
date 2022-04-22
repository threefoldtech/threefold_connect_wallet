import { getConfig } from './stellarService';
import axios from 'axios';
import {
    Asset,
    Keypair,
    Operation,
    Transaction,
    TransactionBuilder,
} from 'stellar-sdk';

export const selfFundTrustLine = async (
    keyPair: Keypair,
    asset_code: string
) => {
    const { server, currencies, network } = getConfig();
    const fee = String(await server.fetchBaseFee());

    const transactionAccount = await server.loadAccount(keyPair.publicKey());

    const transaction = new TransactionBuilder(transactionAccount, {
        fee,
        networkPassphrase: network,
    });

    const asset = new Asset(
        currencies[asset_code].asset_code,
        currencies[asset_code].issuer
    );
    transaction.addOperation(
        Operation.changeTrust({
            asset: asset,
        })
    );

    transaction.setTimeout(3000);

    const tx = transaction.build();
    tx.sign(keyPair);

    await server.submitTransaction(tx);
};

export const fundTrustLine = async (keyPair: Keypair, asset_code: string) => {
    const { serviceUrl, network, server, currencies } = getConfig();
    const response = await axios.post(
        `${serviceUrl}/activation_service/fund_trustline`,
        {
            asset: `${currencies[asset_code].asset_code}:${currencies[asset_code].issuer}`,
            address: keyPair.publicKey(),
        }
    );

    const tx = new Transaction(response.data.addtrustline_transaction, network);

    tx.sign(keyPair);
    await server.submitTransaction(tx);
};
