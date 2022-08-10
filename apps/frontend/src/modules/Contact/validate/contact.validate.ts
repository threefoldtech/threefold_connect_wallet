import {
    IContactFormValidation,
    IContactType,
    IContactValidation,
} from '@/modules/Contact/interfaces/contact.interface';
import { Wallet, wallets } from '@/modules/Wallet/services/walletService';
import { getPkidClient } from '@/modules/Pkid/services/pkid.service';
import { appKeyPair } from '@/modules/Core/services/crypto.service';
import { ChainTypes } from '@/modules/Currency/enums/chains.enums';
import { validateWalletAddress } from '@/modules/Wallet/validate/wallet.validate';
import { PkidNamedKeys } from '@/modules/Pkid/enums/pkid.enums';

export const isContactInMyContacts = (address: string, chain: string): boolean => {
    const myContacts: IContactType[] = wallets.value.map((wallet: Wallet) => {
        return {
            address:
                chain === ChainTypes.STELLAR
                    ? wallet.keyPair.stellarKeyPair.publicKey()
                    : wallet.keyPair.getSubstrateKeyring().address,
            type: chain,
            name: wallet.name,
        };
    });

    const c = myContacts.find((contact: IContactType) => contact.address === address);
    return !!c;
};

export const isContactInPkid = async (address: string): Promise<boolean> => {
    const pkidClient = getPkidClient();
    const contacts = await pkidClient.getDoc(appKeyPair.value.publicKey, PkidNamedKeys.V3_CONTACTS);

    if (!contacts.success) {
        return false;
    }

    const existingContacts: IContactType[] = contacts.data;
    const c = existingContacts.find(c => c.address === address);
    return !!c;
};

export const validateContact = async (name: string, address: string): Promise<IContactFormValidation> => {
    // Check if valid name
    const isValidContactName: IContactValidation = validateContactName(name);
    if (!isValidContactName.valid) {
        return {
            valid: false,
            error: isValidContactName.error,
            field: 'name',
        };
    }

    // Check if valid address
    const isValidContactAddress: IContactValidation = await validateNewContactAddress(address);
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

export const validateContactName = (contactName: string): IContactValidation => {
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

export const validateNewContactAddress = async (address: string): Promise<IContactValidation> => {
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
