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
import { getStellarClient as _getStellarClient } from '../src/service/stellarService';
import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';
import types from './types.json';
import axios from 'axios';

import { web3FromAddress } from '@polkadot/extension-dapp';

beforeEach(() => {
    var window = global;

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

function hex2a(hex) {
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
        const v = parseInt(hex.substr(i, 2), 16);
        if (v) str += String.fromCharCode(v);
    }
    return str;
}

async function getEntity(api, id) {
    try {
        id = parseInt(id);
    } catch (error) {
        throw Error('ID must be an integer');
    }
    if (isNaN(id) || id === 0) {
        throw Error('You must pass a valid ID');
    }

    const entity = await api.query.tfgridModule.entities(id);

    const res = entity.toJSON();

    if (res.id !== id) {
        throw Error('No such entity');
    }

    res.name = hex2a(res.name);
    return res;
}

async function getEntityIDByName(api, name) {
    const entity = await api.query.tfgridModule.entityIdByName(name);
    return entity.toJSON();
}

async function createEntitySign(key: any, name: string, country: string, city: string) {
    if (name === '') {
        throw Error('You must pass a valid name');
    }

    const utf8Encode = new TextEncoder();

    const nameAsBytes = utf8Encode.encode(name);
    const countryAsBytes = utf8Encode.encode(country);
    const cityAsBytes = utf8Encode.encode(city);

    const concatArray = new Uint8Array([...nameAsBytes, ...countryAsBytes, ...cityAsBytes]);

    const signedMessage = key.sign(concatArray);

    return Buffer.from(signedMessage).toString('hex');
}

async function getSubstrateBalance(publicKey: string) {
    const api = await getSubstrateApi();

    const { data: balances } = await api.query.system.account(publicKey);
    const balance = balances.free.toJSON() / 1e7;

    return Number(balance);
}

function getStellarClient() {
    return _getStellarClient();
}

function getSubstrateApi() {
    const provider = new WsProvider('wss://tfchain.test.grid.tf'); //
    // const api = await ApiPromise.create({ provider, types });

    // const [chain, nodeName, nodeVersion] = await Promise.all([
    //     api.rpc.system.chain(),
    //     api.rpc.system.name(),
    //     api.rpc.system.version(),
    // ]);

    return ApiPromise.create({ provider, types });
}

async function getBalanceForStellarAddress(publicKey: string) {
    const server = getStellarClient();
    //@ts-ignore
    const balance = (await server.accounts().accountId(publicKey).call()).balances.find(balance => {
        //@ts-ignore
        return balance?.asset_code === 'TFT';
    }).balance;
    return Number(balance);
}

async function connectToSubstrate() {
    const provider = new WsProvider('wss://tfchain.test.threefold.io');

    const api = await ApiPromise.create({ provider, types });

    const [chain, nodeName, nodeVersion] = await Promise.all([
        api.rpc.system.chain(),
        api.rpc.system.name(),
        api.rpc.system.version(),
    ]);

    console.log(`You are connected to chain ${chain} using ${nodeName} v${nodeVersion}`);
    console.log('api: ', api.genesisHash.toHex());
}

async function stellarTesting() {
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
    // expect(response.transactionhash).toBeTruthy();

    const balanceAfterTransaction = await getBalanceForStellarAddress(myTestingKeypair.publicKey());
    console.log('Balance after: ', balanceAfterTransaction);

    // expect(balanceBeforeTransaction + amount).toEqual(balanceAfterTransaction);
}

async function activationServiceForSubstrate(id) {
    const headers = {
        'Content-Type': 'application/json',
    };

    const url = 'https://activation.test.grid.tf/activation/activate';
    const data = { substrateAccountID: id };

    const response = await axios.post(url, data, { headers });

    return response;
}

describe('The wallet', () => {
    it.skip('should be able to connect to the stellar network.', async () => {
        const myTestingSecret = 'SCYSPEAKVVLSFW72EFQ2ZL7FO772GWPCCFBLMRDWBAHJSMGETT6KFDC5';
        const myTestingKeypair: Keypair = Keypair.fromSecret(myTestingSecret);

        const server = getStellarClient();

        const publicKey = myTestingKeypair.publicKey();
        const id = (await server.accounts().accountId(publicKey).call()).id;

        expect(id).toBe(publicKey);
    }, 60000);

    it.skip('should be able to connect to the substrate(TFChain) network.', async () => {
        const api = await getSubstrateApi();

        const expectedGenesisHash = '0x0378abe88c21bd382106e7977902eef4f542bb2d3e67e8a318151e323b2d0660';
        const genesisHash = api.genesisHash.toHex();

        expect(genesisHash).toBe(expectedGenesisHash);
    }, 60000);

    it.skip('should be able to query the balance of a stellar wallet.', async () => {
        const myTestingSecret = 'SCYSPEAKVVLSFW72EFQ2ZL7FO772GWPCCFBLMRDWBAHJSMGETT6KFDC5';
        const myTestingKeypair: Keypair = Keypair.fromSecret(myTestingSecret);

        const publicKey = myTestingKeypair.publicKey();

        const balance = await getBalanceForStellarAddress(publicKey);

        console.log('BALANCE');
        console.log(balance);

        expect(typeof balance).toBe('number');
        expect(balance).toBeGreaterThanOrEqual(0);
    }, 60000);

    it.skip('should be able to query the balance of a substrate(TFChain) wallet.', async () => {
        const publicKey: string = '5FAmpqUUiYHnvJFqcc4iqFpoou6uyceecHju1fSZc5QcdWvD'; // 5F4Yb9T5B3rkeTCfCCEAg92V9CFPviC3XikeiBcqMWFrNz5B
        const balance = await getSubstrateBalance(publicKey);

        console.log('BALANCE');
        console.log(balance);

        expect(typeof balance).toBe('number');
        expect(balance).toBeGreaterThanOrEqual(0);
    }, 60000);

    it.skip('[Bridge] should transfer TFTs from stellar to substrate(TFChain)', async () => {
        const currency = 'TFT';

        const stellarSeedPhrase =
            'uncle credit near awkward length summer clap patch script embark list fog amount marble warrior economy cross age cargo stuff tennis minimum index profit';

        const stellarEntropy = calculateWalletEntropyFromAccount(stellarSeedPhrase, 0);
        const stellarKeypairFrom: Keypair = keypairFromAccount(stellarEntropy);

        // const stellarSecretFrom = "N/A";
        // const substrateSecretTo = "N/A";

        const stellarPublicKeyFrom: string = stellarKeypairFrom.publicKey();
        const substratePublicKeyTo: string = '5FAmpqUUiYHnvJFqcc4iqFpoou6uyceecHju1fSZc5QcdWvD'; // 5FAmpqUUiYHnvJFqcc4iqFpoou6uyceecHju1fSZc5QcdWvD
        // const substratePublicKeyTo: string = '5Dtq2zb31yLaZMLHtPofsZc4dzPA7yKmhixNYVrn2FgRywLd'; // 5FAmpqUUiYHnvJFqcc4iqFpoou6uyceecHju1fSZc5QcdWvD

        const stellarPublicKeyBridge = 'GA2CWNBUHX7NZ3B5GR4I23FMU7VY5RPA77IUJTIXTTTGKYSKDSV6LUA4'; // Stellar wallet from threefold which does the actual transfer to TFChain.
        const substratePublicKeyBridge = 'N/A';

        console.log('PUBLIC KEY');
        console.log(stellarPublicKeyFrom);

        const stellarBalanceBeforeTransaction = await getBalanceForStellarAddress(stellarPublicKeyFrom);
        const substrateBalanceBeforeTransaction = await getSubstrateBalance(substratePublicKeyTo);

        console.log('stellarBalanceBeforeTransaction', stellarBalanceBeforeTransaction);
        console.log('substrateBalanceBeforeTransaction', substrateBalanceBeforeTransaction);

        const api = await getSubstrateApi();

        const keyring = new Keyring({ type: 'ed25519' });
        const substrateSeedPhrase =
            'uncle credit near awkward length summer clap patch script embark list fog amount marble warrior economy cross age cargo stuff tennis minimum index profit';
        const key = keyring.addFromUri(substrateSeedPhrase);

        console.log('Key: ', key.address);

        // console.log('Trying to activate the substrate account');
        // const activationResponse = await activationServiceForSubstrate(substratePublicKeyTo);
        // console.log({ activationResponse });

        const target = substratePublicKeyTo; // Could be the wrong value.
        const name = 'jimbermathy.3bot';

        // console.log('tx.tfgridModule: ', api.tx.tfgridModule);
        // console.log('query.tfgridModule: ', api.query.tfgridModule);

        // const callback = (result, extra) => {
        //     console.log('Callback from signAndSend.');
        //     console.log(result);
        //     console.log(extra);
        // };

        let entityId = await getEntityIDByName(api, name);

        console.log('entityId');
        console.log(entityId);

        if (entityId === 0) {
            const country = '0';
            const city = '0';
            const signature = await createEntitySign(key, name, country, city);

            console.log('signature: ', signature);

            console.log('Trying to create the entity');
            console.log('target');
            console.log(target);
            console.log('name');
            console.log(name);
            console.log('country');
            console.log(country);
            console.log('city');
            console.log(city);
            console.log('signature');
            console.log(signature);

            const entity = await api.tx.tfgridModule.createEntity(target, name, country, city, signature);
            const nonce = await api.rpc.system.accountNextIndex(substratePublicKeyTo);

            console.log('signAndSend');
            console.log('entity');
            console.log(entity);
            console.log('nonce');
            console.log(nonce);

            const callback = async res => {
                console.log('Callback from signAndSend.');

                if (res instanceof Error) {
                    console.log(res);
                    process.exit.skip(1);
                }
                const { events = [], status } = res;
                console.log(`Current status is ${status.type}`);

                if (status.isFinalized) {
                    console.log(`Transaction included at blockHash ${status.asFinalized}`);

                    // Loop through Vec<EventRecord> to display all events
                    events.forEach(({ phase, event: { data, method, section } }) => {
                        console.log(`\t' ${phase}: ${section}.${method}:: ${data}`);
                    });

                    entityId = await getEntityIDByName(api, name);
                    console.log('We found entityId: ', entityId);

                    const entity = await getEntity(api, entityId);
                    console.log(entity);
                    // process.exit.skip(1);
                }
            };

            await entity.signAndSend(key, { nonce }, callback);

            setTimeout(() => {
                console.log('Waiting 20 seconds, jobs done.');
            }, 20000);
        }

        const amountToTransfer = Number(5);
        const memoToIncludeWithTransaction = 'entity_' + entityId;

        console.log('buildFundedPaymentTransaction');

        const fundedTransaction = await buildFundedPaymentTransaction(
            stellarKeypairFrom,
            stellarPublicKeyBridge,
            amountToTransfer,
            memoToIncludeWithTransaction,
            currency
        );

        // const _stellarKeypairFrom: Keypair = keypairFromAccount(stellarEntropy);

        // const _fundedTransaction = await buildFundedPaymentTransaction(
        //     _stellarKeypairFrom,
        //     "GA2CWNBUHX7NZ3B5GR4I23FMU7VY5RPA77IUJTIXTTTGKYSKDSV6LUA4",
        //     5,
        //     "N/A",
        //     "TFT"
        // );

        console.log('submitFundedTransaction');

        const fundedTransactionResponse = await submitFundedTransaction(fundedTransaction, stellarKeypairFrom);

        console.log('woooo');
        const stellarBalanceAfterTransaction = await getBalanceForStellarAddress(stellarPublicKeyFrom);
        const substrateBalanceAfterTransaction = await getSubstrateBalance(substratePublicKeyTo);

        console.log('TransactionHash', fundedTransactionResponse.transactionhash);

        console.log('stellarBalanceBeforeTransaction', stellarBalanceBeforeTransaction);
        console.log('stellarBalanceAfterTransaction', stellarBalanceAfterTransaction);
        console.log('substrateBalanceBeforeTransaction', substrateBalanceBeforeTransaction);
        console.log('substrateBalanceAfterTransaction', substrateBalanceAfterTransaction);

        expect(fundedTransactionResponse.transactionhash).toBeTruthy();
        expect(stellarBalanceBeforeTransaction).toBeTruthy();
        expect(stellarBalanceAfterTransaction).toBeTruthy();

        // expect(false).toBe(true);
    }, 60000);

    it.skip('[Bridge] should transfer TFTs from substrate(TFChain) to stellar', async () => {
        expect(false).toBe(true);
    }, 60000);

    it.skip('should transfer TFTs from stellar to stellar', async () => {
        expect(false).toBe(true);
    }, 60000);

    it.skip('should transfer TFTs from substrate(TFChain) to substrate(TFChain)', async () => {
        // const publicKey: string = '5FAmpqUUiYHnvJFqcc4iqFpoou6uyceecHju1fSZc5QcdWvD'; // 5F4Yb9T5B3rkeTCfCCEAg92V9CFPviC3XikeiBcqMWFrNz5B
        // const balance = await getSubstrateBalance(publicKey);

        // console.log('BALANCE');
        // console.log(balance);

        // expect(typeof balance).toBe('number');
        // expect(balance).toBeGreaterThanOrEqual(0);

        const myTestingSecret = 'SCYSPEAKVVLSFW72EFQ2ZL7FO772GWPCCFBLMRDWBAHJSMGETT6KFDC5';
        const myTestingKeypair: Keypair = Keypair.fromSecret(myTestingSecret);

        const publicKey = myTestingKeypair.publicKey();

        const api = await getSubstrateApi();

        const x = await api.query.system.account();

        const address: string = publicKey;
        const target: string = '';
        const amount: number = 5;

        const callback = () => {};

        const injector = await web3FromAddress(address);

        await api.tx.tftBridgeModule
            .swapToStellar(target, amount * 1e7)
            .signAndSend(address, { signer: injector.signer }, callback);

        expect(false).toBe(true);
    }, 60000);
});
