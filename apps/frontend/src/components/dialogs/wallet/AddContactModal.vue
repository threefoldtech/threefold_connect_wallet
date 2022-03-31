<template>
    <Modal @close="emit('cancel')">
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
                @click="emit('cancel')"
            >
                {{ $t('dialog.wallet.changeName.cancel') }}
            </button>
            <button
                type="button"
                class="bg-button-colored inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white hover:bg-blue-200"
                @click="validateInputData"
            >
                Add contact
            </button>
        </template>
    </Modal>
</template>

<script lang="ts" setup>
    import Modal from '@/components/Modal.vue';
    import { ref } from 'vue';
    import { validateWalletAddress } from '@/validate/wallet.validate';
    import { ChainTypes } from '@/enums/chains.enums';
    import { Contact } from '@/types/contact';
    import { isContactInPkid, isMyContact, validateContactName } from '@/validate/contact.validate';

    const emit = defineEmits(['cancel', 'confirm']);

    const contactName = ref<string>('');
    const contactNameError = ref<string | null>(null);

    const contactAddress = ref<string>('');
    const contactAddressError = ref<string | null>(null);

    const validateInputData = async () => {
        contactNameError.value = null;
        contactAddressError.value = null;

        // Check if valid name
        const isValidContactName = validateContactName(contactName.value);
        if (isValidContactName != null) {
            return (contactNameError.value = isValidContactName);
        }

        // Check if valid address
        const isValidWalletAddress = validateWalletAddress(contactAddress.value);
        if (!isValidWalletAddress.valid || isValidWalletAddress.type === ChainTypes.UNKNOWN) {
            contactAddressError.value = 'Invalid address';
            return;
        }

        // Check if address is one of my own wallets
        const doesExistInMyContacts = isMyContact(contactAddress.value);
        if (doesExistInMyContacts) {
            contactAddressError.value = 'This contact is available in own wallet';
            return;
        }

        // Check if address is already in PKID
        const doesExistInPkidContacts = await isContactInPkid(contactAddress.value);
        if (doesExistInPkidContacts) {
            contactAddressError.value = 'This contact already exist';
            return;
        }

        // Validation passed => create contact and send to parent
        const contact: Contact = {
            name: contactName.value,
            address: contactAddress.value,
            type: isValidWalletAddress.type,
        };

        emit('confirm', contact);
    };
</script>
