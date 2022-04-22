import { getConfig } from './stellarService';
import { AccountResponse, Asset, BASE_FEE, Operation, TransactionBuilder } from 'stellar-sdk';
import axios, { AxiosResponse } from 'axios';
import { Keypair as StellarKeypair } from 'stellar-base';

export const checkVesting = async (publicKey: string): Promise<AccountResponse | null> => {
    const { server } = getConfig();

    const accountsWhereIsSigner = (await server.accounts().forSigner(publicKey).limit(200).call()).records;

    const accountsWhereIsSignerAndIsNotMe = accountsWhereIsSigner.filter(acc => acc.account_id !== publicKey);

    const accountRecord = accountsWhereIsSignerAndIsNotMe.find(acc =>
        Object.keys(acc.data_attr).includes('tft-vesting')
    );

    if (!accountRecord) {
        return null;
    }

    const vestingAccount = await server.loadAccount(accountRecord.account_id);

    if (vestingAccount.id !== accountRecord.account_id) {
        throw new Error('no vesting account found');
    }

    return vestingAccount;
};

export const generateVestingAccount = async (publicKey: string): Promise<AccountResponse> => {
    const { serviceUrl } = getConfig();
    let response: AxiosResponse<any>;
    try {
        response = await axios.post(`${serviceUrl}/vesting_service/create_vesting_account`, {
            owner_address: publicKey,
        });
    } catch (error) {
        throw new Error('Could not create vestingAccount');
    }

    const vestingAddress = response.data?.address;

    if (!vestingAddress) throw new Error('Could not create vestingAccount');

    const { server } = getConfig();

    const vestingAccount = await server.loadAccount(vestingAddress);

    if (vestingAccount.id !== vestingAddress) {
        throw new Error('no vesting account found');
    }

    return vestingAccount;
};

export interface IVestedResponse {
    owner_address: string;
    vesting_accounts: IVestedAccount[];
}

export interface IVestedAccount {
    address: string;
    balance: number;
    free: number;
    vested: number;
}

export const getVestedRecords = async (publicKey: string): Promise<IVestedResponse> => {
    const { serviceUrl } = getConfig();

    // @TODO: uncomment this when Rob released updates on prod
    // return await axios.post(`${serviceUrl}/vesting_service/vesting_accounts`, {
    //     owner_address: publicKey,
    // });

    // Dummy data API for testing purposes
    return (
        await axios.post('http://localhost:3000/api/v1/vesting_accounts', {
            owner_address: publicKey,
        })
    ).data;
};

export const getTransferVestedTokensXDR = async (
    destinationKeyPair: StellarKeypair,
    from: string,
    asset_code: string,
    amount: number
): Promise<string> => {
    const { server, network, currencies } = getConfig();

    const account = await server.loadAccount(destinationKeyPair.publicKey());

    const builder = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: network,
    });

    const currency = currencies[asset_code];
    builder
        .addOperation(
            Operation.payment({
                destination: destinationKeyPair.publicKey(),
                asset: new Asset(asset_code, currency.issuer),
                amount: amount.toFixed(7),
                source: from,
            })
        )
        .setTimeout(86400);

    const transaction = builder.build();
    transaction.sign(destinationKeyPair);

    return transaction.toXDR();
};
