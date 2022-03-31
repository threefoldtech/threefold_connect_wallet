import { Contact, MyContact } from '@/types/contact';
import { Wallet, wallets } from '@/service/walletService';
import { getPkidClient } from '@/service/pkidService';
import { appKeyPair } from '@/service/cryptoService';

export const isMyContact = (address: string): MyContact | undefined => {
    const myContacts: MyContact[] = wallets.value.map((wallet: Wallet) => {
        return {
            stellarAddress: wallet.keyPair.stellarKeyPair.publicKey(),
            substrateAddress: wallet.keyPair.getSubstrateKeyring().address,
            name: wallet.name,
        };
    });

    return myContacts.find(
        (contact: MyContact) => contact.stellarAddress === address || contact.substrateAddress === address
    );
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
        return 'maximum';
    }

    if (contactName.length <= 0) {
        return 'empty';
    }

    const regex = new RegExp('^[a-zA-Z0-9s]+$');

    const isValid = regex.test(contactName);

    if (!isValid) {
        return 'alphanumeric';
    }

    return null;
};
