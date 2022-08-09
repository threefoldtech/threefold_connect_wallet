<template>
    <Modal @close="closeDialog">
        <template #title>
            <div class="text-red-600">{{ $t('dialog.wallet.delete.title') }}</div>
        </template>

        <template #content>
            <div>
                {{ $t('dialog.wallet.delete.message', { name: walletName }) }}
            </div>

            <div
                class="mt-4 mb-4 flex items-start rounded-lg bg-red-100 p-4 text-sm text-red-700 dark:bg-red-200 dark:text-red-800"
                role="alert"
            >
                <div><span class="font-medium">Warning:</span> {{ $t('dialog.wallet.delete.subMessage') }}</div>
            </div>
        </template>

        <template #actions>
            <button
                type="button"
                class="mr-4 rounded-md py-2 px-4 text-sm font-medium text-red-600 hover:bg-gray-50 focus:outline-none focus:ring-offset-2"
                @click="closeDialog"
            >
                {{ $t('dialog.wallet.delete.cancel') }}
            </button>
            <button
                type="button"
                class="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-200"
                @click="acceptDialog"
            >
                {{ $t('dialog.wallet.delete.confirm') }}
            </button>
        </template>
    </Modal>
</template>

<script lang="ts" setup>
    import Modal from '@/modules/Misc/components/Modal.vue';

    const emit = defineEmits(['close', 'confirm']);

    interface IProps {
        walletName: string;
    }

    const { walletName } = defineProps<IProps>();

    const closeDialog = () => {
        emit('close');
    };

    const acceptDialog = () => {
        emit('confirm');
    };
</script>
