<template>
    <Modal @close="emit('cancel')">
        <template #title>
            <div>{{ $t('contacts.dialog.title') }}</div>
        </template>

        <template #content>
            <div>
                <div class="block pb-2 text-sm font-medium text-gray-700">{{ $t('contacts.dialog.name') }}</div>
                <input
                    v-model="contactName"
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    name="name"
                    type="text"
                />
                <div class="pt-1 text-xs text-red-500">
                    <template v-if="contactNameError">
                        {{ $t(contactNameError) }}
                    </template>
                </div>
            </div>
            <div class="mt-4">
                <div class="block pb-2 text-sm font-medium text-gray-700">{{ $t('contacts.dialog.address') }}</div>
                <input
                    v-model="contactAddress"
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    name="name"
                    type="text"
                />
                <div class="pt-1 text-xs text-red-500">
                    <template v-if="contactAddressError">
                        {{ $t(contactAddressError) }}
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
                {{ $t('contacts.dialog.save') }}
            </button>
        </template>
    </Modal>
</template>

<script lang="ts" setup>
    import Modal from '@/modules/Misc/components/Modal.vue';
    import { ref } from 'vue';
    import { validateWalletAddress } from '@/modules/Wallet/validate/wallet.validate';
    import { IContactFormValidation, IContactType } from '@/modules/Contact/interfaces/contact.interface';
    import { validateContact } from '@/modules/Contact/validate/contact.validate';

    const emit = defineEmits(['cancel', 'confirm']);

    const contactName = ref<string>('');
    const contactNameError = ref<string | undefined>(undefined);

    const contactAddress = ref<string>('');
    const contactAddressError = ref<string | undefined>(undefined);

    const validateInputData = async () => {
        contactNameError.value = undefined;
        contactAddressError.value = undefined;

        const contactValidation: IContactFormValidation = await validateContact(
            contactName.value,
            contactAddress.value
        );
        if (!contactValidation.valid) {
            return displayErrorMessage(contactValidation);
        }

        // Validation passed => create contact and send to parent
        const contact: IContactType = {
            name: contactName.value,
            address: contactAddress.value,
            type: validateWalletAddress(contactAddress.value).type,
        };

        emit('confirm', contact);
    };

    const displayErrorMessage = (contactValidation: IContactFormValidation) => {
        switch (contactValidation.field) {
            case 'name':
                contactNameError.value = contactValidation.error;
                break;
            case 'address':
                contactAddressError.value = contactValidation.error;
                break;
        }
    };
</script>
