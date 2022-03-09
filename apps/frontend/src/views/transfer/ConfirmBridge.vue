<template>
    <MainLayout>
        <template #header>
            <PageHeader>
                <template #before>
                    <ArrowLeftIcon @click="router.back()" />
                </template>
                <h1>Confirm transaction</h1>
            </PageHeader>
        </template>
        <div class="p-4">
            <div class="mt-4 break-words">
                <h1 class="font-bold">Confirm your transaction</h1>

                <div class="mt-4">
                    <div class="flex flex-row justify-between">
                        <p class="text-2xl">
                            {{ amount.toFixed(2) }}
                        </p>
                        <div>
                            <AssetIcon class="h-2" name="TFT" />
                        </div>
                    </div>
                    <div>Threefold Token (TFT)</div>

                    <p class="mt-10 text-sm font-semibold">Pay with</p>
                    <p class="mb-2 truncate text-gray-500">
                        {{ selectedWallet.keyPair.getStellarKeyPair().publicKey() }}
                    </p>
                    <hr />
                    <p class="mt-2 text-sm font-semibold">To</p>
                    <p class="mb-2 truncate text-gray-500">
                        {{ selectedWallet.keyPair.getSubstrateKeyring().address }}
                    </p>

                    <hr />
                    <p class="mt-2 text-sm font-semibold">Fee</p>
                    <!--              @TODO: make dynamic-->
                    <p class="truncate text-gray-500">1 TFT</p>
                </div>
            </div>

            <div class="mt-4 flex">
                <button class="flex-1 rounded-md bg-blue-600 px-4 py-2 text-white" @click="submitBridge">
                    Confirm
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
    import MainLayout from '@/layouts/MainLayout.vue';
    import ArrowLeftIcon from '@heroicons/vue/outline/ArrowLeftIcon';
    import PageHeader from '@/components/header/PageHeader.vue';
    import { useRoute, useRouter } from 'vue-router';
    import { Wallet, wallets } from '@/service/walletService';
    import { ref } from 'vue';
    import { activationServiceForSubstrate, getSubstrateApi } from '@/service/substrateService';
    import { userInitialized } from '@/service/cryptoService';
    import { createEntitySign, getEntity, getEntityIDByName } from '@/service/entityService';
    import { bridgeToSubstrate } from '@/service/stellarService';
    import { addNotification, NotificationType } from '@/service/notificationService';
    import { toNumber } from 'lodash';
    import { onBeforeMount } from '@vue/runtime-core';
    import AssetIcon from '@/components/AssetIcon.vue';

    const router = useRouter();
    const route = useRoute();

    const selectedWallet = ref<Wallet>();
    const amount = toNumber(route.params.amount);
    console.log(amount);
    const isLoadingTransaction = ref<boolean>(false);
    const loadingSubtitle = ref<string>('');

    onBeforeMount(() => {
        selectedWallet.value = wallets.value.find(w => w.keyPair.getBasePublicKey() === route.params.walletId);
    });

    const submitBridge = async () => {
        isLoadingTransaction.value = true;

        if (!selectedWallet.value) return;

        const substrateAddressTo = selectedWallet.value.keyPair.getSubstrateKeyring().address;
        const api = await getSubstrateApi();

        loadingSubtitle.value = 'Using activation service';
        console.info('Using activation service for substrate');
        await activationServiceForSubstrate(substrateAddressTo);

        const substrateKeyRing = selectedWallet.value.keyPair.getSubstrateKeyring();
        const name = userInitialized.value;

        if (!name) return;

        loadingSubtitle.value = 'Getting entity ID';
        console.info('Getting entityId for user ', name);
        let entityId = await getEntityIDByName(api, name);

        if (entityId == 0) {
            loadingSubtitle.value = 'Entity not found, creating one';
            console.info("Can't find entity, creating one");

            const country = 'Unknown';
            const city = 'Unknown';

            const signature = createEntitySign(substrateKeyRing, name, country, city);
            console.info('Signature: ', signature);

            const entity = await api.tx.tfgridModule.createEntity(substrateAddressTo, name, country, city, signature);
            const nonce = await api.rpc.system.accountNextIndex(substrateAddressTo);
            console.info('Created entity: ', entity.toHuman());
            console.info('Created nonce: ', nonce.toHuman);

            const signAndSendCallback = async (res: any) => {
                loadingSubtitle.value = 'Transacting the funds';
                console.info('Callback from signAndSend.');

                if (res instanceof Error) {
                    console.error('Error in signAndSendCallback');
                    return;
                }

                const { events = [], status } = res;
                console.info(`Current status is ${status.type}`);

                if (status.isFinalized) {
                    loadingSubtitle.value = 'Transaction done';
                    console.info(`Transaction included at blockHash ${status.asFinalized}`);

                    // @ts-ignore
                    events.forEach(({ phase, event: { data, method, section } }) => {
                        console.info(`\t' ${phase}: ${section}.${method}:: ${data}`);
                    });

                    entityId = await getEntityIDByName(api, name);
                    console.log('We found entityId: ', entityId);

                    const entity = await getEntity(api, entityId);
                }
            };

            await entity.signAndSend(substrateKeyRing, { nonce }, signAndSendCallback);
        }

        await bridgeToSubstrate(amount, selectedWallet.value.keyPair.getStellarKeyPair(), entityId);
        loadingSubtitle.value = 'Finishing up';
        isLoadingTransaction.value = false;

        addNotification(NotificationType.success, 'Successfully transferred tokens', '', 5000);
        console.log('Transaction done');

        await router.back();
    };
</script>

<style scoped></style>
