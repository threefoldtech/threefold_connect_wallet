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
                        v-for="(wallet, index) of userWallets"
                        class="flex justify-between items-center my-1"
                        :key="`${wallet.name}_${index}`"
                    >
                        <span class="truncate font-bold text-lg">{{ wallet.name }}</span>
                        <button
                            @click="changeWalletType(index)"
                            type="button"
                            class="bg-button-colored inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-offset-2 hover:bg-blue-400"
                        >
                            {{
                                wallet.meta.isPublic
                                    ? $t('dialog.wallet.namespace.makePrivate')
                                    : $t('dialog.wallet.namespace.makePublic')
                            }}
                        </button>
                    </li>
                </ul>
                <p class="text-xs mt-8">{{ $t('dialog.wallet.namespace.information') }}</p>
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
                class="bg-button-colored inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white hover:bg-blue-400"
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
    import { IWallet } from 'shared-types';
    import { cloneDeep } from 'lodash';
    import { saveNamespaceWalletsToPkid, saveWalletsToPkid } from '@/modules/Pkid/services/pkid.service';
    import { addNotification } from '@/modules/Core/services/notification.service';
    import { NotificationType } from 'shared-types/src/enums/global/notification.enums';

    const emit = defineEmits(['close', 'confirm']);

    const userWallets = ref<IWallet[]>(cloneDeep(wallets.value));

    const changeWalletType = index =>
        (userWallets.value[index].meta.isPublic = !userWallets.value[index].meta.isPublic);

    const closeDialog = () => {
        emit('close');
    };

    const acceptDialog = async () => {
        wallets.value = cloneDeep(userWallets.value);
        try {
            await saveWalletsToPkid();
            await saveNamespaceWalletsToPkid();
        } catch (e) {
            addNotification(NotificationType.error, 'Error while changing wallets visibility, please contact support');
            return;
        }
        emit('close');
    };
</script>
