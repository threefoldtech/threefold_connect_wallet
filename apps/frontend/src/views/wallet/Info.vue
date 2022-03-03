`
<template>
    <div class="mt-2 px-4">
        <h2 class="font-bold text-black">Addresses</h2>
    </div>
    <div class="mt-2 px-4">
        <CopyToClipboardField
            :labelText="'Stellar Address'"
            :disabled="true"
            :fieldText="wallet?.keyPair.getStellarKeyPair().publicKey()"
        >
            <template #icon>
                <ClipboardCopyIcon class="h-5 text-primary-600"></ClipboardCopyIcon>
            </template>
        </CopyToClipboardField>
    </div>
    <div class="mt-2 px-4">
        <CopyToClipboardField
            :labelText="'Substrate Address'"
            :disabled="true"
            :fieldText="wallet?.keyPair.getSubstrateKeyring().address"
        >
            <template #icon>
                <ClipboardCopyIcon class="h-5 text-primary-600"></ClipboardCopyIcon>
            </template>
        </CopyToClipboardField>
    </div>

    <div class="mt-4 px-4">
        <h2 class="font-bold text-black">Secrets</h2>
    </div>
    <div class="mt-2 px-4">
        <CopyToClipboardField
            :labelText="'Stellar Secret'"
            :disabled="true"
            :fieldText="wallet?.keyPair.getSubstrateKeyring().address"
            :isSensitiveData="true"
        >
            <template #icon>
                <ClipboardCopyIcon class="h-5 text-primary-600"></ClipboardCopyIcon>
            </template>
        </CopyToClipboardField>
    </div>

    <div class="mt-2 px-4">
        <CopyToClipboardField
            :labelText="'Entropy in HEX'"
            :disabled="true"
            :fieldText="wallet?.keyPair.getSeed()"
            :isSensitiveData="true"
        >
            <template #icon>
                <ClipboardCopyIcon class="h-5 text-primary-600"></ClipboardCopyIcon>
            </template>
        </CopyToClipboardField>
    </div>

    <div class="mt-2 px-4">
        <EditTextField
            @clickOnField="showEditWalletName = true"
            :labelText="'Wallet name'"
            :disabled="true"
            :fieldText="wallet?.name"
            v-model:fieldText="walletName"
        >
            <template #icon>
                <PencilIcon class="h-5 text-primary-600"></PencilIcon>
            </template>
        </EditTextField>
    </div>

    <ChangeWalletNameDialog
        v-model:newWalletName="newWalletName"
        v-if="showEditWalletName"
        :walletName="wallet?.name"
        @close="showEditWalletName = false"
        @confirmed="changeWalletName"
    ></ChangeWalletNameDialog>

    <div class="break-words p-2">
        <div class="mt-2 flex">
            <button
                v-if="!showDeleteWalletConfirmation"
                :disabled="wallet.meta.type === PkidWalletTypes.Native"
                class="inline-flex items-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-gray-500 focus:disabled:ring-0"
                type="button"
                @click="showDeleteWalletConfirmation = true"
            >
                <TrashIcon aria-hidden="true" class="-ml-1 mr-2 h-5 w-5" />
                Delete
            </button>
            <button
                v-if="showDeleteWalletConfirmation"
                class="inline-flex items-center rounded-md border border-transparent bg-red-800 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2"
                type="button"
                @click="deleteWallet"
            >
                I agree to delete my wallet
            </button>
            <button
                v-if="showDeleteWalletConfirmation"
                class="inline-flex flex-1 items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2"
                type="button"
                @click="showDeleteWalletConfirmation = false"
            >
                Cancel
            </button>
        </div>

        <div class="mt-2">
            <button class="rounded-md bg-blue-200 px-4 py-2" @click="testSend">test</button>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { addOrUpdateWallet, saveWallets, Wallet } from '@/service/walletService';
    import { computed, inject, ref, watch } from 'vue';
    import { getSubstrateApi } from '@/service/substrateService';
    import { TrashIcon, PencilIcon, ClipboardCopyIcon, XIcon } from '@heroicons/vue/solid';
    import { PkidWalletTypes } from '@/service/initializationService';
    import { addNotification, NotificationType } from '@/service/notificationService';
    import { sendTokens } from '@/service/substrateService';
    import CopyToClipboardField from '@/components/misc/CopyToClipboardField.vue';
    import EditTextField from '@/components/misc/EditTextField.vue';
    import ChangeWalletNameDialog from '@/components/dialogs/wallet/ChangeWalletNameDialog.vue';
    import { validateWalletName } from '@/util/validate';

    const showDeleteWalletConfirmation = ref(false);
    const wallet: Wallet = <Wallet>inject('wallet');

    const showEditWalletName = ref<boolean>(false);
    const walletName = ref<string>(wallet?.name);

    const newWalletName = ref<string>(wallet?.name);

    const test = computed(async () => {
        const api = await getSubstrateApi();
        return await api.query.system.account(wallet.keyPair.getSubstrateKeyring().publicKey);
    });

    const data = ref();

    const init = async () => {
        const api = await getSubstrateApi();
        data.value = await api.query.system.account(wallet.keyPair.getSubstrateKeyring().publicKey);
    };
    init();

    const changeWalletName = (newWalletName: string) => {
        const trimmedName: string = newWalletName.trim();
        const hasError = validateWalletName(trimmedName, wallet?.name);

        if (hasError) {
            return;
        }

        wallet.name = `${trimmedName}`;
        addOrUpdateWallet(wallet);
        saveWallets();

        showEditWalletName.value = false;
        addNotification(NotificationType.success, `Successfully changed wallet name into ${wallet.name}`, '', 3000);
    };

    const deleteWallet = () => {
        addNotification(NotificationType.error, 'not implemented yet', undefined, 2000);
    };

    const testSend = () => {
        console.log(wallet);
        sendTokens(wallet.keyPair.getSubstrateKeyring(), '5DiwPcPzCmj3i4TFFUtXfb4wUk8h5YapMuz6qnqzDL914EbL');
    };
</script>

<style scoped></style>
