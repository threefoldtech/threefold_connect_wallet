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
                            <AssetIcon class="h-2" name="TFT" />
                        </div>
                    </div>
                    <div>Threefold Token (TFT)</div>

                    <p class="mt-10 text-sm font-semibold">Pay with</p>
                    <p class="mb-2 truncate text-gray-500">
                        {{ fromWallet.keyPair.getSubstrateKeyring().address }}
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
                            <AssetIcon class="h-2" name="TFT" />
                        </div>
                    </div>
                    <div>Threefold Token (TFT)</div>

                    <p class="mt-10 text-sm font-semibold">Pay with</p>
                    <p class="mb-2 truncate text-gray-500">
                        {{ fromWallet.keyPair.getStellarKeyPair().publicKey() }}
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

            <div v-else>Chain not found</div>

            <div class="mt-4 flex">
                <button class="flex-1 rounded-md bg-blue-600 px-4 py-2 text-white" @click="sendTransaction">
                    Confirm
                </button>
            </div>
        </div>
    </MainLayout>
</template>

<script lang="ts" setup>
    import MainLayout from '@/layouts/MainLayout.vue';
    import ArrowLeftIcon from '@heroicons/vue/outline/ArrowLeftIcon';
    import PageHeader from '@/components/header/PageHeader.vue';
    import { useRoute, useRouter } from 'vue-router';
    import flagsmith from 'flagsmith';
    import { wallets } from '@/service/walletService';
    import { ChainTypes } from '@/enums/chains.enums';
    import { buildFundedPaymentTransaction, submitFundedTransaction } from '@jimber/stellar-crypto';
    import AssetIcon from '@/components/AssetIcon.vue';
    import { sendTokens } from '@/service/substrateService';

    const router = useRouter();
    const allowedAssets: string[] = JSON.parse(<string>flagsmith.getValue('currencies')).map((a: any) => a.asset_code);

    const route = useRoute();

    const fromWallet = wallets.value?.find(w => w.keyPair.getStellarKeyPair().publicKey() === route.params.from);
    const toAddress = <string>route.params.to;
    const amount = Number(route.params.amount);
    const asset = <string>route.params.asset;
    const fee = Number(<string>flagsmith.getValue('fee-amount'));
    const chainName = route.params.chainName;

    const sendStellarTokens = async () => {
        if (!fromWallet || !toAddress || !amount || !asset) return router.push({ name: 'error' });
        const fundedTransaction = await buildFundedPaymentTransaction(
            fromWallet.keyPair.getStellarKeyPair(),
            toAddress,
            Number(amount),
            undefined,
            asset
        );
        console.log(fundedTransaction);

        const res = await submitFundedTransaction(fundedTransaction, fromWallet.keyPair.getStellarKeyPair());

        console.log(res);
        await router.push({ name: 'walletList' });
    };

    const sendSubstrateTokens = async () => {
        if (!fromWallet) {
            return;
        }
        await sendTokens(fromWallet.keyPair.getSubstrateKeyring(), toAddress);
    };

    const sendTransaction = async () => {
        if (chainName === ChainTypes.STELLAR) {
            await sendStellarTokens();
        }
        if (chainName === ChainTypes.SUBSTRATE) {
            await sendSubstrateTokens();
        }
    };
</script>

<style scoped></style>
