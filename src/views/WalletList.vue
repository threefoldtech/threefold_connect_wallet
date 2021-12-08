<template>
    <MainLayout>
        <template #header>
            <PageHeader>
                <template #before>
                    <XIcon v-if="showMove" class="text-orange-600" @click="showMove = false" />
                </template>
                <h1>wallets</h1>
                <h2 v-if="showMove">moving</h2>
                <template #after>
                    <SaveIcon v-if="showMove" class="text-green-600" @click="showMove = false" />
                </template>
            </PageHeader>
        </template>
        <template #fab>
            <FAB @click="router.push({ name: 'walletImport' })" />
        </template>
        <div v-if="!showMove" class="p-4 space-y-2 flex flex-col">
            <WalletCard
                v-for="wallet in sortedWallets"
                v-touch:hold="enableMove"
                :balance="balances.find(t => t.id === wallet.keyPair.publicKey())"
                :name="wallet.name"
                @click="router.push({ name: 'walletOverview', params: { wallet: wallet.keyPair.publicKey() } })"
            />
        </div>
        <div v-if="showMove" class="p-4 space-y-2 flex flex-col">
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
            class="rounded-2xl border p-4 flex flex-col"
            @click="router.push({ name: 'firstWalletInit' })"
        >
            <div class="">
                <p class="font-semibold">Daily</p>
            </div>
            <div class="">
                <button class="px-4 bg-primary-600 text-white py-2 rounded-md">create initial wallet</button>
            </div>
        </div>
    </MainLayout>
</template>

<script lang="ts" setup>
    import MainLayout from '@/layouts/MainLayout.vue';
    import PageHeader from '@/components/header/PageHeader.vue';
    import FAB from '@/components/global/FAB.vue';
    import { SaveIcon, XIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/vue/outline';
    import { getBalance, handleAccountRecord, balances, Wallet, wallets } from '@/service/walletService';
    import { useRouter } from 'vue-router';
    import { computed, onBeforeUnmount, ref } from 'vue';
    import WalletCard from '../components/WalletCard.vue';
    import { getStellarClient } from '@/service/stellarService';

    const router = useRouter();

    const streams = ref<(() => void)[]>([]);
    wallets.value.forEach(async (wallet: Wallet) => {
        const result = await getBalance(wallet);
        handleAccountRecord(wallet, result);
        const server = getStellarClient();
        const closeHandler = server
            .accounts()
            .accountId(wallet.keyPair.publicKey())
            // .join('transactions')
            .stream({
                onmessage: res => handleAccountRecord(wallet, res),
            });
        streams.value.push(closeHandler);
    });
    onBeforeUnmount(() => {
        streams.value.forEach(closeHandler => closeHandler());
    });

    const showMove = ref(false);
    const enableMove = () => {
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
