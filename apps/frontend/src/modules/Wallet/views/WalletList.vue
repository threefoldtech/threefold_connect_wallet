<template>
    <MainLayout>
        <template #header>
            <PageHeader>
                <template #before>
                    <XIcon v-if="showMove" class="text-orange-600" @click="showMove = false" />
                </template>
                <h1>{{ $t('walletList.title') }}</h1>
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
                        {{ $t('walletImport.tooltip') }}
                    </span>
                </div>
                <FAB :title="$t('walletImport.tooltip')" @click="router.push({ name: 'walletImport' })" />
            </div>
        </template>

        <div v-if="!showMove" class="flex flex-col space-y-4 p-4">
            <div
                v-if="wallets.filter(w => w.meta.type === 'NATIVE').length === 0"
                @click="router.push({ name: 'firstWalletInit' })"
            >
                <h2 class="truncate">Daily</h2>
                <div class="mt-2 flex flex-col rounded-2xl border p-4">
                    <div class="">
                        <button class="rounded-md bg-primary-600 px-4 py-2 text-white">
                            {{ $t('walletList.createInitialWallet') }}
                        </button>
                    </div>
                </div>
            </div>
            <WalletCard
                v-for="wallet in sortedWallets"
                v-touch:hold="enableMove"
                :balance="sortedBalances(wallet.keyPair.getBasePublicKey())"
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
    </MainLayout>
</template>

<script lang="ts" setup>
    import MainLayout from '@/modules/Misc/layouts/MainLayout.vue';
    import PageHeader from '@/modules/Misc/components/header/PageHeader.vue';
    import FAB from '@/modules/Misc/components/global/FAB.vue';
    import { SaveIcon, XIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/vue/outline';
    import { balances, Wallet, wallets } from '@/modules/Wallet/services/walletService';
    import { useRouter } from 'vue-router';
    import { computed, onBeforeUnmount, ref } from 'vue';
    import WalletCard from '../components/WalletCard.vue';

    import { useDynamicBalance } from '@/modules/Currency/utils/useDynamicBalance';
    import flagsmith from 'flagsmith';
    import { useLocalStorage, useToggle } from '@vueuse/core';
    import { orderAssets } from '@/modules/Currency/utils/order';

    const router = useRouter();

    wallets.value.forEach((wallet: Wallet) => {
        const { cleanUp } = useDynamicBalance(wallet);
        onBeforeUnmount(cleanUp);
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

    const sortedBalances = (basePublicKey: string) => {
        const relevantBalances = balances.value.find(t => t.id === basePublicKey);

        if (!relevantBalances) return;

        relevantBalances.assets = orderAssets(relevantBalances.assets);

        return relevantBalances;
    };
</script>

<style scoped></style>
