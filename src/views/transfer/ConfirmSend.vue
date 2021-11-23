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
            <div class="mt-4 break-words">
                <p>transaction</p>
                <p>from</p>
                <p>{{ fromWallet?.keyPair.publicKey() }}</p>
                <p>to</p>
                <p>{{ toAddress }}</p>
                <p>amount</p>
                <p>{{ amount }} {{ asset }}</p>
            </div>
            <div class="mt-4">
                <p>fee {{ fee.toFixed(7) }} asset</p>
            </div>
            <div class="mt-4 flex">
                <button class="px-4 py-2 text-white bg-blue-600 rounded-md flex-1" @click="sendTokens">Confirm</button>
            </div>
        </div>
    </MainLayout>
</template>

<script lang="ts" setup>
    import MainLayout from '@/layouts/MainLayout.vue';
    import ArrowLeftIcon from '@heroicons/vue/solid/ArrowLeftIcon';
    import UserIcon from '@heroicons/vue/solid/UserIcon';
    import PageHeader from '@/components/header/PageHeader.vue';
    import { useRoute, useRouter } from 'vue-router';
    import { Listbox, ListboxButton, ListboxLabel, ListboxOption, ListboxOptions } from '@headlessui/vue';
    import { CheckIcon, SelectorIcon } from '@heroicons/vue/solid';
    import { computed, ref, watch } from 'vue';
    import flagsmith from 'flagsmith';
    import { balances, Wallet, wallets } from '@/service/walletService';

    import { buildFundedPaymentTransaction, submitFundedTransaction } from '@jimber/stellar-crypto';

    const router = useRouter();
    const allowedAssets: string[] = JSON.parse(<string>flagsmith.getValue('currencies')).map((a: any) => a.asset_code);

    const route = useRoute();

    const fromWallet = wallets.value?.find(w => w.keyPair.publicKey() === route.params.from);
    const toAddress = <string>route.params.to;
    const amount = route.params.amount;
    const asset = <string>route.params.asset;
    const fee = Number(<string>flagsmith.getValue('fee-amount'));

    const sendTokens = async () => {
        if (!fromWallet || !toAddress || !amount || !asset) return router.push({ name: 'error' });
        const fundedTransaction = await buildFundedPaymentTransaction(
            fromWallet.keyPair,
            toAddress,
            Number(amount),
            undefined,
            asset
        );
        console.log(fundedTransaction);

        const res = await submitFundedTransaction(fundedTransaction, fromWallet.keyPair);

        console.log(res);
        await router.push({ name: 'walletList' });
    };
</script>

<style scoped></style>
