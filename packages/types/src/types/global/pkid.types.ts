import flagsmith from 'flagsmith';
import Pkid from '@jimber/pkid';
import { PkidWalletTypes } from '../../enums/global/pkid.enums';
import { appKeyPair } from 'wallet-frontend/src/modules/Core/services/crypto.service';

export interface PkidWallet {
    name: string;
    position?: number;
    seed: string; //@TODO: should add seed instead of this
    type: PkidWalletTypes;
    isPublic: boolean;
    index?: number;
}

export type PkidClient = {
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
    getNamespace<T>(
        requestNamespace: string,
        namespacePubKey: Uint8Array
    ): Promise<{
        success: boolean;
        verified: boolean;
        data: T;
        status?: undefined;
        error?: undefined;
    }>;
    setNamespace(requestNamespace: string, signedPayload: string): Promise<any>;
};

let initializedPkidClient: PkidClient;
export const getPkidClient: () => PkidClient = () => {
    if (initializedPkidClient) return initializedPkidClient;

    const url = 'http://localhost:3001'; //flagsmith.getValue('pkid-url');
    console.log(Pkid);
    initializedPkidClient = new Pkid(url, appKeyPair.value);
    return initializedPkidClient;
};
