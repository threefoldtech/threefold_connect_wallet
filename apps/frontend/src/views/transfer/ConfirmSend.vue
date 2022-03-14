<template>
    <MainLayout>
        <template #header>
            <PageHeader>
                <template #before>
                    <ArrowLeftIcon @click="router.back()" />
                </template>
                <h1>ConfirmSend</h1>
            </PageHeader>
        </template>

        <div class="p-4">
            <h1 class="font-bold">Confirm your transaction</h1>
            <div v-if="chainName === ChainTypes.SUBSTRATE">
                <div class="mt-4">
                    <div class="flex flex-row justify-between">
                        <p class="text-2xl">
                            {{ amount.toFixed(2) }}
                        </p>
                        <div>
                            <AssetIcon name="TFT" />
                        </div>
                    </div>
                    <div>Threefold Token (TFT)</div>

                    <p class="mt-10 text-sm font-semibold">Pay with</p>
                    <p class="mb-2 truncate text-gray-500">
                        {{ fromWallet?.keyPair.getSubstrateKeyring().address }}
                    </p>
                    <hr />
                    <p class="mt-2 text-sm font-semibold">To</p>
                    <p class="mb-2 truncate text-gray-500">
                        {{ toAddress }}
                    </p>

                    <hr />
                    <p class="mt-2 text-sm font-semibold">Fee</p>
                    <p class="truncate text-gray-500">{{ fee }} {{ asset }}</p>
                </div>
            </div>

            <div v-else-if="chainName === ChainTypes.STELLAR">
                <div class="mt-4">
                    <div class="flex flex-row justify-between">
                        <p class="text-2xl">
                            {{ amount.toFixed(2) }}
                        </p>
                        <div>
                            <AssetIcon name="TFT" />
                        </div>
                    </div>
                    <div>Threefold Token (TFT)</div>

                    <p class="mt-10 text-sm font-semibold">Pay with</p>
                    <p class="mb-2 truncate text-gray-500">
                        {{ fromWallet?.keyPair.getStellarKeyPair().publicKey() }}
                    </p>
                    <hr />
                    <p class="mt-2 text-sm font-semibold">To</p>
                    <p class="mb-2 truncate text-gray-500">
                        {{ toAddress }}
                    </p>

                    <hr />
                    <hr />
                    <p class="mt-2 text-sm font-semibold">Message</p>
                    <p class="mb-2 truncate text-gray-500">
                        {{ transactionMessage }}
                    </p>

                    <hr />
                    <p class="mt-2 text-sm font-semibold">Fee</p>
                    <p class="truncate text-gray-500">{{ fee }} {{ asset }}</p>
                </div>
            </div>

            <div v-else>Chain not found</div>

            <div class="mt-4 flex">
                <button class="flex-1 rounded-md bg-blue-600 px-4 py-2 text-white" @click="sendTransaction">
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
    import flagsmith from 'flagsmith';
    import { wallets } from '@/service/walletService';
    import { ChainTypes } from '@/enums/chains.enums';
    import { buildFundedPaymentTransaction, submitFundedTransaction } from '@jimber/stellar-crypto';
    import AssetIcon from '@/components/AssetIcon.vue';
    import { sendSubstrateTokens } from '@/service/substrateService';
    import { addNotification, NotificationType } from '@/service/notificationService';
    import { ref } from 'vue';

    const router = useRouter();
    const allowedAssets: string[] = JSON.parse(<string>flagsmith.getValue('currencies')).map((a: any) => a.asset_code);

    const route = useRoute();

    const isLoadingTransaction = ref<boolean>(false);
    const loadingSubtitle = ref<string>('');

    const fromWallet = wallets.value?.find(w => w.keyPair.getStellarKeyPair().publicKey() === route.params.from);
    const toAddress = <string>route.params.to;
    const amount = Number(route.params.amount);
    const asset = <string>route.params.asset;
    const fee = Number(<string>flagsmith.getValue('fee-amount'));
    const chainName = route.params.chainName;
    const transactionMessage = <string>route.params.message;

    const sendStellarTokens = async () => {
        if (!fromWallet || !toAddress || !amount || !asset) return router.push({ name: 'error' });

        isLoadingTransaction.value = true;
        loadingSubtitle.value = 'Sending tokens';

        try {
            const fundedTransaction = await buildFundedPaymentTransaction(
                fromWallet.keyPair.getStellarKeyPair(),
                toAddress,
                amount,
                transactionMessage,
                asset
            );

            await submitFundedTransaction(fundedTransaction, fromWallet.keyPair.getStellarKeyPair());
            await router.push({ name: 'walletList' });
        } catch (e) {
            await router.back();
            addNotification(NotificationType.error, 'Failed to transfer tokens');
        }
    };

    const sendSubstrate = async () => {
        if (!fromWallet) {
            return;
        }

        isLoadingTransaction.value = true;
        loadingSubtitle.value = 'Sending tokens';

        try {
            await sendSubstrateTokens(fromWallet.keyPair.getSubstrateKeyring(), toAddress, amount);
            await router.push({ name: 'walletList' });
            addNotification(NotificationType.success, 'Successfully transferred tokens');
        } catch (e) {
            await router.back();
            addNotification(NotificationType.error, 'Failed to transfer tokens');
        }
    };

    const sendTransaction = async () => {
        if (chainName === ChainTypes.STELLAR) {
            await sendStellarTokens();
        }
        if (chainName === ChainTypes.SUBSTRATE) {
            await sendSubstrate();
        }
    };
</script>

<style scoped></style>
