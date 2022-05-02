import { ApiPromise } from '@polkadot/api';
import { KeyringPair } from '@polkadot/keyring/types';

export const getEntityIDByAccountId = async (api: ApiPromise, accountId: string) => {
    const entity = await api.query.tfgridModule.entityIdByAccountID(accountId);
    return entity.toJSON();
};

export const createEntitySign = (key: KeyringPair, name: string, country: string, city: string) => {
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
};

export const createAndSignEntityForBridge = async () => {
    const country = 'Unknown';
    const city = 'Unknown';
};
