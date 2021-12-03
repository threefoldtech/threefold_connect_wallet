<template>
    <MainLayout>
        <template #header>
            <PageHeader>
                <template #before>
                    <ArrowLeftIcon @click="$router.push({ name: 'walletList' })" />
                </template>
                <h1>{{ wallet.name }}</h1>
                <h2 class="text-xs font-normal text-gray-500">{{ wallet.name }}@{{ userInitialized }}</h2>
            </PageHeader>
        </template>
        <RouterView :key="$route.fullPath" />
        <template #navigation>
            <BottomWalletNav />
        </template>
    </MainLayout>
</template>

<script lang="ts" setup>
    import { getBalance, handleAccountRecord, Wallet, wallets } from '@/service/walletService';
    import { onBeforeUnmount, provide, ref } from 'vue';
    import { useRoute } from 'vue-router';
    import { getStellarClient } from '@/service/stellarService';
    import { ArrowLeftIcon } from '@heroicons/vue/outline';

    import MainLayout from '@/layouts/MainLayout.vue';
    import BottomWalletNav from '@/components/nav/BottomWalletNav.vue';
    import PageHeader from '@/components/header/PageHeader.vue';
    import { userInitialized } from '@/service/cryptoService';

    const route = useRoute();
    const wallet: Wallet = <Wallet>wallets.value.find(w => w.keyPair.publicKey() === route.params.wallet);
    const stream = ref();

    provide('wallet', wallet);

    const init = async () => {
        const result = await getBalance(wallet);
        handleAccountRecord(wallet, result);

        const server = getStellarClient();
        stream.value = server
            .accounts()
            .accountId(wallet.keyPair.publicKey())
            // .join('transactions')
            .stream({
                onmessage: res => handleAccountRecord(wallet, res),
            });
    };

    init();

    onBeforeUnmount(() => {
        const closeHandle = stream.value;
        if (!closeHandle) return;
        closeHandle();
    });
</script>

<style scoped></style>
