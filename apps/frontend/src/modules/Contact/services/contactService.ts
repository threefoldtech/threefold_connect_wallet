import { getPkidClient } from '@/modules/Core/services/pkidService';
import { appKeyPair } from '@/modules/Core/services/crypto.service';
import { ContactType } from '@/modules/Contact/types/contact.types';
import { PkidNamedKeys } from '@/modules/Pkid/enums/pkid.enums';

export const getContactsFromPkid = async (): Promise<ContactType[]> => {
    const pkidClient = getPkidClient();

    const contacts = await pkidClient.getDoc(appKeyPair.value.publicKey, PkidNamedKeys.V3_CONTACTS);
    if (!contacts.success) {
        return [];
    }

    return contacts.data;
};

export const saveContactToPkid = async (contact: ContactType) => {
    const pkidClient = getPkidClient();
    const pkidContacts = await pkidClient.getDoc(appKeyPair.value.publicKey, PkidNamedKeys.V3_CONTACTS);

    let existingContacts: ContactType[] = [];

    if (pkidContacts?.success) {
        existingContacts = pkidContacts.data;
    }

    existingContacts.push(contact); // @TODO: make this a list unique contacts (combined key)

    await pkidClient.setDoc(PkidNamedKeys.V3_CONTACTS, existingContacts, true);
};
