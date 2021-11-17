//@ts-ignore
import {
    buildFundedPaymentTransaction,
    submitFundedTransaction,
    calculateWalletEntropyFromAccount,
    keypairFromAccount,
    // fetchFundDetails,
    // getConfig,
    //@ts-ignore
} from '@jimber/stellar-crypto';
import { Keypair } from 'stellar-sdk';
import { getStellarClient } from '../src/service/stellarService';
import { ApiPromise, WsProvider } from '@polkadot/api';
import types from './types.json';

beforeEach(() => {
    (<any>window).stellarServerUrl = 'https://horizon.stellar.org';
    (<any>window).stellarNetwork = 'Public Global Stellar Network ; September 2015';
    (<any>window).serviceUrl = 'https://tokenservices.threefold.io/threefoldfoundation';
    (<any>window).feeDestination = 'GAAN2EVASE724NRZWDKPW57NVSGIJZHVEDSSAJ7PKYIS2D26OEUYXGX3';
    (<any>window).feeAmount = 0.1;
    (<any>window).currencies = [
        {
            name: 'TFT',
            asset_code: 'TFT',
            type: 'stellar',
            issuer: 'GBOVQKJYHXRR3DX6NOX2RRYFRCUMSADGDESTDNBDS6CDVLGVESRTAC47',
        },
        {
            name: 'BTC',
            asset_code: 'BTC',
            type: 'stellar',
            issuer: 'GCNSGHUCG5VMGLT5RIYYZSO7VQULQKAJ62QA33DBC5PPBSO57LFWVV6P',
        },
        {
            name: 'TFTA',
            asset_code: 'TFTA',
            type: 'stellar',
            issuer: 'GBUT4GP5GJ6B3XW5PXENHQA7TXJI5GOPW3NF4W3ZIW6OOO4ISY6WNLN2',
        },
        {
            name: 'FreeTFT',
            asset_code: 'FreeTFT',
            type: 'stellar',
            issuer: 'GCBGS5TFE2BPPUVY55ZPEMWWGR6CLQ7T6P46SOFGHXEBJ34MSP6HVEUT',
        },
    ].reduce((previousValue, currentValue) => {
        if (currentValue.type !== 'stellar') return previousValue;

        //@ts-ignore
        previousValue[currentValue.asset_code] = {
            asset_code: currentValue.asset_code,
            issuer: currentValue.issuer,
        };
        return previousValue;
    }, {});
});

async function getBalanceForStellarAddress(publicKey: String) {
    const server = getStellarClient();
    //@ts-ignore
    const balance = (await server.accounts().accountId(publicKey).call()).balances.find(balance => {
        //@ts-ignore
        return balance?.asset_code === 'TFT';
    }).balance;
    return Number(balance);
}

describe('Bridge', () => {
    it.skip('Transaction from Stellar to Substrate with funds', async () => {
        const appSeedPhrase =
            'uncle credit near awkward length summer clap patch script embark list fog amount marble warrior economy cross age cargo stuff tennis minimum index profit';
        const entropy = calculateWalletEntropyFromAccount(appSeedPhrase, 0);
        const keyPair: Keypair = keypairFromAccount(entropy);

        const mySecret = 'SBL24K2F5ZINC74YX6MFGOLRFRMVFVOZX3DHNWYJGEZQ23NDIZBXIC42';
        const myKeypair: Keypair = Keypair.fromSecret(mySecret);

        console.log('PUBLIC KEY: ', myKeypair.publicKey());

        const myTestingSecret = 'SCYSPEAKVVLSFW72EFQ2ZL7FO772GWPCCFBLMRDWBAHJSMGETT6KFDC5';
        const myTestingKeypair: Keypair = Keypair.fromSecret(myTestingSecret);

        const balanceBeforeTransaction = await getBalanceForStellarAddress(myTestingKeypair.publicKey());
        console.log('Balance before: ', balanceBeforeTransaction);

        const amount = Number(5);

        const fundedTransaction = await buildFundedPaymentTransaction(
            myKeypair,
            myTestingKeypair.publicKey(),
            amount,
            'test',
            'TFT'
        );

        const response = await submitFundedTransaction(fundedTransaction, myKeypair);
        expect(response.transactionhash).toBeTruthy();

        const balanceAfterTransaction = await getBalanceForStellarAddress(myTestingKeypair.publicKey());
        console.log('Balance after: ', balanceAfterTransaction);

        expect(balanceBeforeTransaction + amount).toEqual(balanceAfterTransaction);
    }, 60000);

    it('Substrate things', async () => {
        const provider = new WsProvider('wss://tfchain.test.threefold.io');

        const api = await ApiPromise.create({ provider, types });

        const [chain, nodeName, nodeVersion] = await Promise.all([
            api.rpc.system.chain(),
            api.rpc.system.name(),
            api.rpc.system.version(),
        ]);

        console.log(`You are connected to chain ${chain} using ${nodeName} v${nodeVersion}`);
        console.log('api: ', api.genesisHash.toHex());
    }, 60000);
});
