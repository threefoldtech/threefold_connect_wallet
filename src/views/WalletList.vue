<template>
    <MainLayout>
        <template #header>
            <PageHeader>
                <h1>wallets</h1>
            </PageHeader>
        </template>
        <template #fab>
            <FAB @click="router.push({ name: 'walletImport' })" />
        </template>
        <div class="p-4 space-y-2 flex flex-col">
            <WalletCard
                v-for="wallet in wallets"
                :balance="balances.find(t => t.id === wallet.keyPair.publicKey())"
                :name="wallet.name"
                @click="router.push({ name: 'walletOverview', params: { wallet: wallet.keyPair.publicKey() } })"
            />
        </div>
    </MainLayout>
</template>

<script lang="ts" setup>
    import MainLayout from '@/layouts/MainLayout.vue';
    import PageHeader from '@/components/header/PageHeader.vue';
    import FAB from '@/components/global/FAB.vue';
    import { getBalance, handleAccountRecord, balances, Wallet, wallets } from '../service/walletService';
    import { useRouter } from 'vue-router';
    import { onBeforeUnmount, ref } from 'vue';
    import { Server } from 'stellar-sdk';
    import WalletCard from '../components/WalletCard.vue';
    import flagsmith from 'flagsmith';
    import { getStellarClient } from '@/service/stellarService';
    import { ApiPromise, WsProvider } from '@polkadot/api';
    import types from './types.json';

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

    console.log('hi?');

    const provider = new WsProvider('wss://tfchain.test.threefold.io');

    const api = await ApiPromise.create({ provider, types });

    const [chain, nodeName, nodeVersion] = await Promise.all([
        api.rpc.system.chain(),
        api.rpc.system.name(),
        api.rpc.system.version(),
    ]);

    console.log(`You are connected to chain ${chain} using ${nodeName} v${nodeVersion}`);
</script>

<style scoped></style>
