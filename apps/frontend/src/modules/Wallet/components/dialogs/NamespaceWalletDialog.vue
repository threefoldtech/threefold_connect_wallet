<template>
    <Modal @close="closeDialog">
        <template #title>
            <div>{{ $t('dialog.wallet.namespace.title') }}</div>
        </template>

        <template #content>
            <div class="pb-2">
                <h2 class="text-sm mb-2">{{ $t('dialog.wallet.namespace.message') }}</h2>
                <ul class="max-h-60 overflow-y-auto">
                    <li
                        v-for="(wallet, index) of [...ws, ...ws, ...ws, ...ws, ...ws]"
                        class="flex justify-between my-1"
                        :key="`${wallet.name}_${index}`"
                    >
                        <span class="truncate">{{ wallet.name }}</span>
                        <button
                            type="button"
                            class="bg-button-colored inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white hover:bg-blue-200"
                        >
                            {{
                                wallet.meta.isPublic
                                    ? $t('dialog.wallet.namespace.makePrivate')
                                    : $t('dialog.wallet.namespace.makePublic')
                            }}
                        </button>
                    </li>
                </ul>
            </div>
        </template>

        <template #actions>
            <button
                type="button"
                class="mr-4 rounded-md bg-blue-100 py-2 px-4 text-sm font-medium text-blue-500 hover:bg-gray-50 focus:outline-none focus:ring-offset-2"
                @click="closeDialog"
            >
                {{ $t('dialog.wallet.namespace.cancel') }}
            </button>
            <button
                type="button"
                class="inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white hover:bg-blue-200"
                @click="acceptDialog"
            >
                {{ $t('dialog.wallet.namespace.confirm') }}
            </button>
        </template>
    </Modal>
</template>

<script lang="ts" setup>
    import Modal from '@/modules/Misc/components/Modal.vue';
    import { ref } from 'vue';
    import { wallets } from '@/modules/Wallet/services/wallet.service';
    import { IWallet } from 'shared-types/src/interfaces/global/wallet.interfaces';

    const emit = defineEmits(['close', 'confirm']);

    const ws = ref<IWallet[]>(wallets.value);

    const closeDialog = () => {
        emit('close');
    };

    const acceptDialog = () => {
        emit('confirm');
    };
</script>
