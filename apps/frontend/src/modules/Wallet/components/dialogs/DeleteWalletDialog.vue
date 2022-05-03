<template>
    <Modal @close="closeDialog">
        <template #title>
            <div>{{ $t('dialog.wallet.delete.title') }}</div>
        </template>

        <template #content>
            <div>
                {{ $t('dialog.wallet.delete.message', { name: walletName }) }}
            </div>
        </template>

        <template #actions>
            <button
                type="button"
                class="mr-4 rounded-md bg-blue-100 py-2 px-4 text-sm font-medium text-blue-500 hover:bg-gray-50 focus:outline-none focus:ring-offset-2"
                @click="closeDialog"
            >
                {{ $t('dialog.wallet.delete.cancel') }}
            </button>
            <button
                type="button"
                class="bg-button-colored inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white hover:bg-blue-200"
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
