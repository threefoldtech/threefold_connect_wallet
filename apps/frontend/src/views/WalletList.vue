<template>
    <MainLayout>
        <template #header>
            <PageHeader>
                <template #before>
                    <XIcon v-if="showMove" class="text-orange-600" @click="showMove = false" />
                </template>
                <h1>My wallets</h1>
                <h2 v-if="showMove">moving</h2>
                <template #after>
                    <SaveIcon v-if="showMove" class="text-green-600" @click="showMove = false" />
                </template>
            </PageHeader>
        </template>
        <template #fab>
            <div v-touch:hold="enableHint" @click="showHint = false">
                <div class="absolute bottom-8 right-7">
                    <span
                        :class="{
                            hidden: !showHint,
                        }"
                        class="inline-flex items-center rounded-full rounded-br-none bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800"
                    >
                        Import Wallet
                    </span>
                </div>
                <FAB title="Import wallet" @click="router.push({ name: 'walletImport' })" />
            </div>
        </template>
        <div v-if="!showMove" class="flex flex-col space-y-4 p-4">
            <WalletCard
                v-for="wallet in sortedWallets"
                v-touch:hold="enableMove"
                :balance="balances.find(t => t.id === wallet.keyPair.getBasePublicKey())"
                :name="wallet.name"
                @click="
                    router.push({
                        name: 'walletOverview',
                        params: { wallet: wallet.keyPair.getStellarKeyPair().publicKey() },
                    })
                "
            />
        </div>
        <div v-if="showMove" class="flex flex-col space-y-2 p-4">
            <div v-for="(wallet, index) in sortedWallets">
                <div class="flex items-center justify-between">
                    <div class="flex-1">
                        <h3>{{ wallet.name }} {{ index }}</h3>
                    </div>
                    <div class="flex-1 text-right">
                        <button v-if="index !== 0">
                            <ArrowUpIcon class="h-6 w-6" />
                        </button>
                        <button v-if="index !== wallets.length - 1">
                            <ArrowDownIcon class="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div
            v-if="wallets.length === 0"
            class="flex flex-col rounded-2xl border p-4"
            @click="router.push({ name: 'firstWalletInit' })"
        >
            <div class="">
                <p class="font-semibold">Daily</p>
            </div>
            <div class="">
                <button class="rounded-md bg-primary-600 px-4 py-2 text-white">create initial wallet</button>
            </div>
        </div>
    </MainLayout>
</template>

<script lang="ts" setup>
    import MainLayout from '@/layouts/MainLayout.vue';
    import PageHeader from '@/components/header/PageHeader.vue';
    import FAB from '@/components/global/FAB.vue';
    import { SaveIcon, XIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/vue/outline';
    import { balances, Wallet, wallets } from '@/service/walletService';
    import { useRouter } from 'vue-router';
    import { computed, onBeforeUnmount, ref } from 'vue';
    import WalletCard from '../components/WalletCard.vue';

    import { getSubstrateAssetBalances } from '@/service/substrateService';
    import { useDynamicBalance } from '@/util/useDynamicBalance';
    import flagsmith from 'flagsmith';
    import { useLocalStorage, useToggle } from '@vueuse/core';

    const router = useRouter();

    wallets.value.forEach((wallet: Wallet) => {
        const { cleanUp } = useDynamicBalance(wallet);
        onBeforeUnmount(cleanUp);
    });

    wallets.value.forEach(async (wallet: Wallet) => {
        const assetBalances = await getSubstrateAssetBalances(wallet.keyPair.getSubstrateKeyring().address);
    });
    const showMove = ref(false);

    const showHint = useLocalStorage('show-import-wallet-hint', true);
    const enableHint = () => {
        showHint.value = true;
    };

    const enableMove = () => {
        if (!flagsmith.hasFeature('can-move-wallets')) return;

        if (wallets.value.length <= 1) return;
        showMove.value = true;
    };

    const sortedWallets = computed(() => {
        return wallets.value.sort((a, b) => {
            if (a.name < b.name) return -1;
            if (a.name > b.name) return 1;
            return 0;
        });
    });
</script>

<style scoped></style>
