import { getConfig } from './stellarService';
import { AccountResponse } from 'stellar-sdk';
import axios, { AxiosResponse } from 'axios';

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
