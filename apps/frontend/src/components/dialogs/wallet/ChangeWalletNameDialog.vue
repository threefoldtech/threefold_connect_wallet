<template>
    <Modal @close="closeDialog">
        <template #title>
            <div>Delete wallet?</div>
        </template>

        <template #content>
            <div class="pb-2">Please enter the new desired name</div>
            <input
                v-model="newWalletName"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                name="name"
                type="text"
            />
            <div class="pt-1 text-xs text-red-500">
                {{ walletNameError }}
            </div>
        </template>

        <template #actions>
            <button
                type="button"
                class="mr-4 rounded-md bg-blue-100 py-2 px-4 text-sm font-medium text-blue-500 hover:bg-gray-50 focus:outline-none focus:ring-offset-2"
                @click="closeDialog"
            >
                Cancel
            </button>
            <button
                :disabled="walletNameError != null"
                :class="walletNameError ? 'bg-gray-200' : 'bg-button-colored'"
                type="button"
                class="inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white hover:bg-blue-200"
                @click="acceptDialog"
            >
                Change
            </button>
        </template>
    </Modal>
</template>

<script lang="ts" setup>
    import Modal from '@/components/Modal.vue';
    import { ref, watch } from 'vue';
    import { validateWalletName } from '@/util/validate';

    const emit = defineEmits(['close', 'confirm', 'update:newWalletName']);

    interface IProps {
        walletName: string;
    }

    const { walletName } = defineProps<IProps>();

    const walletNameError = ref<string | null>(null);
    const newWalletName = ref<string>(walletName);

    watch(newWalletName, newValue => {
        walletNameError.value = validateWalletName(newValue, walletName);
    });

    const closeDialog = () => {
        emit('close');
    };

    const acceptDialog = () => {
        emit('confirm', newWalletName.value);
    };
</script>
