import { ContactType, ContactFormValidation, ContactValidation } from '@/types/contact.types';
import { Wallet, wallets } from '@/service/walletService';
import { getPkidClient } from '@/service/pkidService';
import { appKeyPair } from '@/service/cryptoService';
import { ChainTypes } from '@/enums/chains.enums';
import { validateWalletAddress } from '@/validate/wallet.validate';

export const isContactInMyContacts = (address: string, chain: string): boolean => {
    const myContacts: ContactType[] = wallets.value.map((wallet: Wallet) => {
        return {
            address:
                chain === ChainTypes.STELLAR
                    ? wallet.keyPair.stellarKeyPair.publicKey()
                    : wallet.keyPair.getSubstrateKeyring().address,
            type: chain,
            name: wallet.name,
        };
    });

    const c = myContacts.find((contact: ContactType) => contact.address === address);
    return !!c;
};

export const isContactInPkid = async (address: string): Promise<boolean> => {
    const pkidClient = getPkidClient();
    const contacts = await pkidClient.getDoc(appKeyPair.value.publicKey, 'contacts');

    if (!contacts.success) {
        return false;
    }

    const existingContacts: ContactType[] = contacts.data;
    const c = existingContacts.find(c => c.address === address);
    return !!c;
};

export const validateContact = async (name: string, address: string): Promise<ContactFormValidation> => {
    // Check if valid name
    const isValidContactName: ContactValidation = validateContactName(name);
    if (!isValidContactName.valid) {
        return {
            valid: false,
            error: isValidContactName.error,
            field: 'name',
        };
    }

    // Check if valid address
    const isValidContactAddress: ContactValidation = await validateNewContactAddress(address);
    if (!isValidContactAddress.valid) {
        return {
            valid: false,
            error: isValidContactAddress.error,
            field: 'address',
        };
    }

    return {
        valid: true,
    };
};

export const validateContactName = (contactName: string): ContactValidation => {
    if (contactName.length >= 255) {
        return {
            valid: false,
            error: 'contacts.dialog.error.maximum',
        };
    }

    if (contactName.length <= 0) {
        return {
            valid: false,
            error: 'contacts.dialog.error.empty',
        };
    }

    const regex = new RegExp('^[a-zA-Z0-9s]+$');
    const isValid = regex.test(contactName);

    if (!isValid) {
        return {
            valid: false,
            error: 'contacts.dialog.error.alphanumeric',
        };
    }

    return {
        valid: true,
    };
};

export const validateNewContactAddress = async (address: string): Promise<ContactValidation> => {
    // Check if valid address
    const isValidWalletAddress = validateWalletAddress(address);
    if (!isValidWalletAddress.valid || isValidWalletAddress.type === ChainTypes.UNKNOWN) {
        return {
            valid: false,
            error: 'contacts.dialog.error.invalid',
        };
    }

    // Check if address is one of my own wallets
    const doesExistInMyContacts = isContactInMyContacts(address, isValidWalletAddress.type);
    if (doesExistInMyContacts) {
        return {
            valid: false,
            error: 'contacts.dialog.error.myContactExists',
        };
    }

    // Check if address is already in PKID
    const doesExistInPkidContacts = await isContactInPkid(address);
    if (doesExistInPkidContacts) {
        return {
            valid: false,
            error: 'contacts.dialog.error.contactExists',
        };
    }

    return {
        valid: true,
    };
};