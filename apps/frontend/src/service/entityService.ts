import { ApiPromise } from '@polkadot/api';
import { KeyringPair } from '@polkadot/keyring/types';
import { hex2a } from '@/service/substrateService';

export const getEntityIDByName = async (api: ApiPromise, name: string) => {
    const entity = await api.query.tfgridModule.entityIdByName(name);
    return entity.toJSON();
};

export const createEntitySign = (key: KeyringPair, name: string, country: string, city: string) => {
    if (name === '') {
        throw Error('You must pass a valid name');
    }

    console.log(TextEncoder);
    const utf8Encode = new TextEncoder();
    const nameAsBytes = utf8Encode.encode(name);
    const countryAsBytes = utf8Encode.encode(country);
    const cityAsBytes = utf8Encode.encode(city);

    const concatArray = new Uint8Array([...nameAsBytes, ...countryAsBytes, ...cityAsBytes]);

    const signedMessage = key.sign(concatArray);

    return Buffer.from(signedMessage).toString('hex');
};

export const getEntity = async (api: any, id: any) => {
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
};

export const createAndSignEntityForBridge = async () => {
    const country = 'Unknown';
    const city = 'Unknown';
};
