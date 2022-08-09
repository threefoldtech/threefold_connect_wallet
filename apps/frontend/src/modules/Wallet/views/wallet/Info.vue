<template>
    <div class="mt-2 px-4">
        <h2 class="font-bold text-black">{{ $t('wallet.info.addressesTitle') }}</h2>
    </div>
    <div class="mt-2 px-4">
        <CopyToClipboardField
            :labelText="$t('wallet.info.stellarAddress')"
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
            :labelText="$t('wallet.info.tfChainAddress')"
            :disabled="true"
            :fieldText="wallet?.keyPair.getSubstrateKeyring().address"
        >
            <template #icon>
                <ClipboardCopyIcon class="h-5 text-primary-600"></ClipboardCopyIcon>
            </template>
        </CopyToClipboardField>
    </div>

    <div class="mt-4 px-4">
        <h2 class="font-bold text-black">{{ $t('wallet.info.secretsTitle') }}</h2>
    </div>
    <div class="mt-2 px-4">
        <CopyToClipboardField
            :labelText="$t('wallet.info.stellarSecret')"
            :disabled="true"
            :fieldText="wallet?.keyPair.getStellarKeyPair().secret()"
            :isSensitiveData="true"
        >
            <template #icon>
                <ClipboardCopyIcon class="h-5 text-primary-600"></ClipboardCopyIcon>
            </template>
        </CopyToClipboardField>
    </div>

    <div class="mt-2 px-4">
        <CopyToClipboardField
            :labelText="$t('wallet.info.tfChainSecret')"
            :disabled="true"
            :fieldText="
                wallet?.keyPair.getSeed().split(' ').length === 12
                    ? wallet.keyPair.getSeed()
                    : `0x${wallet?.keyPair.getSeed()}`
            "
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
            :labelText="$t('wallet.info.walletName')"
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
        @confirm="changeWalletName"
    ></ChangeWalletNameDialog>

    <DeleteWalletDialog
        v-if="showDeleteWalletDialog"
        @close="showDeleteWalletDialog = false"
        @confirm="deleteWallet"
        :walletName="wallet.name"
    ></DeleteWalletDialog>
    <div v-show="canSeeDangerZone" class="px-4 pt-4 font-bold text-black">
        <span> Danger zone </span>
        <div v-show="canDeleteWallet" class="py-2">
            <div class="mt-2 w-full">
                <button
                    class="inline-flex items-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-gray-500 focus:disabled:ring-0"
                    type="button"
                    @click="showDeleteWalletDialog = true"
                >
                    <TrashIcon aria-hidden="true" class="-ml-1 mr-2 h-5 w-5" />
                    {{ $t('wallet.info.deleteButton') }}
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import {
        addOrUpdateWallet,
        deleteWalletFromPkid,
        saveWallets,
        Wallet,
    } from '@/modules/Wallet/services/walletService';
    import { computed, inject, ref } from 'vue';
    import { getSubstrateApi } from '@/modules/TFChain/services/tfchainService';
    import { ClipboardCopyIcon, PencilIcon, TrashIcon } from '@heroicons/vue/solid';
    import { addNotification, NotificationType } from '@/modules/Core/services/notificationService';
    import CopyToClipboardField from '@/modules/Misc/components/misc/CopyToClipboardField.vue';
    import EditTextField from '@/modules/Misc/components/misc/EditTextField.vue';
    import ChangeWalletNameDialog from '@/modules/Wallet/components/dialogs/ChangeWalletNameDialog.vue';
    import { validateWalletName } from '@/modules/Wallet/validate/wallet.validate';
    import DeleteWalletDialog from '@/modules/Wallet/components/dialogs/DeleteWalletDialog.vue';
    import { translate } from '@/modules/Core/utils/translate';
    import { useRouter } from 'vue-router';
    import flagsmith from 'flagsmith';

    const wallet: Wallet = <Wallet>inject('wallet');

    const canSeeDangerZone = flagsmith.hasFeature('can-see-danger-zone');
    const canDeleteWallet = flagsmith.hasFeature('can-delete-wallet');

    const showEditWalletName = ref<boolean>(false);
    const walletName = ref<string>(wallet?.name);

    const showDeleteWalletDialog = ref<boolean>(false);
    const newWalletName = ref<string>(wallet?.name);

    const test = computed(async () => {
        const api = await getSubstrateApi();
        return await api.query.system.account(wallet.keyPair.getSubstrateKeyring().publicKey);
    });

    const router = useRouter();

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
        addNotification(
            NotificationType.success,
            translate(`notification.successWalletName`, { name: wallet.name }),
            '',
            3000
        );
    };

    const deleteWallet = async () => {
        showDeleteWalletDialog.value = false;

        const success = await deleteWalletFromPkid(wallet.keyPair.seed);

        if (!success) {
            addNotification(NotificationType.error, 'Error while deleting wallet, please contact support');
            return;
        }

        addNotification(NotificationType.success, `Successfully deleted wallet ${wallet.name}`);
        await router.push({ name: 'walletList' });
    };
</script>

<style scoped></style>
