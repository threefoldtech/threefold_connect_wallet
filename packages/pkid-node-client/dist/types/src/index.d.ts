import { KeyPair } from 'libsodium-wrappers';
export default class Pkid {
    private readonly nodeUrl;
    private readonly keyPair;
    constructor(nodeUrl: string, keyPair: KeyPair);
    getDoc<T>(signPk: Uint8Array, requestKey: string): Promise<{
        status: string;
        error: any;
        verified?: undefined;
        success?: undefined;
        data?: undefined;
        data_version?: undefined;
        decrypted?: undefined;
    } | {
        error: string;
        verified: boolean;
        status?: undefined;
        success?: undefined;
        data?: undefined;
        data_version?: undefined;
        decrypted?: undefined;
    } | {
        success: boolean;
        data: any;
        verified: boolean;
        data_version: any;
        status?: undefined;
        error?: undefined;
        decrypted?: undefined;
    } | {
        error: string;
        verified: boolean;
        decrypted: boolean;
        data_version: any;
        status?: undefined;
        success?: undefined;
        data?: undefined;
    } | {
        success: boolean;
        data: any;
        verified: boolean;
        decrypted: boolean;
        data_version: any;
        status?: undefined;
        error?: undefined;
    }>;
    setDoc<T>(requestKey: string, payload: T, willEncrypt?: boolean, publicKey?: Uint8Array): Promise<any>;
    getNamespace<T>(requestNamespace: string, namespacePubKey: Uint8Array): Promise<{
        status: string;
        error: any;
        verified?: undefined;
        success?: undefined;
        data?: undefined;
    } | {
        error: string;
        verified: boolean;
        status?: undefined;
        success?: undefined;
        data?: undefined;
    } | {
        success: boolean;
        verified: boolean;
        data: T;
        status?: undefined;
        error?: undefined;
    }>;
    setNamespace(requestNamespace: string, signedPayload: string): Promise<any>;
}
