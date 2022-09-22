import { Server, TransactionBuilder } from 'stellar-sdk';
import flagsmith from 'flagsmith';
import { Keypair as StellarKeyPair } from 'stellar-base';

let serverCache;

export const getStellarClient = () => {
    if (serverCache) return serverCache;

    const stellarUrl = <string>flagsmith.getValue('stellar-url');

    serverCache = new Server(stellarUrl);
    return serverCache;
};

export const useStellarFaucet = async (publicKey: string) => {
    const response = await fetch('https://friendbot.stellar.org?addr=' + encodeURIComponent(publicKey));
    return await response.json();
};

export const signAndSubmitTransaction = async (kp: StellarKeyPair, transaction: TransactionBuilder) => {
    const transactionBuilder = transaction.build();
    transactionBuilder.sign(kp);

    console.info('Submitting transaction');
    const server = getStellarClient();

    await server.submitTransaction(transactionBuilder);
};
