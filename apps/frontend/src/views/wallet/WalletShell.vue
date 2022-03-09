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
        <RouterView :key="`${$route.fullPath}`" />
        <template #navigation>
            <BottomNav />
        </template>
    </MainLayout>
</template>

<script lang="ts" setup>
    import { Wallet, wallets } from '@/service/walletService';
    import { computed, onBeforeUnmount, provide } from 'vue';
    import { useRoute } from 'vue-router';
    import { ArrowLeftIcon } from '@heroicons/vue/outline';

    import MainLayout from '@/layouts/MainLayout.vue';
    import BottomNav from '@/components/nav/BottomNav.vue';
    import PageHeader from '@/components/header/PageHeader.vue';
    import { userInitialized } from '@/service/cryptoService';
    import { useDynamicBalance } from '@/util/useDynamicBalance';

    const route = useRoute();
    const wallet: Wallet = <Wallet>(
        wallets.value.find(w => w.keyPair.getStellarKeyPair().publicKey() === route.params.wallet)
    );
    console.log('loading wallet');

    provide('wallet', wallet);

    const { cleanUp } = useDynamicBalance(wallet);

    onBeforeUnmount(cleanUp);
</script>

<style scoped></style>
