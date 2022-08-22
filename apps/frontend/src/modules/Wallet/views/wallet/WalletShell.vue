<template>
    <MainLayout>
        <template #header>
            <PageHeader>
                <template #before>
                    <div class="relative -mt-1 -ml-1 rounded-xl p-1" v-touch:hold="enableHint">
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
                                class="inline-flex w-max items-center rounded-full rounded-tl-none bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800"
                            >
                                {{ $t('wallet.shell.hint') }}
                            </span>
                        </div>
                    </div>
                </template>
                <h1>{{ wallet.name }}</h1>
                <h2 class="text-xs font-normal text-gray-500">{{ wallet.name }}@{{ initializedUser }}</h2>
            </PageHeader>
        </template>
        <RouterView :key="`${$route.fullPath}`" />
        <template #navigation>
            <BottomNav />
        </template>
    </MainLayout>
</template>

<script lang="ts" setup>
    import { wallets } from '@/modules/Wallet/services/wallet.service';
    import { onBeforeUnmount, provide } from 'vue';
    import { useRoute } from 'vue-router';

    import MainLayout from '@/modules/Misc/layouts/MainLayout.vue';
    import BottomNav from '@/modules/Misc/components/nav/BottomNav.vue';
    import PageHeader from '@/modules/Misc/components/header/PageHeader.vue';
    import { initializedUser } from '@/modules/Core/services/crypto.service';
    import { balanceUtil } from '@/modules/Currency/utils/balance.util';
    import { useLocalStorage } from '@vueuse/core';
    import { IWallet } from 'shared-types/src/interfaces/global/wallet.interfaces';

    const route = useRoute();
    const wallet: IWallet = <IWallet>(
        wallets.value.find(w => w.keyPair.getStellarKeyPair().publicKey() === route.params.wallet)
    );
    const showWalletListHint = useLocalStorage('show-wallet-list-hint', true);
    const enableHint = () => (showWalletListHint.value = true);
    provide('wallet', wallet);

    const { cleanUp } = balanceUtil(wallet);

    onBeforeUnmount(cleanUp);
</script>

<style scoped></style>
