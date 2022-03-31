<template>
    <Modal @close="closeDialog">
        <template #title>
            <div>Add new contact</div>
        </template>

        <template #content>
            <div>
                <div class="pb-2 block text-sm font-medium text-gray-700">Name</div>
                <input
                    v-model="contactName"
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    name="name"
                    type="text"
                />
                <div class="pt-1 text-xs text-red-500">
                    <template v-if="contactNameError">
                        {{ contactNameError }}
                    </template>
                </div>
            </div>
            <div class="mt-4">
                <div class="pb-2 block text-sm font-medium text-gray-700">Address</div>
                <input
                    v-model="contactAddress"
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    name="name"
                    type="text"
                />
                <div class="pt-1 text-xs text-red-500">
                    <template v-if="contactAddressError">
                        {{ contactAddressError }}
                    </template>
                </div>
            </div>
        </template>

        <template #actions>
            <button
                type="button"
                class="mr-4 rounded-md bg-blue-100 py-2 px-4 text-sm font-medium text-blue-500 hover:bg-gray-50 focus:outline-none focus:ring-offset-2"
                @click="closeDialog"
            >
                {{ $t('dialog.wallet.changeName.cancel') }}
            </button>
            <button
                type="button"
                class="bg-button-colored inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white hover:bg-blue-200"
                @click="acceptDialog"
            >
                Add contact
            </button>
        </template>
    </Modal>
</template>

<script lang="ts" setup>
    import Modal from '@/components/Modal.vue';
    import { useRouter } from 'vue-router';
    import { ref } from 'vue';
    import { validateContactName, validateWalletAddress } from '@/util/validate';
    import { ChainTypes } from '@/enums/chains.enums';
    import { PkidContact } from '@/types/conctact.types';
    import { appKeyPair } from '@/service/cryptoService';
    import { getPkidClient } from '@/service/pkidService';

    const router = useRouter();

    const emit = defineEmits(['cancel', 'confirm']);

    const contactName = ref<string>('');
    const contactNameError = ref<string | null>(null);

    const contactAddress = ref<string>('');
    const contactAddressError = ref<string | null>(null);

    const closeDialog = () => {
        emit('cancel');
    };

    const acceptDialog = async () => {
        contactNameError.value = null;
        contactAddressError.value = null;

        const isValidContactName = validateContactName(contactName.value);
        if (isValidContactName != null) {
            return (contactNameError.value = isValidContactName);
        }

        const isValidWalletAddress = validateWalletAddress(contactAddress.value);

        if (!isValidWalletAddress.valid || isValidWalletAddress.type === ChainTypes.UNKNOWN) {
            contactAddressError.value = 'Invalid address';
            return;
        }

        const pkidClient = getPkidClient();
        const contacts = await pkidClient.getDoc(appKeyPair.value.publicKey, 'contacts');

        // He has available contacts
        if (contacts.success) {
            const existingContacts: PkidContact[] = contacts.data;
            const isContactExist = existingContacts.find(c => c.address === contactAddress.value);
            if (isContactExist) {
                contactAddressError.value = 'Contact address already exist';
                return;
            }
        }

        const contact: PkidContact = {
            name: contactName.value,
            address: contactAddress.value,
            type: isValidWalletAddress.type,
        };

        emit('confirm', contact);
    };
</script>
