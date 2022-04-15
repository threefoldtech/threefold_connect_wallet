import { getConfig } from './stellarService';
import { Asset, BASE_FEE, Keypair, Operation, Transaction, TransactionBuilder } from 'stellar-sdk';
import axios from 'axios';

export const fetchUnlockTransaction = async (unlockHash: string) => {
    const { serviceUrl } = getConfig();
    const result = await axios.post(`${serviceUrl}/unlock_service/get_unlockhash_transaction`, {
        args: { unlockhash: unlockHash },
    });

    //@todo: validation
    const { network } = getConfig();
    return new Transaction(result.data.transaction_xdr, network);
};

export const getLockedBalances = async (keyPair: Keypair) => {
    const { server, currencies } = getConfig();

    const accounts = server.accounts().forSigner(keyPair.publicKey()).limit(200);
    const allowedCurrencies = Object.keys(currencies);
    const accountRecord = await accounts.call();
    const signedAccounts = accountRecord.records
        .filter(a => a.id !== keyPair.publicKey())
        .filter(a => !Object.keys(a.data_attr).includes('tft-vesting'));
    return signedAccounts.map(account => {
        const unlockHashSigner = account.signers.find(s => s.type === 'preauth_tx');
        return {
            keyPair,
            id: account.id,
            balance: account.balances.find(b => {
                //@ts-ignore
                return b.asset_type !== 'native' && allowedCurrencies.includes(b.asset_code);
            }),
            unlockHash: unlockHashSigner?.key || null,
        };
    });
};

export const transferLockedTokens = async (keyPair: Keypair, id: string, asset_code: string, amount?: number) => {
    const { server, network, currencies } = getConfig();

    const account = await server.loadAccount(keyPair.publicKey());

    const builder = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: network,
    });

    const currency = currencies[asset_code];
    if (amount) {
        builder.addOperation(
            Operation.payment({
                destination: keyPair.publicKey(),
                asset: new Asset(asset_code, currency.issuer),
                amount: amount.toFixed(7),
                source: id,
            })
        );
    }
    builder.addOperation(
        Operation.changeTrust({
            source: id,
            asset: new Asset(asset_code, currency.issuer),
            limit: '0',
        })
    );
    builder
        .addOperation(
            Operation.accountMerge({
                source: id,
                destination: keyPair.publicKey(),
            })
        )
        .setTimeout(86400);
    const transaction = builder.build();
    transaction.sign(keyPair);
    try {
        await server.submitTransaction(transaction);
    } catch (e) {
        throw Error(`Failed to submit locked transaction ${e} `);
    }
};
