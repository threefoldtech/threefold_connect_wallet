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
        <div class="flex h-full flex-col p-4 pb-8" v-if="!isLoading">
            <div>
                <div class="mb-2 border-2 border-gray-200 p-4">
                    <div class="text-2xl font-semibold">Stellar tokens</div>
                    <div class="text-lg text-gray-500">{{ stellarBalance }} TFT</div>
                </div>
                <div class="flex w-full items-center justify-center">
                    <ArrowDownIcon class="h-6 text-primary-500"></ArrowDownIcon>
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

            <div class="pt-4">
                <button
                    @click="goToConfirmBridge"
                    class="bg-button-colored mt-4 w-full rounded-md py-2 px-4 text-lg font-semibold text-white"
                >
                    Transfer
                </button>
            </div>
        </div>
        <div v-else class="h-full w-full">
            <LoadingSpinner></LoadingSpinner>
        </div>
    </MainLayout>
</template>

<script lang="ts" setup>
    import { Wallet, wallets } from '@/service/walletService';
    import { useRoute, useRouter } from 'vue-router';
    import { computed, Ref, ref } from 'vue';
    import MainLayout from '@/layouts/MainLayout.vue';
    import PageHeader from '@/components/header/PageHeader.vue';
    import { ArrowLeftIcon, ArrowDownIcon } from '@heroicons/vue/solid';
    import LoadingSpinner from '@/components/global/LoadingSpinner.vue';
    import { AssetsTypes } from '@/enums/assets.enums';
    import { useDynamicBalance } from '@/util/useDynamicBalance';
    import { useAssets } from '@/util/useAssets';
    import flagsmith from 'flagsmith';

    const selectedWallet = ref<Wallet>() as Ref<Wallet>;

    const isLoading = ref<boolean>(true);

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

    const goToConfirmBridge = async () => {
        // Check if given amount is valid
        await isValidAmount(amount.value);
        if (errorAmountText.value != null) return;

        await router.replace({
            name: 'confirmBridge',
            params: {
                walletId: selectedWallet.value?.keyPair.getBasePublicKey(),
                amount: Number(amount.value),
            },
        });
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

    init();
</script>
