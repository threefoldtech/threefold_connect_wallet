<template>
    <RouterView :key="$route.fullPath" />
</template>

<script lang="ts" setup>
    import { getBalance, handleAccountRecord, Wallet, wallets } from '@/service/walletService';
    import { onBeforeUnmount, ref } from 'vue';
    import { useRoute } from 'vue-router';
    import { getStellarClient } from '@/service/stellarService';

    const route = useRoute();
    const wallet: Wallet = <Wallet>wallets.value.find(w => w.keyPair.publicKey() === route.params.wallet);
    const stream = ref();

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
