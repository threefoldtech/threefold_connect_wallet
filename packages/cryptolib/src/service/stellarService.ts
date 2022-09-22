import StellarSdk, {
    AccountResponse,
    Asset,
    Keypair,
    Memo,
    Networks,
    Operation,
    Server,
    Transaction,
    TransactionBuilder,
} from 'stellar-sdk';

import axios from 'axios';
import { makeFundPayment } from './fundService';

export type Currencies = { [key: string]: { asset_code: string; issuer: string } };
export const getConfig: () => {
    server: Server;
    serverURL: string;
    network: string;
    serviceUrl: string;
    feeDestination: string;
    feeAmount: string;
    currencies: Currencies;
} = () => {
    // @todo: config
    // @todo: make this better

    let serverURL = 'https://horizon-testnet.stellar.org';
    let network = Networks.TESTNET;
    let serviceUrl = 'https://testnet.threefold.io/threefoldfoundation';
    let feeDestination = 'GAKONCKYJ7PRRKBZSWVPG3MURUNX4H44AB3CU2YGVKF2FD7KXJBB3XID';
    let feeAmount = '0.1000000';
    let currencies: Currencies = {
        TFT: {
            asset_code: 'TFT',
            issuer: 'GA47YZA3PKFUZMPLQ3B5F2E3CJIB57TGGU7SPCQT2WAEYKN766PWIMB3',
        },
        BTC: {
            asset_code: 'BTC',
            issuer: 'GBMDRYGRFNPCGNRYVTHOPFE7F7L566ZLZM7XFQ2UWWIE3NVSO7FA5MFY',
        },
        TFTA: {
            asset_code: 'TFTA',
            issuer: 'GB55A4RR4G2MIORJTQA4L6FENZU7K4W7ATGY6YOT2CW47M5SZYGYKSCT',
        },
        FreeTFT: {
            asset_code: 'FreeTFT',
            issuer: 'GBLDUINEFYTF7XEE7YNWA3JQS4K2VD37YU7I2YAE7R5AHZDKQXSS2J6R',
        },
    };

    if (typeof window !== 'undefined') {
        serverURL = (<any>window)?.stellarServerUrl || 'https://horizon.stellar.org';
        network = (<any>window)?.stellarNetwork || Networks.PUBLIC;
        serviceUrl = (<any>window)?.serviceUrl || ''; //@todo prod url?
        feeDestination = (<any>window)?.feeDestination || ''; //@todo prod fee destination address;
        feeAmount = (<any>window)?.feeAmount || '0.1000000';
        currencies = (<any>window)?.currencies || null; //@todo prod currencies
    }

    const server = new Server(serverURL);
    return {
        server,
        serverURL,
        network,
        serviceUrl,
        feeDestination,
        feeAmount,
        currencies,
    };
};

export const generateActivationCode = async (keyPair: Keypair): Promise<boolean> => {
    try {
        const transaction = await fetchAccountActivationTransaction(keyPair);
        return await submitAccountActivationTransaction(transaction, keyPair);
    } catch (e) {
        return false;
    }
};

export const migrateAccount: (stellarPair: Keypair, tfchainAddress: String) => Promise<void> = async (
    stellarPair: Keypair,
    tfchainAddress: String
) => {
    console.log('activate account');

    await migrateStellarAccount(tfchainAddress, stellarPair);
    console.log('add trustline');
    await addTrustLine(stellarPair);
    console.log('convert tokens');
    await convertTokens(tfchainAddress, stellarPair.publicKey());
};

export const loadAccount: (pair: Keypair) => Promise<AccountResponse> = async (pair: Keypair) => {
    const { server } = getConfig();
    return await server.loadAccount(pair.publicKey());
};
export const convertTokens: (tfchainAddress: String, stellarAddress: String) => Promise<void> = async (
    tfchainAddress: String,
    stellarAddress: String
) => {
    const { serviceUrl } = getConfig();

    const response = await axios.post(`${serviceUrl}/conversion_service/migrate_tokens`, {
        args: {
            tfchain_address: tfchainAddress,
            stellar_address: stellarAddress,
        },
    });
    const result = response.data;
};

export const addTrustLine: (pair: Keypair) => Promise<void> = async (pair: Keypair) => {
    const { server, currencies, network } = getConfig();
    const account = await loadAccount(pair);
    const fee = String(await server.fetchBaseFee());

    const transaction = new TransactionBuilder(account, {
        fee,
        networkPassphrase: network,
    });
    Object.keys(currencies).forEach(currency => {
        if (currencies[currency].asset_code === 'BTC') {
            return;
        }

        const asset = new Asset(currencies[currency].asset_code, currencies[currency].issuer);
        transaction.addOperation(
            Operation.changeTrust({
                asset: asset,
            })
        );
    });

    transaction.setTimeout(3000);

    const tx = transaction.build();
    tx.sign(pair);
    const trustlineResult = await server.submitTransaction(tx);
};
const migrateStellarAccount = async (tfchainAddress: String, stellarPair: Keypair) => {
    const requestOptions = {
        method: 'POST',
        body: JSON.stringify({
            args: {
                tfchain_address: tfchainAddress,
                address: stellarPair.publicKey(),
            },
        }),
        headers: {
            'Content-Type': 'application/json',
        },
    };
    const { serviceUrl } = getConfig();
    const response = await axios.post(`${serviceUrl}/conversion_service/activate_account`, {
        args: {
            tfchain_address: tfchainAddress,
            address: stellarPair.publicKey(),
        },
    });
    const activateAccountresult = response.data;
};

export const buildFundedPaymentTransaction = async (
    sourceKeyPair: Keypair,
    destination: string,
    amount: number,
    message: string = '',
    currency: string = ''
) => {
    const { server, currencies, network, serviceUrl } = getConfig();
    // Transaction will hold a built transaction we can resubmit if the result is unknown.

    try {
        await server.loadAccount(destination);
        // If the account is not found, surface a nicer error message for logging.
    } catch (error) {
        if (error instanceof StellarSdk.NotFoundError) {
            throw new Error('The destination account does not exist!');
        } else {
            throw error;
        }
    }
    // First, check to make sure that the destination account exists.
    // You could skip this, but if the account does not exist, you will be charged
    // the transaction fee when the transaction fails.
    const sourceAccount = await server.loadAccount(sourceKeyPair.publicKey());
    // Start building the transaction.
    const asset = new Asset(currencies[currency].asset_code, currencies[currency].issuer);

    const feePayment = await makeFundPayment(sourceKeyPair.publicKey(), asset);

    return (
        new TransactionBuilder(sourceAccount, {
            fee: '0',
            networkPassphrase: network,
        })
            .addOperation(feePayment)
            // A memo allows you to add your own metadata to a transaction. It's
            // optional and does not affect how Stellar treats the transaction.
            .addOperation(
                Operation.payment({
                    destination: destination,
                    // Because Stellar allows transaction in many currencies, you must
                    // specify the asset type. The special "native" asset represents Lumens.
                    asset: asset,
                    amount: amount.toFixed(7),
                    source: sourceKeyPair.publicKey(),
                })
            )
            .addMemo(Memo.text(message))
            // Wait a maximum of three minutes for the transaction
            .setTimeout(86400)
            .build()
    );
};

export const submitFundedTransaction = async (fundedTransaction: Transaction, sourceKeyPair: Keypair) => {
    // this keypair is regenerated every time to prevent wrong interfaces
    const signingKeypair = Keypair.fromSecret(sourceKeyPair.secret());

    // Sign the transaction to prove you are actually the person sending it.
    fundedTransaction.sign(signingKeypair);
    // And finally, send it off to Stellar!

    const { serviceUrl } = getConfig();

    console.log('Sending to');
    console.log(`${serviceUrl}/transactionfunding_service/fund_transaction`);

    try {
        const response = await axios.post(`${serviceUrl}/transactionfunding_service/fund_transaction`, {
            args: {
                transaction: fundedTransaction.toXDR(),
            },
        });
        return response.data;
    } catch (error) {
        console.error('Something went wrong!', error);
        throw error;
    }
};

export const verifyTransaction = (
    originalTransaction: Transaction,
    fundedTransaction: Transaction,
    currency: string
) => {
    const { feeAmount, feeDestination, currencies } = getConfig();

    // transaction cant have multiple signatures be
    // check signatures on funded (1)
    if (fundedTransaction.signatures.length !== 1) {
        return false;
    }

    // check operations length
    if (fundedTransaction.operations.length !== 2) {
        return false;
    }

    // check fist payment of original with first payment of funded
    if (
        !checkPayment(
            <Operation.Payment>originalTransaction.operations[0],
            <Operation.Payment>fundedTransaction.operations[0],
            false
        )
    ) {
        return false;
    }

    const referenceFeePayment = {
        destination: feeDestination,
        asset: new Asset(currencies[currency].asset_code, currencies[currency].issuer),
        amount: feeAmount,
        source: originalTransaction.operations[0].source,
    };
    // check feePayment with first payment of funded
    if (
        !checkPayment(<Operation.Payment>referenceFeePayment, <Operation.Payment>fundedTransaction.operations[1], true)
    ) {
        return false;
    }

    // check if memo hasn't been changed
    if (originalTransaction.memo.type !== fundedTransaction.memo.type) {
        return false;
    }
    if (originalTransaction.memo.value !== fundedTransaction.memo.value?.toString()) {
        return false;
    }

    return true;
};

export const checkPayment = (
    originalOperation: Operation.Payment,
    fundedOperation: Operation.Payment,
    isFee = false
) => {
    if (
        originalOperation.destination !== fundedOperation.destination ||
        originalOperation.asset.issuer !== fundedOperation.asset.issuer ||
        originalOperation.asset.code !== fundedOperation.asset.code ||
        originalOperation.amount !== fundedOperation.amount ||
        originalOperation.source !== fundedOperation.source
    ) {
        // Because fee can be less then 0.1
        if (isFee && Number(fundedOperation.amount) < 0.1) {
            return true;
        }
        return false;
    }
    return true;
};

export const fetchAccountActivationTransaction = async (stellarPair: Keypair) => {
    const { serviceUrl, network } = getConfig();

    const response = await axios.post(`${serviceUrl}/activation_service/activate_account`, {
        address: stellarPair.publicKey(),
    });
    const activateAccountResult = JSON.parse(response.data)?.activation_transaction;

    if (!activateAccountResult) {
        throw Error('no activationTransaction');
    }

    return new Transaction(activateAccountResult, network);
};

export const submitAccountActivationTransaction = async (transaction: Transaction, keypair: Keypair) => {
    // @todo: validate transaction

    console.log('Signing the transaction with KeyPair (Public Key: ', keypair.publicKey(), ')');
    transaction.sign(keypair);

    const { server } = getConfig();

    //@ts-ignore
    console.log('Signing to server: ', server.serverURL._parts.hostname);

    console.log('This is the XDR');
    console.log(transaction.toXDR());

    try {
        await server.submitTransaction(transaction);
        return true;
    } catch (e) {
        return false;
    }
};
