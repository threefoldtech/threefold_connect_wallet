import flagsmith from 'flagsmith';
import Pkid from '@jimber/pkid';
import { PkidClient } from '@/modules/Pkid/types/pkid.types';
import { appKeyPair } from '@/modules/Core/services/crypto.service';

let initializedPkidClient: PkidClient;
export const getPkidClient: () => PkidClient = () => {
    if (initializedPkidClient) return initializedPkidClient;

    const url = flagsmith.getValue('pkid-url');
    initializedPkidClient = new Pkid(url, appKeyPair.value);
    return initializedPkidClient;
};
