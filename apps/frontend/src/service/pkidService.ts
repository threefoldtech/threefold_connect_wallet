import flagsmith from 'flagsmith';
// @ts-ignore
import Pkid from '@jimber/pkid';
import { appKeyPair } from '@/service/cryptoService';
import { PkidWalletTypes } from '@/service/initializationService';
import { PkidContact } from '@/types/conctact.types';

export interface PkidWallet {
    name: string;
    position?: number;
    seed: string; //@TODO: should add seed instead of this
    type: PkidWalletTypes;
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
};

let initializedPkidClient: PkidClient;
export const getPkidClient: () => PkidClient = () => {
    if (initializedPkidClient) return initializedPkidClient;

    const url = flagsmith.getValue('pkid-url');
    initializedPkidClient = new Pkid(url, appKeyPair.value);
    return initializedPkidClient;
};

export const savePkidContact = async (contact: PkidContact) => {
    const pkidClient = getPkidClient();
    const pkidContacts = await pkidClient.getDoc(appKeyPair.value.publicKey, 'contacts');

    let existingContacts = [];

    if (pkidContacts?.success) {
        existingContacts = pkidContacts.data;
    }

    existingContacts.push(contact);

    await pkidClient.setDoc('contacts', existingContacts, true);
};
