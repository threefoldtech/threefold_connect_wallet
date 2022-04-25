<template>
    <MainLayout>
        <template #header>
            <PageHeader>
                <template #before>
                    <div class="-mt-1 -ml-1 p-1 rounded-xl relative" v-touch:hold="enableHint">
                        <svg
                            @click="
                                showWalletListHint = false;
                                $router.push({ name: 'walletList' });
                            "
                            xmlns="http://www.w3.org/2000/svg"
                            width="32"
                            height="32"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"></path>
                            <path d="M4 6v12c0 1.1.9 2 2 2h14v-4"></path>
                            <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"></path>
                        </svg>
                        <div class="absolute top-7 left-7 z-20" @click="showWalletListHint = false">
                            <span
                                :class="{
                                    hidden: !showWalletListHint,
                                }"
                                class="inline-flex items-center rounded-full rounded-tl-none bg-blue-100 px-3 w-max py-1 text-xs font-medium text-blue-800"
                            >
                                {{ $t('wallet.shell.hint') }}
                            </span>
                        </div>
                    </div>
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
    import { useLocalStorage } from '@vueuse/core';

    const route = useRoute();
    const wallet: Wallet = <Wallet>(
        wallets.value.find(w => w.keyPair.getStellarKeyPair().publicKey() === route.params.wallet)
    );
    const showWalletListHint = useLocalStorage('show-wallet-list-hint', true);
    const enableHint = () => (showWalletListHint.value = true);
    provide('wallet', wallet);

    const { cleanUp } = useDynamicBalance(wallet);

    onBeforeUnmount(cleanUp);
</script>

<style scoped></style>
