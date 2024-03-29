<template>
    <MainLayout>
        <template #header>
            <PageHeader>
                <template #before>
                    <ArrowLeftIcon @click="router.back()" />
                </template>
                <h1>{{ $t('transfer.confirmBridge.title') }}</h1>
            </PageHeader>
        </template>
        <div class="p-4">
            <div class="mt-4 break-words">
                <h1 class="font-bold">{{ $t('transfer.confirmBridge.message') }}</h1>

                <div class="mt-4">
                    <div class="flex flex-row justify-between">
                        <p class="text-2xl">
                            {{ amount.toFixed(2) }}
                        </p>
                        <div>
                            <AssetIcon class="h-2" name="TFT" />
                        </div>
                    </div>
                    <div>{{ $t('currency.long.TFT') }} ({{ $t('currency.short.TFT') }})</div>

                    <p class="mt-10 text-sm font-semibold">{{ $t('transfer.confirmBridge.payWith') }}</p>
                    <p class="mb-2 truncate text-gray-500">
                        {{ selectedWallet?.keyPair.getStellarKeyPair().publicKey() }}
                    </p>
                    <hr />
                    <p class="mt-2 text-sm font-semibold">{{ $t('transfer.confirmBridge.to') }}</p>
                    <p class="mb-2 truncate text-gray-500">
                        {{ selectedWallet?.keyPair.getSubstrateKeyring().address }}
                    </p>

                    <hr />
                    <p class="mt-2 text-sm font-semibold">{{ $t('transfer.confirmBridge.fee') }}</p>
                    <p class="truncate text-gray-500">{{ fee }} {{ $t('currency.short.TFT') }}</p>
                </div>
            </div>

            <div class="mt-4 flex">
                <button class="flex-1 rounded-md bg-blue-600 px-4 py-2 text-white" @click="bridgeTokens">
                    {{ $t('transfer.confirmBridge.confirm') }}
                </button>
            </div>
        </div>
    </MainLayout>

    <div class="" v-if="isLoadingTransaction">
        <div class="fixed inset-0 flex items-center justify-center"></div>
        <TransitionRoot appear :show="isLoadingTransaction" as="template">
            <Dialog as="div">
                <div class="fixed inset-0 z-10 overflow-y-auto">
                    <div class="min-h-screen px-4 text-center">
                        <TransitionChild
                            as="template"
                            enter="duration-300 ease-out"
                            enter-from="opacity-0"
                            enter-to="opacity-100"
                            leave="duration-200 ease-in"
                            leave-from="opacity-100"
                            leave-to="opacity-0"
                        >
                            <DialogOverlay class="fixed inset-0 bg-slate-500/40" />
                        </TransitionChild>

                        <span class="inline-block h-screen align-middle" aria-hidden="true"> &#8203; </span>

                        <TransitionChild
                            as="template"
                            enter="duration-300 ease-out"
                            enter-from="opacity-0 scale-95"
                            enter-to="opacity-100 scale-100"
                            leave="duration-200 ease-in"
                            leave-from="opacity-100 scale-100"
                            leave-to="opacity-0 scale-95"
                        >
                            <div
                                class="my-8 inline-block w-full max-w-md transform overflow-hidden rounded-md bg-white p-6 text-left align-middle shadow-xl transition-all"
                            >
                                <div class="flex w-full flex-col items-center justify-center">
                                    <div class="pb-4 text-center">{{ loadingSubtitle }} ...</div>
                                    <div>
                                        <svg
                                            class="h-6 animate-spin text-center text-primary-600"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <circle
                                                class="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                stroke-width="4"
                                            ></circle>
                                            <path
                                                class="opacity-75"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                fill="currentColor"
                                            ></path>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </TransitionRoot>
    </div>
</template>

<script lang="ts" setup>
    import { TransitionRoot, TransitionChild, DialogOverlay, Dialog } from '@headlessui/vue';
    import MainLayout from '@/modules/Misc/layouts/MainLayout.vue';
    import ArrowLeftIcon from '@heroicons/vue/outline/ArrowLeftIcon';
    import PageHeader from '@/modules/Misc/components/header/PageHeader.vue';
    import { useRoute, useRouter } from 'vue-router';
    import { Wallet, wallets } from '@/modules/Wallet/services/walletService';
    import { ref } from 'vue';
    import {
        activationServiceForSubstrate,
        getSubstrateApi,
        submitExtrensic,
    } from '@/modules/TFChain/services/tfchainService';
    import { userInitialized } from '@/modules/Core/services/cryptoService';
    import { createEntitySign, getEntity, getEntityIDByAccountId } from '@/modules/TFChain/services/entityService';
    import { addNotification, NotificationType } from '@/modules/Core/services/notificationService';
    import { toNumber } from 'lodash';
    import { onBeforeMount } from '@vue/runtime-core';
    import AssetIcon from '@/modules/Currency/components/AssetIcon.vue';
    import { translate } from '@/modules/Core/utils/translate';
    import en from '@/translates/en';
    import { nanoid } from 'nanoid';
    import { bridgeToSubstrate } from '@/modules/Bridge/services/bridgeService';

    const router = useRouter();
    const route = useRoute();

    const selectedWallet = ref<Wallet>();
    const amount = toNumber(route.params.amount);
    const fee = toNumber(route.params.fee);

    const isLoadingTransaction = ref<boolean>(false);
    const loadingSubtitle = ref<string>('');

    onBeforeMount(() => {
        selectedWallet.value = wallets.value.find(w => w.keyPair.getBasePublicKey() === route.params.walletId);
    });

    const bridgeTokens = async () => {
        isLoadingTransaction.value = true;

        try {
            await submitBridge();
        } catch (e) {
            isLoadingTransaction.value = false;
            addNotification(NotificationType.error, translate('transfer.confirmBridge.errorSendTokens'), '', 5000);
            console.error('Transaction failed');
            console.error(e);

            await router.back();
        }
    };

    const submitBridge = async () => {
        if (!selectedWallet.value) return;

        const substrateAddressTo = selectedWallet.value.keyPair.getSubstrateKeyring().address;
        const api = await getSubstrateApi();

        loadingSubtitle.value = translate('transfer.confirmBridge.usingActivationService');
        console.info('Using activation services for substrate');
        await activationServiceForSubstrate(substrateAddressTo);

        const substrateKeyRing = selectedWallet.value.keyPair.getSubstrateKeyring();
        const name = `${userInitialized.value}${nanoid()}`;

        if (!name) return;

        loadingSubtitle.value = translate('transfer.confirmBridge.gettingEntityId');
        console.info('Getting entityId for user ', name);
        let entityId = await getEntityIDByAccountId(api, substrateKeyRing.address);

        if (entityId == 0) {
            loadingSubtitle.value = translate('transfer.confirmBridge.entityIdNotFound');
            console.info("Can't find entity, creating one");

            const country = 'Unknown';
            const city = 'Unknown';

            const signature = createEntitySign(substrateKeyRing, name, country, city);

            const submittableExtrinsic = api.tx.tfgridModule.createEntity(
                substrateAddressTo,
                name,
                country,
                city,
                signature
            );
            const nonce = await api.rpc.system.accountNextIndex(substrateAddressTo);

            await submitExtrensic(submittableExtrinsic, substrateKeyRing, { nonce });

            let i = 0;
            while (entityId === 0) {
                if (i > 10) {
                    console.error('Entity not found after 10 tries');
                    addNotification(
                        NotificationType.error,
                        translate('transfer.confirmBridge.errorCreateEntity'),
                        '',
                        5000
                    );
                    throw new Error('Entity not found after 10 tries');
                }
                console.info('Entity not found, retrying...');
                entityId = await getEntityIDByAccountId(api, substrateKeyRing.address);
                await new Promise(resolve => setTimeout(resolve, 1000));
                i++;
            }
        }

        const entityIdToMakeTheBridge = await getEntityIDByAccountId(api, substrateKeyRing.address);

        if (entityIdToMakeTheBridge == 0) {
            addNotification(NotificationType.error, translate('transfer.confirmBridge.entityIdNotFound'), '', 5000);
            return;
        }

        await bridgeToSubstrate(amount, selectedWallet.value.keyPair.getStellarKeyPair(), entityIdToMakeTheBridge);
        loadingSubtitle.value = translate('transfer.confirmBridge.finishingUp');
        isLoadingTransaction.value = false;

        addNotification(NotificationType.success, translate('transfer.confirmBridge.success'), '', 5000);
        console.log('Transaction done');

        await router.back();
    };
</script>

<style scoped></style>
