import { getPkidClient } from '@/modules/Pkid/services/pkid.service';
import { appKeyPair } from '@/modules/Core/services/crypto.service';
import { IContactType } from '@/modules/Contact/interfaces/contact.interface';
import { PkidNamedKeys } from '@/modules/Pkid/enums/pkid.enums';

export const getContactsFromPkid = async (): Promise<IContactType[]> => {
    const pkidClient = getPkidClient();

    const contacts = await pkidClient.getDoc(appKeyPair.value.publicKey, PkidNamedKeys.V3_CONTACTS);
    if (!contacts.success) {
        return [];
    }

    return contacts.data;
};

export const saveContactToPkid = async (contact: IContactType) => {
    const pkidClient = getPkidClient();
    const pkidContacts = await pkidClient.getDoc(appKeyPair.value.publicKey, PkidNamedKeys.V3_CONTACTS);

    let existingContacts: IContactType[] = [];

    if (pkidContacts?.success) {
        existingContacts = pkidContacts.data;
    }

    existingContacts.push(contact);

    await pkidClient.setDoc(PkidNamedKeys.V3_CONTACTS, existingContacts, true);
};
