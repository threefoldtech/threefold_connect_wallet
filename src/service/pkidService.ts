import flagsmith from 'flagsmith';
// @ts-ignore
import Pkid from '@jimber/pkid';
import { appKeyPair, appSeed } from '@/service/cryptoService';

type PkidClient = {
    getDoc: (
        signPk: Uint8Array,
        key: string
    ) => Promise<{
        status: String;
        error?: String;
        success?: any;
        data: any;
        verified?: boolean;
        decrypted?: boolean;
        data_version?: number;
    }>;
    setDoc: (key: string, payload: any, willEncrypt: boolean, publicKey?: Uint8Array) => Promise<any>;
};

let initializedPkidClient: PkidClient;
export const getPkidClient: () => PkidClient = () => {
    if (initializedPkidClient) return initializedPkidClient;

    const url = flagsmith.getValue('pkid-url');
    initializedPkidClient = new Pkid(url, appKeyPair.value);
    return initializedPkidClient;
};
