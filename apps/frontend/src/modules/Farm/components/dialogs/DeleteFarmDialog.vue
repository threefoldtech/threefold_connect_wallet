<template>
    <Modal @close="closeDialog">
        <template #title>
            <div class="text-red-600">Delete farm?</div>
        </template>

        <template #content>
            <div>
                {{ $t('dialog.wallet.delete.message', { name: farmName }) }}
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
        farmName: string;
    }

    const { farmName } = defineProps<IProps>();

    const closeDialog = () => {
        emit('close');
    };

    const acceptDialog = () => {
        emit('confirm');
    };
</script>
