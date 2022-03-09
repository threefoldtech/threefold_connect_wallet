<template>
    <MainLayout>
        <template #header>
            <PageHeader>
                <template #before>
                    <ArrowLeftIcon @click="router.back()" />
                </template>
                <h1>Transfer to TFChain</h1>
            </PageHeader>
        </template>
        <div class="flex h-full flex-col justify-between p-4 pb-8" v-if="!isLoading">
            <div>
                <div class="mb-2 border-2 border-gray-200 p-4">
                    <div class="text-2xl font-semibold">Stellar tokens</div>
                    <div class="text-lg text-gray-500">{{ stellarBalance }} TFT</div>
                </div>
                <div class="flex w-full items-center justify-center">
                    <ArrowDownIcon class="h-6 text-primary-500"></ArrowDownIcon>
                </div>
                <div class="mt-2 border-2 border-gray-200 p-4">
                    <div class="text-2xl font-semibold">TFChain tokens</div>
                    <div class="text-lg text-gray-500">{{ substrateBalance }} TFT</div>
                </div>
                <div class="mt-8">
                    <label class="block text-sm font-medium text-gray-700" for="amount">
                        <div class="pr-3">
                            <span class="pr-2">Amount</span>
                            <span class="text-xs text-gray-400" @click="amount = stellarBalance"
                                >( {{ stellarBalance }})</span
                            >
                        </div>
                    </label>
                    <div class="relative mt-1 rounded-md shadow-sm">
                        <input
                            id="amount"
                            v-model="amount"
                            :placeholder="stellarBalance === 0 ? 'No funds on this wallet' : '0.00'"
                            class="block w-full rounded-md border-gray-300 pl-4 pr-20 focus:border-primary-500 focus:ring-primary-500 disabled:border-gray-300 disabled:bg-gray-50 sm:text-sm"
                            name="amount"
                            type="number"
                        />
                    </div>

                    <div v-if="errorAmountText" class="text-xs text-red-500">
                        {{ errorAmountText }}
                    </div>
                </div>

                <div class="mt-4 flex space-x-4">
                    <button class="flex-1 rounded-md border border-gray-300 p-1" @click="setAmount(0.25)">25%</button>
                    <button class="flex-1 rounded-md border border-gray-300 p-1" @click="setAmount(0.5)">50%</button>
                    <button class="flex-1 rounded-md border border-gray-300 p-1" @click="setAmount(0.75)">75%</button>
                    <button class="flex-1 rounded-md border border-gray-300 p-1" @click="setAmount(1)">100%</button>
                </div>
            </div>

            <div>
                <button
                    @click="submitBridge"
                    class="bg-button-colored mt-4 w-full rounded-md py-2 px-4 text-lg font-semibold text-white"
                >
                    Transfer
                </button>
            </div>
        </div>
        <div v-else class="h-full w-full">
            <LoadingSpinner></LoadingSpinner>
        </div>

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
    </MainLayout>
</template>

<script lang="ts" setup>
    import { TransitionRoot, TransitionChild, DialogOverlay, Dialog, DialogTitle } from '@headlessui/vue';
    import { Wallet, wallets } from '@/service/walletService';
    import { useRoute, useRouter } from 'vue-router';
    import { computed, Ref, ref } from 'vue';
    import { activationServiceForSubstrate, getSubstrateApi } from '@/service/substrateService';
    import MainLayout from '@/layouts/MainLayout.vue';
    import PageHeader from '@/components/header/PageHeader.vue';
    import { ArrowLeftIcon, ArrowDownIcon } from '@heroicons/vue/solid';
    import LoadingSpinner from '@/components/global/LoadingSpinner.vue';
    import { AssetsTypes } from '@/enums/assets.enums';
    import { useDynamicBalance } from '@/util/useDynamicBalance';
    import { useAssets } from '@/util/useAssets';
    import flagsmith from 'flagsmith';
    import { userInitialized } from '@/service/cryptoService';
    import { createEntitySign, getEntity, getEntityIDByName } from '@/service/entityService';
    import { bridgeToSubstrate } from '@/service/stellarService';

    const selectedWallet = ref<Wallet>() as Ref<Wallet>;

    const isLoading = ref<boolean>(true);
    const isLoadingTransaction = ref<boolean>(false);
    const loadingSubtitle = ref<string>('');

    const router = useRouter();
    const route = useRoute();

    const fee = Number(flagsmith.getValue('fee-amount'));
    const amount = ref(0);

    const errorAmountText = ref<Object | null>(null);

    const isValidAmount = (amount: number) => {
        if (!stellarBalance.value || stellarBalance.value == 0)
            return (errorAmountText.value = 'No stellar balance available');

        if (stellarBalance.value < amount) return (errorAmountText.value = 'You do not have that many tokens');
        if (amount <= fee) return (errorAmountText.value = `Please enter an amount above ${fee} TFT`);

        return (errorAmountText.value = null);
    };

    const setAmount = (multiplier: number) => {
        const assetBalance = stellarBalance.value;

        if (!assetBalance) {
            return;
        }

        const availableBalanceWithoutFee = assetBalance - fee;

        const newAmount = availableBalanceWithoutFee * multiplier;
        if (newAmount <= 0) {
            return;
        }

        amount.value = newAmount;
    };

    const stellarBalance = computed(() => {
        return useAssets(selectedWallet.value)
            .value.filter(asset => asset.name === AssetsTypes.TFT && asset.type === 'stellar')
            .shift()?.amount;
    });

    const substrateBalance = computed(() => {
        return useAssets(selectedWallet.value)
            .value.filter(asset => asset.name === AssetsTypes.TFT && asset.type === 'substrate')
            .shift()?.amount;
    });

    const init = async () => {
        const basePublicKey = route.params.basePublicKey;

        if (!basePublicKey) {
            console.error('Cant fetch data');
            return;
        }

        selectedWallet.value = <Wallet>(
            wallets.value.find(wallet => wallet.keyPair.getBasePublicKey() === basePublicKey)
        );

        await useDynamicBalance(selectedWallet.value);
        isLoading.value = false;
    };

    const submitBridge = async () => {
        isLoadingTransaction.value = true;

        if (!selectedWallet.value.keyPair) return;

        // Check if given amount is valid
        await isValidAmount(amount.value);
        if (errorAmountText.value != null) return;

        const substrateAddressTo = selectedWallet.value?.keyPair.getSubstrateKeyring().address;
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

        await bridgeToSubstrate(amount.value, selectedWallet.value.keyPair.getStellarKeyPair(), entityId);
        loadingSubtitle.value = 'Finishing up';
        isLoadingTransaction.value = false;
        console.log('Transaction done');
    };

    init();
</script>
