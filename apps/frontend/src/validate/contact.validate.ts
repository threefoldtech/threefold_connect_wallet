import { Contact } from '@/types/contact.types';
import { Wallet, wallets } from '@/service/walletService';
import { getPkidClient } from '@/service/pkidService';
import { appKeyPair } from '@/service/cryptoService';
import { ChainTypes } from '@/enums/chains.enums';
import { translate } from '@/util/translate';

export const isMyContact = (address: string, chain: string): Contact | undefined => {
    const myContacts: Contact[] = wallets.value.map((wallet: Wallet) => {
        return {
            address:
                chain === ChainTypes.STELLAR
                    ? wallet.keyPair.stellarKeyPair.publicKey()
                    : wallet.keyPair.getSubstrateKeyring().address,
            type: chain,
            name: wallet.name,
        };
    });

    return myContacts.find((contact: Contact) => contact.address === address);
};

export const isContactInPkid = async (address: string): Promise<Contact | undefined> => {
    const pkidClient = getPkidClient();

    const contacts = await pkidClient.getDoc(appKeyPair.value.publicKey, 'contacts');

    if (contacts.success) {
        const existingContacts: Contact[] = contacts.data;
        return existingContacts.find(c => c.address === address);
    }

    return undefined;
};

export const validateContactName = (contactName: string): string | null => {
    if (contactName.length >= 255) {
        return translate('contact.dialog.error.maximum');
    }

    if (contactName.length <= 0) {
        return translate('contact.dialog.error.empty');
    }

    const regex = new RegExp('^[a-zA-Z0-9s]+$');

    const isValid = regex.test(contactName);

    if (!isValid) {
        return translate('contact.dialog.error.alphanumeric');
    }

    return null;
};
